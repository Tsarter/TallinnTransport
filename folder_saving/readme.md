
# Scarpers
There are two scripts:
One that daily scrapes data from endpoints specified in config file
### Daily scraper

For that I use a cronjob.
```
crontab -e
```
It runs it every day at 1 in the morning. All things that get printed out are saved to this file "fetch_daily_data.log". With this approach cmd `example.py > example.log`

### Realtime scraper

For that I use systemd. 
Service name is transport_realtime.service

Enable means that on every reboot it starts
`sudo systemctl enable transport_realtime.service`

Disable means that on the next reboot it wont start it
`sudo systemctl disable transport_realtime.service`

To edit 
`sudo systemctl edit --full transport_realtime.service`

The service also includes `restart=always`
Meaning that when it reboots or stops for any reason it also restarts. Essentialy at reboot it starts the script 2 times. (saw it in journal, kinda stupid imo)

### Mounting harddrive

Go to folder PUBLIC_TRANSPORT_PROJECT
and use `sudo mount /dev/sda1 HardDrive/ `
