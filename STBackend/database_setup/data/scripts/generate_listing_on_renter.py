import random
import csv

def generate_listing_data(num_rows=1000, output_file='listing_data.csv'):
    fieldnames = ['listing_id', 'renter_profile_id', 'is_right']
    with open(output_file, mode='w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for _ in range(num_rows):
            listing_id = random.randint(1, 1000)
            renter_profile_id = random.randint(1, 1000)
            is_right = random.choice(['TRUE', 'FALSE'])
            
            writer.writerow({
                'listing_id': listing_id,
                'renter_profile_id': renter_profile_id,
                'is_right': is_right
            })
    print(f"Generated {num_rows} rows of data in {output_file}")

if __name__ == "__main__":
    generate_listing_data()
