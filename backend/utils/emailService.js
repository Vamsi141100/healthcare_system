const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false 
    }
});

const sendEmail = async (mailOptions) => {
    try {
        
        const optionsWithFrom = {
            from: `"Health Hub" <${process.env.EMAIL_USER}>`,
            ...mailOptions
        };
        
        console.log(`Attempting to send email to: ${optionsWithFrom.to}`);
        const info = await transporter.sendMail(optionsWithFrom);
        
        console.log(`Email sent successfully to ${optionsWithFrom.to}: ${info.messageId}`);
        return info; 
        
    } catch (error) {
        console.error(`Error sending email to ${mailOptions.to}:`, error);
        
        throw new Error('Failed to send email.');
    }
};

module.exports = { sendEmail };