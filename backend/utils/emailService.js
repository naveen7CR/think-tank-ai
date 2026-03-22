const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendEmail(to, subject, html) {
    try {
        await transporter.sendMail({
            from: '"Think Tank AI" <noreply@thinktankai.com>',
            to,
            subject,
            html
        });
        return true;
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
}

async function sendNewMessageNotification(userEmail, mentorName, message) {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 500px;">
            <h2 style="color: #667eea;">Think Tank AI</h2>
            <p>You have a new message from <strong>${mentorName}</strong>:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
                ${message}
            </div>
            <a href="https://think-tank-ai-phi.vercel.app" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">Reply Now</a>
        </div>
    `;
    return sendEmail(userEmail, 'New Message from Think Tank AI', html);
}

module.exports = { sendEmail, sendNewMessageNotification };