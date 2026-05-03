from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False) # customer, owner, staff, admin
    license_number = db.Column(db.String(50), nullable=True) # for customer
    license_verified = db.Column(db.Boolean, default=False)

    # Relationships
    bikes = db.relationship('Bike', backref='owner', lazy=True)
    rentals = db.relationship('RentalTransaction', backref='customer', lazy=True)

class Bike(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    model = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price_per_hour = db.Column(db.Float, nullable=False)
    power_cc = db.Column(db.Integer, nullable=True)
    mileage = db.Column(db.Float, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    available_from = db.Column(db.Date, nullable=False)
    available_to = db.Column(db.Date, nullable=False)
    
    # Status: Available, Unavailable, Under Maintenance, Pending Approval
    status = db.Column(db.String(30), default='Pending Approval', nullable=False)
    
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    rentals = db.relationship('RentalTransaction', backref='bike', lazy=True)

class RentalTransaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    bike_id = db.Column(db.Integer, db.ForeignKey('bike.id'), nullable=False)
    
    start_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    duration_hours = db.Column(db.Integer, nullable=False)
    expected_end_time = db.Column(db.DateTime, nullable=False)
    actual_end_time = db.Column(db.DateTime, nullable=True)
    
    # Status: Active, Completed, Pending Admin Verification, Verified
    status = db.Column(db.String(40), default='Active', nullable=False)
    total_amount = db.Column(db.Float, nullable=True)
