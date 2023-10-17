import smtplib
import ssl
from dataclasses import dataclass
from pathlib import Path

from mail.settings import settings

smtp_server = "smtp.gmail.com"
smtp_port = 465

gmail_username = Path(settings.gmail_username_file).read_text().strip()
gmail_app_password = Path(settings.gmail_app_password_file).read_text().strip()


@dataclass
class EmailNotificationRequest:
    """
    Email notification request from Kafka.
    """

    processing_request_id: str
    to_addrs: list[str]
    subject: str
    body: str


async def send_email(request: EmailNotificationRequest):
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(smtp_server, smtp_port, context=context) as server:
        server.login(user=gmail_username, password=gmail_app_password)
        server.sendmail(
            from_addr=gmail_username,
            to_addrs=request.to_addrs,
            msg=f"Subject: {request.subject}\n\n{request.body}",
        )
