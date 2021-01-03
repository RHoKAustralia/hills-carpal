import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'email-smtp.ap-southeast-2.amazonaws.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

type Email = {
  to: string;
  subject: string;
  html: string;
};

export default async function sendEmail(email: Email) {
  // console.log(email);
  // await transporter.sendMail({
  //   to: email.to,
  //   html: email.html,
  //   from: 'no-reply@ride.carpal.org.au',
  // });
}
