const Tesseract = require('tesseract.js');
const stringSimilarity = require('string-similarity');
const axios = require('axios');

/**
 * Normalizes text by converting to uppercase, removing special characters, and trimming.
 */
const normalizeText = (text) => {
    if (!text) return '';
    return text.toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

const extractPAN = (text) => {
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]/;
    const match = text.match(panRegex);
    return match ? match[0] : null;
};

const extractAadhaar = (text) => {
    const aadhaarRegex = /\d{4}\s\d{4}\s\d{4}/;
    const match = text.match(aadhaarRegex);
    return match ? match[0] : null;
};

const extractName = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
    console.log('[KYC Heuristic] Analyzing lines for name extraction...');

    // Heuristic 1: Look for "NAME" keyword
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toUpperCase();
        if (line.includes('NAME') && !line.includes('FATHER') && i + 1 < lines.length) {
            const foundName = normalizeText(lines[i + 1]);
            return foundName;
        }
    }

    // Heuristic 2: For PAN Cards, the name is often on the 2nd or 3rd line if the 1st is "INCOME TAX DEPARTMENT"
    // We look for the first line that is purely uppercase and has more than 2 words
    const potentialNames = lines.filter(l => {
        const normalized = normalizeText(l);
        return /^[A-Z\s]+$/.test(normalized) && normalized.split(' ').length >= 2 &&
            !normalized.includes('DEPARTMENT') && !normalized.includes('INDIA') &&
            !normalized.includes('GOVERNMENT');
    });

    if (potentialNames.length > 0) {
        // Usually the first uppercase block that follows the header is the Name
        const found = normalizeText(potentialNames[0]);
        console.log(`[KYC Heuristic] Found potential name block: ${found}`);
        return found;
    }

    return null;
};

/**
 * Extracts DOB from text.
 */
const extractDOB = (text) => {
    const dobRegex = /(\d{2}[\/\-]\d{2}[\/\-]\d{4})/;
    const match = text.match(dobRegex);
    return match ? match[1] : null;
};

const verifyDocument = async (imageData, client) => {
    const logs = [];
    const addLog = (msg) => {
        console.log(`[KYC PROCESS] ${msg}`);
        logs.push({ timestamp: new Date(), message: msg });
    };

    try {
        addLog('Starting OCR process...');
        let buffer;

        if (imageData.startsWith('http')) {
            addLog(`Fetching image from S3 URL: ${imageData}`);
            const response = await axios.get(imageData, { responseType: 'arraybuffer' });
            buffer = Buffer.from(response.data);
            addLog(`Image fetched successfully (${buffer.length} bytes).`);
        } else if (imageData.includes('base64,')) {
            const base64Data = imageData.split(',')[1];
            buffer = Buffer.from(base64Data, 'base64');
            addLog(`Buffer created from Base64 string (${buffer.length} bytes).`);
        } else {
            buffer = Buffer.from(imageData, 'base64');
            addLog(`Buffer created from raw data (${buffer.length} bytes).`);
        }

        if (!buffer || buffer.length < 500) {
            throw new Error(`Corrupted or too small image file (${buffer?.length || 0} bytes).`);
        }

        addLog('Initializing Tesseract...');

        const { data: { text } } = await Tesseract.recognize(buffer, 'eng', {
            logger: m => {
                if (m.status === 'recognizing text') {
                    const progress = Math.round(m.progress * 100);
                    if (progress % 25 === 0) addLog(`OCR Progress: ${progress}%`);
                }
            }
        });

        addLog('OCR completed. Analyzing text...');
        const normalizedRaw = text.toUpperCase();

        const extractedPAN = extractPAN(normalizedRaw);
        const extractedAadhaar = extractAadhaar(normalizedRaw);
        const extractedName = extractName(text);
        const extractedDOB = extractDOB(text);

        let detectedType = 'Unknown';
        if (extractedPAN) detectedType = 'PAN';
        else if (extractedAadhaar) detectedType = 'Aadhaar';

        addLog(`Detected Type: ${detectedType}`);
        addLog(`Extracted Data: Name[${extractedName || 'N/A'}] ID[${extractedPAN || extractedAadhaar || 'N/A'}] DOB[${extractedDOB || 'N/A'}]`);

        const normalizedClientName = normalizeText(client.name);
        addLog(`Comparing with Client Profile: ${normalizedClientName}`);

        let nameScore = 0;
        if (extractedName && normalizedClientName) {
            nameScore = stringSimilarity.compareTwoStrings(extractedName, normalizedClientName);
            addLog(`Name Similarity Score: ${(nameScore * 100).toFixed(2)}%`);
        } else {
            addLog('Name comparison skipped (missing data)');
        }

        const isIdValid = !!extractedPAN || !!extractedAadhaar;
        const totalScore = (nameScore * 0.5) + (isIdValid ? 0.5 : 0);

        const status = totalScore > 0.8 ? 'verified' : 'flagged';
        addLog(`Verification result: ${status.toUpperCase()} (Total Score: ${totalScore.toFixed(2)})`);

        return {
            status,
            score: totalScore,
            detectedType,
            extracted: {
                name: extractedName,
                idNumber: extractedPAN || extractedAadhaar,
                dob: extractedDOB
            },
            logs,
            rawText: text
        };
    } catch (err) {
        addLog(`ERROR: ${err.message}`);
        console.error('KYC Service Error:', err);
        return { status: 'failed', error: err.message, logs };
    }
};

module.exports = { verifyDocument, normalizeText };
