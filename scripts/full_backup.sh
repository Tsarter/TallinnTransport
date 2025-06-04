pg_basebackup -U postgres -D /home/tanel/Documents/public_transport_project/HardDrive/backup/backup08_05_2025 -Ft -z -P
sudo -u postgres pg_dump -U postgres -d transport_data -Fc --verbose -f /home/tanel/Documents/public_transport_project/HardDrive/backup/backup08_05_2025.dump
