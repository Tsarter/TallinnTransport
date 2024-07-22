## Saved to microSd instead of Harddrive
On Jul 19 at 09:47
Excat thing can be seen using `journalctl --since="2024-07-19 09:00" --until="2024-07-19 12:00"`
I messed with autostart and had previously messed with automount
The realtime scraper started after reboot and saved the first json before harddrive was mounted.
It meant a new folder was created and this caused a problem where there was nowhere to mount on for the hardrive, because the dir was already containig something.
For couple of days i thought it had overwritten the contents of harddrive and data was lost. But it was just saving to the microsd. NICE !
One thing i noticed it that it runned excatly 1 day started 9:47 and crashed again at 9:47 on Jul 20

## Undervoltage
journalctl --grep="Undervoltage"
Looks like sometimes there isn't enough power and atleast on one occasion (Jul 20 09:46:19 ) I am able to confirm that around that time an crash happend. But on other times it might be me just pulling the plug out and rasperry pi detecting it as undervoltage-