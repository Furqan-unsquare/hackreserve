const { Upload } = require('@aws-sdk/lib-storage');
const s3Client = require('../config/s3Config');
const crypto = require('crypto');

/**
 * Uploads binary data to S3 and returns the public URL
 * @param {Buffer|String} data - Buffer or Base64 string
 * @param {String} fileName - Original file name
 * @param {String} mimeType - Content type
 */
const uploadToS3 = async (data, fileName, mimeType = 'image/jpeg') => {
    let buffer;
    let extension = 'jpeg'; // Default

    if (Buffer.isBuffer(data)) {
        buffer = data;
    } else if (typeof data === 'string' && data.startsWith('data:')) {
        // Base64 string from data URI: data:image/png;base64,xxxx
        const meta = data.split(';')[0];
        const mime = meta.split(':')[1];
        if (mime) {
            extension = mime.split('/')[1] || 'jpeg';
        }
        const base64Data = data.split(';base64,').pop();
        buffer = Buffer.from(base64Data, 'base64');
    } else {
        buffer = Buffer.from(data, 'base64');
    }

    const uniqueKey = `docs/${crypto.randomBytes(16).toString('hex')}.${extension}`;

    const parallelUploads3 = new Upload({
        client: s3Client,
        params: {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: uniqueKey,
            Body: buffer,
            ContentType: mimeType,
        },
    });

    await parallelUploads3.done();

    // Construct the public URL
    // Note: This assumes the bucket is public or has appropriate policies
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueKey}`;

};

module.exports = { uploadToS3 };
