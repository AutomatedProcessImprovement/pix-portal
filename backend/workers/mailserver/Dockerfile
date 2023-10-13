FROM ubuntu:22.04

RUN apt update && apt install -y mailutils vim

# Reconfigure postfix interactively if needed: dpkg-reconfigure postfix

# Copy postfix configuration
COPY ./postfix_main.cf /etc/postfix/main.cf

# Apply postfix configuration
RUN systemctl restart postfix

# Configure DNS records for this server

# Test sending mail: `echo "Test" | mail -s "Testing mail" -r "postmaster@pixmail.badwrong.dev" ihar.suvorau@gmail.com`