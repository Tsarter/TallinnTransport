## 07-08-2025

## ADDED

fail2ban added
Configured it in /etc/fail2ban/jail.local
Logs in: `sudo tail -f /var/log/fail2ban.log`

msmtp added for sending emails
`sudo apt-get install msmtp msmtp-mta mailutils`
configured it in /etc/msmtprc
Checked that email is sent when ip get banned by fail2ban

## 03-08-2025

## CHANGED

Disabled gui services
Swap usage was high, so checked what was using it and discovered gui services.
Disabled them with changing graphical.target -> multi-user.target
using: `sudo systemctl set-default multi-user.target`

## 22-07-2025

## ADDED

Realtime proxy service under systemd
Command useds:
sudo nano /etc/systemd/system/transport_proxy.service
reload systemd
sudo systemctl enabled transport_proxy.service
sudo systemctl start transport_proxy.service

## 22-07-2025

## CHANGED

Journald configuration to keep logs for 6 months
Command useds:
nano /etc/systemd/journald.conf
sudo systemctl restart systemd-journald
EDITED BY TANEL: Keep logs up to 6 months
MaxRetentionSec=15552000
