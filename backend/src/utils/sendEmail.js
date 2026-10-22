import { fileURLToPath } from 'url';
import { transporter } from '../config/nodemailer.js';

// Logo ko email ke andar INLINE embed karte hain (CID) taake har
// email client (Gmail/Outlook) mein guaranteed show ho — external
// CDN links block ho jate hain aur sirf background color reh jata hai.
const logoPath = fileURLToPath(new URL('../assets/uok-logo.png.jpg', import.meta.url));

export const uokLogoAttachment = {
  filename: 'uok-logo.jpg',
  path: logoPath,
  cid: 'uokLogo',
  contentDisposition: 'inline',
  contentType: 'image/jpeg',
};

export const sendEmail = async ({ to, subject, text, html, attachments }) => {
  const mailOptions = {
    from: `"University of Karachi - Rank Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
    attachments: attachments?.length ? attachments : [uokLogoAttachment],
  };

  await transporter.sendMail(mailOptions);
};
