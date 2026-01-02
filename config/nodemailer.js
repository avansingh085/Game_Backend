const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { MailtrapTransport } = require("mailtrap");
dotenv.config();

const transport = nodemailer.createTransport(
    MailtrapTransport({
        token: process.env.MAILTRAP_TOKEN,
    })
);


const recipients = [
    "avansingh085@gmail.com",
];
// const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: 443,
//     secure: false,
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
//     tls: {
//         rejectUnauthorized: false
//     }
// });

// transporter.verify((error, success) => {
//     if (error) {
//         console.error("Nodemailer connection error:", error);
//     } else {
//         console.log("Nodemailer is ready to send emails");
//     }
// });

module.exports = transport;