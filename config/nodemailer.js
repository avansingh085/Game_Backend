const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
console.log(process.env.EMAIL_HOST, process.env.EMAIL_PORT)

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error("Nodemailer connection error:", error);
    } else {
        console.log("Nodemailer is ready to send emails");
    }
});

module.exports = transporter;