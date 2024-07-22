import fcntl
from config import (
    LOCK_FILE
)

def lock_file(lock_file_path):
    lock_file = open(lock_file_path, 'w')
    try:
        fcntl.flock(lock_file, fcntl.LOCK_EX | fcntl.LOCK_NB)
        return lock_file
    except IOError:
        print("Another instance of the script is running.")
        return None

def unlock_file(lock_file):
    fcntl.flock(lock_file, fcntl.LOCK_UN)
    lock_file.close()