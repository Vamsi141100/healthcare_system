const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const info = await transporter.sendMail({
            from: `"Health Hub" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });
        console.log(`Email sent successfully to ${to}: ${info.messageId}`);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
        
    }
};

module.exports = { sendEmail };