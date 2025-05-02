const nodemailer = require('nodemailer');
require('dotenv').config(); 


function generateToken(length = 6) {
    return [...Array(length)].map(() => Math.floor(Math.random() * 10)).join('');
}
const tocken = generateToken(6); 

async function sendTokenByEmail(toEmail: string, tocken: string): Promise<string> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ADMIN_ACCOUNT, 
      pass: process.env.ADMIN_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.ADMIN_ACCOUNT,
    to: toEmail,
    subject: 'Your Verification Token',
    text: `Here is your token: ${tocken}`,
    html: `<p>Your token is: <strong>${tocken}</strong></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Token sent to email:', toEmail);
  } catch (err) {
    console.error('❌ Error sending email:', err.message);
  }
    return tocken; // Return the token for further use (e.g., saving to DB)
}

export default sendTokenByEmail;