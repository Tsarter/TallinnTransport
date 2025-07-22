## 22-07.2025

## ADDED

Realtime proxy service under systemd
Command useds:
sudo nano /etc/systemd/system/transport_proxy.service
reload systemd
sudo systemctl enabled transport_proxy.service
sudo systemctl start transport_proxy.service

## 22.07.2025

## CHANGED

Journald configuration to keep logs for 6 months
Command useds:
nano /etc/systemd/journald.conf
sudo systemctl restart systemd-journald
EDITED BY TANEL: Keep logs up to 6 months
MaxRetentionSec=15552000
