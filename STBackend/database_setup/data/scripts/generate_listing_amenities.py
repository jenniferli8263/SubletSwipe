import random
import csv

def generate_listing_amenity_data(num_rows=1000, output_file='listing_amenities.csv'):
    fieldnames = ['listing_id', 'amenity_id']
    with open(output_file, mode='w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for _ in range(num_rows):
            listing_id = random.randint(1, 1000)
            amenity_id = random.randint(1, 45)
            writer.writerow({
                'listing_id': listing_id,
                'amenity_id': amenity_id
            })
    print(f"Generated {num_rows} rows of data in {output_file}")

if __name__ == "__main__":
    generate_listing_amenity_data()
