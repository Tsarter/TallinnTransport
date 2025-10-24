## 24-10-2025

## CHANGED

React visualizer - Phase 6 performance optimizations completed
- Optimized map event handlers to only update on moveend/zoomend (no intermediate updates during dragging)
- Added extensive memoization throughout components:
  - Memoized position arrays and event handlers in StopMarker
  - Memoized calculations in VehicleMarker (interruption checks, icon names, popup content, visibility)
  - Memoized shouldAnimate calculation in VehiclesLayer
- Removed all console.log statements for production performance
- React migration now complete with 100% feature parity and improved performance

## 08-08-2025

## ADDED

Tailscale for secure remote access
Installed Tailscale with:
`curl -fsSL https://tailscale.com/install.sh | sh`

`sudo tailscale up`

## 08-08-2025

## ADDED

Automatic updates for security
Added unattended-upgrades package
Enabled it in /etc/apt/apt.conf.d/20auto-upgrades
Modified /etc/apt/apt.conf.d/50unattended-upgrades to send email notifications on failure

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
