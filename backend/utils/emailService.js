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
// backend/utils/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send email function
async function sendEmail(to, subject, html) {
    try {
        const info = await transporter.sendMail({
            from: '"Think Tank AI" <noreply@thinktankai.com>',
            to: to,
            subject: subject,
            html: html
        });
        console.log('Email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
}

// Send notification for new message
async function sendNewMessageNotification(userEmail, senderName, message) {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Think Tank AI</h1>
            </div>
            <div style="padding: 20px;">
                <h2 style="color: #1e293b;">New Message!</h2>
                <p>You have a new message from <strong>${senderName}</strong>:</p>
                <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p style="margin: 0; color: #334155;">${message.substring(0, 150)}${message.length > 150 ? '...' : ''}</p>
                </div>
                <a href="https://think-tank-ai-phi.vercel.app" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 15px;">
                    Reply Now
                </a>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 12px;">This is an automated message from Think Tank AI. Please do not reply.</p>
            </div>
        </div>
    `;
    return sendEmail(userEmail, '📨 New Message from Think Tank AI', html);
}

// Send notification for session booking
async function sendSessionBookedEmail(userEmail, mentorName, sessionType, date) {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Think Tank AI</h1>
            </div>
            <div style="padding: 20px;">
                <h2 style="color: #1e293b;">🎉 Session Confirmed!</h2>
                <p>Your <strong>${sessionType}</strong> session with <strong>${mentorName}</strong> has been booked.</p>
                <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>📅 Date:</strong> ${date}</p>
                    <p><strong>👨‍🏫 Mentor:</strong> ${mentorName}</p>
                    <p><strong>🎥 Session Type:</strong> ${sessionType}</p>
                </div>
                <a href="https://think-tank-ai-phi.vercel.app" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 15px;">
                    Go to Dashboard
                </a>
            </div>
        </div>
    `;
    return sendEmail(userEmail, '🎉 Session Booked! - Think Tank AI', html);
}

module.exports = { sendEmail, sendNewMessageNotification, sendSessionBookedEmail };
