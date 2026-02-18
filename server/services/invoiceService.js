const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoice = (file, res) => {
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${file.name}.pdf`);

    doc.pipe(res);

    // Header
    doc.fillColor('#444444')
        .fontSize(20)
        .text('INVOICE', 50, 57)
        .fontSize(10)
        .text('HackReserve', 200, 50, { align: 'right' })
        .text('123 Tech Street', 200, 65, { align: 'right' })
        .text('New Delhi, India', 200, 80, { align: 'right' })
        .moveDown();

    // Invoice Details
    doc.text(`Invoice Number: INV-${file._id.toString().slice(-6).toUpperCase()}`, 50, 200)
        .text(`Invoice Date: ${new Date().toLocaleDateString()}`, 50, 215)
        .text(`Balance Due: ${(file.billingAmount || 0) - (file.receivedAmount || 0)}`, 50, 230)
        .text(`Client Name: ${file.clientName}`, 300, 200)
        .text(`File Name: ${file.name}`, 300, 215)
        .moveDown();

    // Table Header
    const invoiceTableTop = 330;
    doc.font("Helvetica-Bold");
    generateTableRow(doc, invoiceTableTop, "Item", "Description", "Cost");
    generateHr(doc, invoiceTableTop + 20);
    doc.font("Helvetica");

    // Table Item
    const position = invoiceTableTop + 30;
    generateTableRow(doc, position, "ITR Filing", `Professional Fees for ${file.name}`, (file.billingAmount || 0).toLocaleString());
    generateHr(doc, position + 20);

    // Total
    const subtotalPosition = position + 30;
    doc.font("Helvetica-Bold");
    generateTableRow(doc, subtotalPosition, "", "Total", (file.billingAmount || 0).toLocaleString());

    // Footer
    doc.fontSize(10)
        .text('Payment is due within 15 days. Thank you for your business.', 50, 700, { align: 'center', width: 500 });

    doc.end();
};

function generateTableRow(doc, y, item, description, lineTotal) {
    doc.fontSize(10)
        .text(item, 50, y)
        .text(description, 150, y)
        .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
    doc.strokeColor("#aaaaaa")
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke();
}

module.exports = { generateInvoice };
