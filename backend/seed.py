from app import app, db, User, Bike
from werkzeug.security import generate_password_hash
from datetime import date, timedelta

def seed_data():
    with app.app_context():
        # Check if we already have owners to avoid duplicate seeding
        if User.query.filter_by(role='owner').first():
            print("Database already seeded with owners.")
            return

        print("Seeding database...")
        
        # Create a sample owner
        owner = User(
            username='testowner', 
            email='owner@rentgrid.com', 
            password_hash=generate_password_hash('password123'), 
            role='owner',
            license_verified=False
        )
        db.session.add(owner)
        db.session.commit() # Commit to get owner ID
        
        today = date.today()
        next_month = today + timedelta(days=30)
        
        # Sample Bikes
        bikes = [
            {
                'model': 'Ducati Street Fighter V2',
                'description': 'Premium sports bike with incredible power and handling.',
                'price_per_hour': 180.0,
                'power_cc': 1100,
                'mileage': 15.5,
                'available_from': today,
                'available_to': next_month,
                'image_url': 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'status': 'Available'
            },
            {
                'model': 'BMW S1000RR',
                'description': 'High performance superbike designed for the track and street.',
                'price_per_hour': 200.0,
                'power_cc': 999,
                'mileage': 14.0,
                'available_from': today,
                'available_to': next_month,
                'image_url': 'https://images.unsplash.com/photo-1606822830829-8438b4d13dd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'status': 'Available'
            },
            {
                'model': 'Yamaha R1',
                'description': 'Legendary superbike with crossplane crank engine.',
                'price_per_hour': 150.0,
                'power_cc': 998,
                'mileage': 16.0,
                'available_from': today,
                'available_to': next_month,
                'image_url': 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', # Reused image
                'status': 'Available'
            },
            {
                'model': 'Kawasaki Ninja ZX-10R',
                'description': 'Championship winning superbike.',
                'price_per_hour': 160.0,
                'power_cc': 998,
                'mileage': 15.0,
                'available_from': today,
                'available_to': next_month,
                'image_url': 'https://images.unsplash.com/photo-1606822830829-8438b4d13dd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', # Reused image
                'status': 'Under Maintenance'
            }
        ]

        for b_data in bikes:
            bike = Bike(
                model=b_data['model'],
                description=b_data['description'],
                price_per_hour=b_data['price_per_hour'],
                power_cc=b_data['power_cc'],
                mileage=b_data['mileage'],
                available_from=b_data['available_from'],
                available_to=b_data['available_to'],
                image_url=b_data['image_url'],
                status=b_data['status'],
                owner_id=owner.id
            )
            db.session.add(bike)
        
        db.session.commit()
        print("Database seeding completed successfully!")

if __name__ == '__main__':
    seed_data()
