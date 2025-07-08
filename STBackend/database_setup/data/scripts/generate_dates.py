import csv
import random
from datetime import datetime, timedelta

# Set today's date
today = datetime.today()

start_months = [1, 5, 9]   # January, May, September
end_months = [4, 8, 12]    # April, August, December

def generate_start_date():
    # Start from next month just to ensure future
    year = today.year+1
    month = random.choice(start_months)
    day = random.randint(1, 28)
    candidate = datetime(year, month, day)
    return candidate if candidate > today else generate_start_date()

def generate_end_date(start_date):
    candidates = []
    for m in end_months:
        day = random.randint(1, 28)
        try:
            candidate = datetime(today.year+1, m, day)
            if candidate > start_date:
                candidates.append(candidate)
        except ValueError:
            continue
    return random.choice(candidates)

rows = []
for _ in range(1000):
    start_date = generate_start_date()
    end_date = generate_end_date(start_date)
    rows.append([start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d")])

with open("future_dates.csv", "w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["start_date", "end_date"])
    writer.writerows(rows)

print("✅ future_dates.csv generated with 1000 valid future rows.")
