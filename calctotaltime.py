import requests

API_KEY = ""  # Enter your API key here
BASE_URL = "https://gitlab.cs.taltech.ee/api/v4/"

item_counter = 0
total_seconds = 0

for i in range(
    1, 57
):  # manually set range of issues here. All issues doesn't work well.
    issue = requests.get(BASE_URL + "projects/38991/issues/" + str(i) + "/time_stats")
    total_seconds += issue.json()["total_time_spent"]
    item_counter += 1

print("Hours on all issues: %.2f" % float((total_seconds / 60) / 60))
print("Total issues: " + str(item_counter))
