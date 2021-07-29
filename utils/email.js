const nodemailer = require('nodemailer');

const sendEmail = async options => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    const mailOptions = {
        from: options.contact ? `${options.name} <${options.email}>` : process.env.EMAIL_FROM,
        to: options.contact ? process.env.EMAIL_FROM : options.email,
        subject: options.subject,
        text: options.message,
    }
    console.log(process.env.EMAIL_PORT);

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;