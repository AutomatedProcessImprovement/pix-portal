import smtplib
import ssl
from dataclasses import dataclass

from mail.settings import settings

smtp_server = "smtp.gmail.com"
smtp_port = 465


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
        server.login(user=settings.gmail_username, password=settings.gmail_app_password)
        server.sendmail(
            from_addr=settings.gmail_username,
            to_addrs=request.to_addrs,
            msg=f"Subject: {request.subject}\n\n{request.body}",
        )
