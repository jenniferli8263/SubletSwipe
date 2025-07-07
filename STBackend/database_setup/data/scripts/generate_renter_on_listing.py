import random
import csv

def generate_production_data(num_rows=1000, output_file='production_data.csv'):
    fieldnames = ['renter_profile_id', 'listing_id', 'is_right']
    with open(output_file, mode='w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)  # default delimiter=','
        writer.writeheader()
        
        for _ in range(num_rows):
            renter_profile_id = random.randint(1, 1000)
            listing_id = random.randint(1, 1000)
            is_right = random.choice(['TRUE', 'FALSE'])
            
            writer.writerow({
                'renter_profile_id': renter_profile_id,
                'listing_id': listing_id,
                'is_right': is_right
            })
    print(f"Generated {num_rows} rows of data in {output_file}")

if __name__ == "__main__":
    generate_production_data()
