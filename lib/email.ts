import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
})

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const from = process.env.SMTP_FROM || 'noreply@selfhosted-videy.local'

  if (!process.env.SMTP_HOST || process.env.SMTP_HOST === 'localhost') {
    // Development / no SMTP configured: log instead of sending
    console.log(`\n=== PASSWORD RESET (DEV MODE) ===`)
    console.log(`To: ${email}`)
    console.log(`Reset Link: ${resetLink}`)
    console.log(`===========================\n`)
    return { success: true, devMode: true }
  }

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: 'Reset your Selfhosted Videy Password',
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password for Selfhosted Videy.</p>
          <p>Click the button below to set a new password. This link expires in 1 hour.</p>
          <a href="${resetLink}" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
          <p style="color: #64748b; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Email send failed:', error)
    return { success: false, error }
  }
}
