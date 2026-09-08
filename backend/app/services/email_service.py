import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

logger = logging.getLogger(__name__)

def send_otp_email(to_email: str, otp_code: str) -> bool:
    """
    Sends a 6-digit OTP code to the recipient's email address via Gmail SMTP.
    """
    if not to_email or "@" not in to_email:
        logger.warning(f"Invalid email address provided for OTP: {to_email}")
        return False

    subject = "Flood Rescue System - One-Time Passcode (OTP)"
    
    text_content = f"""Hello,

Your One-Time Passcode (OTP) for Flood Rescue System login is: {otp_code}

This code will expire in 5 minutes.
If you did not request this OTP, please ignore this email.

Regards,
Flood Rescue Emergency Operations Command
"""

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Flood Rescue System OTP</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px;">
      <div style="max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; padding: 24px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 700;">Flood Rescue System</h2>
          <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 13px;">Emergency Command & Data Management Dashboard</p>
        </div>
        <div style="padding: 30px; color: #334155;">
          <p style="font-size: 15px; margin-top: 0;">Hello,</p>
          <p style="font-size: 14px; line-height: 1.5;">Use the following 6-digit One-Time Passcode (OTP) to securely log in to your account:</p>
          
          <div style="background-color: #f0f9ff; border: 2px dashed #0284c7; border-radius: 10px; padding: 20px; text-align: center; margin: 25px 0;">
            <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0369a1; font-family: monospace;">{otp_code}</span>
          </div>

          <p style="font-size: 13px; color: #64748b;">⏳ This passcode will expire in <strong>5 minutes</strong>. Do not share this code with anyone.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
          <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">If you did not request this code, you can safely ignore this email.</p>
        </div>
        <div style="background: #f8fafc; padding: 15px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
          Digital Alchemists Disaster Management Operations &copy; 2026
        </div>
      </div>
    </body>
    </html>
    """

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Flood Rescue Operations <{settings.DEFAULT_FROM_EMAIL}>"
        msg["To"] = to_email

        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)

        print(f"[SMTP] OTP email successfully sent to {to_email}")
        return True
    except Exception as e:
        print(f"[SMTP ERROR] Failed to send OTP email to {to_email}: {e}")
        return False
