// using : Nodemailer package
const nodemailer = require("nodemailer");
const sendEmail = async (options) => {
  // 1)create transporter  (service that will send Email like :(Gmail-MailGun-Mailtrap-sendGrid))
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, // if secure false : port = 587, if true = 465
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      // اليوزر اللي هيبعت الايميل
      pass: process.env.EMAIL_PASS,
      //   pass of that email
    },
  });
  //   2)Define Email Options like(from-to-subject-content-email form)
  const mailOpts = {
    from: "E-shop App <abdallahoosny@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3)send Email
  await transporter.sendMail(mailOpts);
};
module.exports = sendEmail;
