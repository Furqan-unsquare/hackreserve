const Tesseract = require('tesseract.js');
const stringSimilarity = require('string-similarity');

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

/**
 * Extracts PAN number from text using regex.
 */
const extractPAN = (text) => {
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]/;
    const match = text.match(panRegex);
    return match ? match[0] : null;
};

/**
 * Extracts Name from text (heuristic-based).
 */
const extractName = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);

    console.log('[KYC Heuristic] Analyzing lines for name extraction...');

    // Heuristic: Name is often after "NAME"
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toUpperCase();
        if (line.includes('NAME') && !line.includes('FATHER') && i + 1 < lines.length) {
            const foundName = normalizeText(lines[i + 1]);
            console.log(`[KYC Heuristic] Found name after "NAME" keyword: ${foundName}`);
            return foundName;
        }
    }

    // Fallback: look for the longest uppercase-only line that isn't the ID itself
    const blocks = lines.filter(l => /^[A-Z\s]+$/.test(l) && l.length > 5 && !/[0-9]/.test(l));
    const foundBlock = blocks[0] ? normalizeText(blocks[0]) : null;
    if (foundBlock) console.log(`[KYC Heuristic] Falling back to longest uppercase block: ${foundBlock}`);
    return foundBlock;
};

/**
 * Extracts DOB from text.
 */
const extractDOB = (text) => {
    const dobRegex = /(\d{2}[\/\-]\d{2}[\/\-]\d{4})/;
    const match = text.match(dobRegex);
    return match ? match[1] : null;
};

/**
 * Performs KYC verification on a Base64 image.
 */
const verifyDocument = async (base64Image, client) => {
    const logs = [];
    const addLog = (msg) => {
        console.log(`[KYC PROCESS] ${msg}`);
        logs.push({ timestamp: new Date(), message: msg });
    };

    try {
        addLog('Starting OCR process...');
        const base64Data = base64Image.split(',')[1];
        if (!base64Data) throw new Error('Invalid Base64 format');

        const buffer = Buffer.from(base64Data, 'base64');
        addLog(`Buffer created (${buffer.length} bytes). Initializing Tesseract...`);

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
        const extractedName = extractName(text);
        const extractedDOB = extractDOB(text);

        addLog(`Extracted Data: Name[${extractedName || 'N/A'}] ID[${extractedPAN || 'N/A'}] DOB[${extractedDOB || 'N/A'}]`);

        const normalizedClientName = normalizeText(client.name);
        addLog(`Comparing with Client Profile: ${normalizedClientName}`);

        let nameScore = 0;
        if (extractedName && normalizedClientName) {
            nameScore = stringSimilarity.compareTwoStrings(extractedName, normalizedClientName);
            addLog(`Name Similarity Score: ${(nameScore * 100).toFixed(2)}%`);
        } else {
            addLog('Name comparison skipped (missing data)');
        }

        const isIdValid = !!extractedPAN;
        const totalScore = (nameScore * 0.5) + (isIdValid ? 0.5 : 0);

        const status = totalScore > 0.8 ? 'verified' : 'flagged';
        addLog(`Verification result: ${status.toUpperCase()} (Total Score: ${totalScore.toFixed(2)})`);

        return {
            status,
            score: totalScore,
            extracted: {
                name: extractedName,
                idNumber: extractedPAN,
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
