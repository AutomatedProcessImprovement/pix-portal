# Notes on setting up a mail server

Ready-made Docker images:

- https://github.com/docker-mailserver/docker-mailserver
- https://github.com/ix-ai/smtp
- https://github.com/Mailu/Mailu
- https://github.com/mailcow/mailcow-dockerized

Configuration from scratch:

- https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-postfix-as-a-send-only-smtp-server-on-ubuntu-18-04
- https://support.google.com/a/answer/10685031?hl=en&ref_topic=10685331&sjid=6271304655613795967-EU
- https://support.google.com/a/answer/10684623?sjid=6271304655613795967-EU
- https://support.google.com/mail/answer/81126#authentication
- DNS records:
    - A record to point to the mail server: `A pixmail 193.40.11.229`
    - SPF record to allow the mail server to send mail on behalf of the
      domain: `pixmail.badwrong.dev. TXT "v=spf1 a:pixmail.badwrong.dev ip4:193.40.11.229 ~all"`

Email debugging:

- https://github.com/mailhog/MailHog