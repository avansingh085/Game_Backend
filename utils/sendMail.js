const transport=require('../config/nodemailer');

const sender = {
    address: "gamezone@demomailtrap.co",
    name: "GameZone",
};
const sendMail = async (to, subject, text) => {
    try {
     const info=  await  transport
    .sendMail({
        from: sender,
        to: to,
        subject:subject||"",
        text:text||"",
        category: "Integration Test",
    })
    
        
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

module.exports=sendMail;