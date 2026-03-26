const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendNewMessageNotification(userEmail, senderName, message) {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 500px;">
            <h2 style="color: #667eea;">Think Tank AI</h2>
            <p>New message from <strong>${senderName}</strong>:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
                ${message.substring(0, 150)}
            </div>
            <a href="https://think-tank-ai-phi.vercel.app" 
               style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
                Reply Now
            </a>
        </div>
    `;
    
    await transporter.sendMail({
        from: '"Think Tank AI" <noreply@thinktankai.com>',
        to: userEmail,
        subject: 'New Message from Think Tank AI',
        html: html
    });
}

async function sendSessionBookedEmail(userEmail, mentorName, sessionType, date) {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 500px;">
            <h2 style="color: #667eea;">Think Tank AI</h2>
            <p>Your <strong>${sessionType}</strong> session with <strong>${mentorName}</strong> is booked!</p>
            <p>Date: ${date}</p>
            <a href="https://think-tank-ai-phi.vercel.app" 
               style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
                Go to Dashboard
            </a>
        </div>
    `;
    
    await transporter.sendMail({
        from: '"Think Tank AI" <noreply@thinktankai.com>',
        to: userEmail,
        subject: 'Session Booked! - Think Tank AI',
        html: html
    });
}

module.exports = { sendNewMessageNotification, sendSessionBookedEmail };
