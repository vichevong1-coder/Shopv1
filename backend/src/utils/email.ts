import nodemailer from 'nodemailer';

const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587', 10);
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<void> => {
  const resetLink = `${CLIENT_URL}/auth/reset-password/${resetToken}`;

  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password (valid for 1 hour):</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendOrderConfirmationEmail = async (email: string, orderNumber: string): Promise<void> => {
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: `Order Confirmation - ${orderNumber}`,
    html: `
      <p>Thank you for your order!</p>
      <p>Order Number: ${orderNumber}</p>
      <p>You will receive a tracking number once your order ships.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
