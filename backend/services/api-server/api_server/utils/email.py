from api_server.utils.kafka_clients.email_producer import EmailNotificationProducer, EmailNotificationRequest


async def publish_email_event(email: str, subject: str, message: str):
    email_notification_producer = EmailNotificationProducer(client_id="api-server")
    msg = EmailNotificationRequest(
        to_addrs=[email],
        subject=subject,
        body=message,
    )
    email_notification_producer.send_message(msg)
