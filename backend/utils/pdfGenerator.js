const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const drawText = (page, text, x, y, options) => {
    const defaultOptions = { size: 10, font: options.font, color: rgb(0, 0, 0) };
    page.drawText(String(text || ''), { x, y, ...defaultOptions, ...options });
};

const drawLine = (page, y, margin = 50, thickness = 1, color = rgb(0.7, 0.7, 0.7)) => {
    const { width } = page.getSize();
    page.drawLine({
        start: { x: margin, y },
        end: { x: width - margin, y },
        thickness,
        color,
    });
};

async function generatePrescriptionPdf(prescriptionData) {
    const { 
        doctor, patient, date, medications, appointmentId, pharmacy 
    } = prescriptionData;
    
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let y = height - 50;

    
    drawText(page, `Dr. ${doctor.name}`, 50, y, { font: boldFont, size: 20 });
    drawText(page, doctor.specialization || 'General Practice', 50, y - 15, { font: font, size: 10, color: rgb(0.3, 0.3, 0.3) });
    drawText(page, `NPI: ${doctor.npi || '1234567890'} | DEA: ${doctor.dea || 'AB1234567'}`, 50, y - 28, { font: font, size: 9 });
    
    drawText(page, 'PRESCRIPTION', width - 150, y, { font: boldFont, size: 18 });
    drawText(page, `Date: ${date}`, width - 150, y - 15, { font: font, size: 10 });
    y -= 50;
    drawLine(page, y, 50, 1.5);
    y -= 30;

    
    drawText(page, 'For Patient:', 50, y, { font: boldFont, size: 12 });
    drawText(page, `Name: ${patient.name}`, 50, y - 15, { font: font, size: 11 });
    drawText(page, `Date of Birth: ${patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'}`, 50, y - 30, { font: font, size: 11 });
    
    y -= 60;
    drawText(page, 'Rx', 50, y, { font: boldFont, size: 28, color: rgb(0.1, 0.1, 0.1) });
    y -= 30;
    
    
    medications.forEach(med => {
        drawText(page, `${med.medication} ${med.dosage}`, 70, y, { font: boldFont, size: 14 });
        drawText(page, `Sig: ${med.frequency} for ${med.duration}`, 75, y - 20, { font: font, size: 11 });
        y -= 45;
    });

    if (pharmacy) {
       y -= 20;
       drawLine(page, y, 70, 0.5);
       y -= 25;
       drawText(page, 'To Be Filled By:', 70, y, { font: boldFont, size: 10 });
       drawText(page, pharmacy.name, 70, y - 12, { font: font, size: 10 });
       drawText(page, pharmacy.address, 70, y - 24, { font: font, size: 9 });
       drawText(page, `Email: ${pharmacy.email}`, 70, y - 36, { font: font, size: 9 });
    }

    
    const footerY = 80;
    drawLine(page, footerY);
    drawText(page, `(Digitally Signed) Dr. ${doctor.name}`, width - 200, footerY - 20, { font: font, size: 11 });
    drawText(page, `Appointment Ref: #${appointmentId}`, 50, 40, { font: font, size: 8, color: rgb(0.5, 0.5, 0.5) });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}

async function generateInvoicePdf(invoiceData) {
    const { appointmentId, patient, doctor, serviceName, date, fee, payment_intent_id } = invoiceData;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let y = height - 50;

    
    drawText(page, 'INVOICE', 50, y, { font: boldFont, size: 28 });
    drawText(page, `Invoice #: INV-${appointmentId}`, width - 200, y + 10, { font: font, size: 10 });
    drawText(page, `Date Issued: ${new Date(date).toLocaleDateString()}`, width - 200, y, { font: font, size: 10 });

    y -= 50;
    
    
    drawText(page, 'BILL TO', 50, y, { font: boldFont, size: 10, color: rgb(0.5, 0.5, 0.5) });
    drawText(page, patient.name, 50, y - 15, { font: boldFont, size: 12 });
    drawText(page, patient.email, 50, y - 30, { font: font, size: 10 });
    
    y -= 70;

    
    const tableTop = y;
    drawText(page, 'DESCRIPTION', 50, tableTop, { font: boldFont, size: 11 });
    drawText(page, 'AMOUNT', width - 100, tableTop, { font: boldFont, size: 11 });
    y -= 10;
    drawLine(page, y, 50, 1.5, rgb(0,0,0));
    y -= 25;
    
    
    drawText(page, `Telehealth Consultation with Dr. ${doctor.name}`, 50, y, { font: font });
    drawText(page, `$${parseFloat(fee).toFixed(2)}`, width - 100, y, { font: font });
    y -= 15;
    drawText(page, `Service: ${serviceName || 'General Consultation'}`, 55, y, { font: font, size: 9, color: rgb(0.4, 0.4, 0.4) });
    y -= 30;
    
    drawLine(page, y);
    y-= 20;

    
    drawText(page, 'Total', width - 200, y, { font: boldFont });
    drawText(page, `$${parseFloat(fee).toFixed(2)}`, width - 100, y, { font: boldFont, size: 12 });
    
    
    const paymentY = y - 50;
    drawText(page, 'Payment Details', 50, paymentY, { font: boldFont, size: 11 });
    drawLine(page, paymentY - 5, 50, 1, rgb(0,0,0));
    drawText(page, `Paid in Full on: ${new Date(date).toLocaleDateString()}`, 50, paymentY - 20, { font: font });
    drawText(page, `Billed to: ${patient.email}`, 50, paymentY - 35, { font: font });
    drawText(page, `Transaction ID: ${payment_intent_id || 'N/A'}`, 50, paymentY - 50, { font: font });

    drawText(page, 'Thank you!', 50, 80, { font: boldFont, size: 14 });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}

module.exports = {
    generatePrescriptionPdf,
    generateInvoicePdf,
}