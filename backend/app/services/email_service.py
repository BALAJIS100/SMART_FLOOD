import smtplib
import ssl
import json
import os
import urllib.request
import urllib.error
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

logger = logging.getLogger(__name__)

def _send_via_brevo_api(to_email: str, subject: str, html_content: str, text_content: str) -> bool:
    """Attempts to send email via Brevo HTTPS REST API (Port 443 - Firewall Bypass)."""
    api_key = os.getenv("BREVO_API_KEY") or settings.SMTP_PASSWORD
    sender_email = settings.DEFAULT_FROM_EMAIL or settings.SMTP_USER
    
    if not api_key or len(api_key) < 10:
        return False

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json"
    }
    payload = {
        "sender": {"name": "Flood Rescue Operations", "email": sender_email},
        "to": [{"email": to_email}],
        "subject": subject,
        "htmlContent": html_content,
        "textContent": text_content
    }
    try:
        print(f"[BREVO API] Sending email via HTTPS API to {to_email}...")
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status in (200, 201, 202):
                print(f"[BREVO API SUCCESS] OTP email successfully delivered to {to_email}")
                return True
    except Exception as e:
        print(f"[BREVO API NOTICE] REST API attempt failed: {e}")
    return False


def _send_via_smtp(to_email: str, subject: str, html_content: str, text_content: str) -> bool:
    """Sends email via standard SMTP with support for Port 465 (SSL), 587, and 2525."""
    sender_email = settings.DEFAULT_FROM_EMAIL or settings.SMTP_USER
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Flood Rescue Operations <{sender_email}>"
    msg["To"] = to_email
    msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    host = settings.SMTP_HOST
    port = settings.SMTP_PORT
    user = settings.SMTP_USER
    pwd = settings.SMTP_PASSWORD

    ports_to_try = [port]
    if port == 587 and 2525 not in ports_to_try:
        ports_to_try.append(2525)
    if 465 not in ports_to_try:
        ports_to_try.append(465)

    for p in ports_to_try:
        try:
            print(f"[SMTP] Attempting connection to {host}:{p}...")
            if p == 465:
                context = ssl.create_default_context()
                with smtplib.SMTP_SSL(host, p, context=context, timeout=10) as server:
                    server.login(user, pwd)
                    server.send_message(msg)
            else:
                with smtplib.SMTP(host, p, timeout=10) as server:
                    if settings.SMTP_USE_TLS or p in (587, 2525):
                        server.starttls()
                    server.login(user, pwd)
                    server.send_message(msg)

            print(f"[SMTP SUCCESS] OTP email sent to {to_email} via port {p}")
            return True
        except Exception as e:
            print(f"[SMTP WARNING] Connection to {host}:{p} failed: {e}")
            continue

    return False


def send_otp_email(to_email: str, otp_code: str) -> bool:
    """
    Sends a 6-digit OTP code to the recipient's email address using Brevo API or SMTP.
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

    # 1. Try Brevo HTTPS REST API first (Bypasses port blocks/timeouts on Railway)
    if "brevo" in settings.SMTP_HOST.lower() or os.getenv("BREVO_API_KEY") or settings.SMTP_PASSWORD.startswith(("xkeysib-", "xsmtpsib-")):
        if _send_via_brevo_api(to_email, subject, html_content, text_content):
            return True

    # 2. Fallback to Multi-port SMTP (587 -> 2525 -> 465 SSL)
    if _send_via_smtp(to_email, subject, html_content, text_content):
        return True

    print(f"[ERROR] All email delivery methods failed for {to_email}")
    return False

