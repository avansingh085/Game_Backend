const transporter=require('../config/nodemailer');
const sendMail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Your App Name" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

module.exports=sendMail;