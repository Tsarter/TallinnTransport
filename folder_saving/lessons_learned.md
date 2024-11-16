## Saved to microSd instead of Harddrive
On Jul 19 at 09:47
Excat thing can be seen using `journalctl --since="2024-07-19 09:00" --until="2024-07-19 12:00"`
I messed with autostart and had previously messed with automount.
The realtime scraper started after reboot and saved the first json before harddrive was mounted.
It meant a new folder was created and this caused a problem where there was nowhere to mount on for the hardrive, because the dir was already containig something.
For couple of days i thought it had overwritten the contents of harddrive and data was lost. But it was just saving to the microsd. NICE !
One thing i noticed was that it runned excatly 1 day started 9:47 and crashed again at 9:47 on Jul 20. This is prob related to Undervoltage.
### Fix
hopefully fixed by adding `Required=home-tanel-Documents-public_transport_project-HardDrive.mount` to transport_realtime.service config. Means the service wont run before the harddrive is mouned.


## Undervoltage
`journalctl --grep="Undervoltage"`
Looks like sometimes there isn't enough power and atleast on one occasion (Jul 20 09:46:19 ) I am able to confirm that around that time an crash happend. But on other times it might be me just pulling the plug out and rasperry pi detecting it as undervoltage.
### Fix
Buy proper power supply. Havent done it.


## House lost power
Realtime scraper not working. Harddrive not mounted
Lost power on 4.09.2024. Multiple times. 

## Directory change
Found that scrarper hadnt worked for a whole week, bc i had changed the folder structure and the file wasnt found anymore
Fixed by changing dir in sudo nano /etc/systemd/system/transport_realtime.service
/home/tanel/Documents/public_transport_project/TransportInfoScraper/folder_saving/fetch_realtime_data.py
-> /home/tanel/Documents/public_transport_project/Transport/folder_saving/fetch_realtime_data.py 