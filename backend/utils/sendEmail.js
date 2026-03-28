import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", 
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
};

export default sendEmail;