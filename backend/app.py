from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Bike, RentalTransaction
from datetime import datetime, timedelta
import math
import os
import json

app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-secret-key-bike-rental-12345'

db.init_app(app)
jwt = JWTManager(app)

with app.app_context():
    db.create_all()
    # Create an initial admin user if not exists
    if not User.query.filter_by(role='admin').first():
        admin = User(username='admin', email='admin@bikerental.com', 
                     password_hash=generate_password_hash('admin123'), role='admin')
        db.session.add(admin)
        db.session.commit()

# --- Auth Routes ---
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'customer')
    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({'message': 'User already exists'}), 400

    new_user = User(
        username=username,
        email=email,
        password_hash=generate_password_hash(password),
        role=role,
        license_number=None,
        license_verified=False
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'message': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=json.dumps({'id': user.id, 'role': user.role}))
    return jsonify({
        'token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'license_verified': user.license_verified,
            'license_document': user.license_number
        }
    }), 200

@app.route('/upload-license', methods=['POST'])
@jwt_required()
def upload_license():
    current_user = json.loads(get_jwt_identity())
    if current_user['role'] != 'customer':
        return jsonify({'message': 'Only customers can upload license'}), 403
        
    if 'file' not in request.files:
        return jsonify({'message': 'No file uploaded'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
        
    if file and file.filename.endswith('.pdf'):
        import werkzeug.utils
        filename = werkzeug.utils.secure_filename(file.filename)
        os.makedirs(os.path.join(basedir, 'uploads'), exist_ok=True)
        file.save(os.path.join(basedir, 'uploads', filename))
        
        user = User.query.get(current_user['id'])
        user.license_number = filename
        user.license_verified = True
        db.session.commit()
        
        return jsonify({
            'message': 'License uploaded successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role,
                'license_verified': user.license_verified,
                'license_document': user.license_number
            }
        }), 200
    else:
        return jsonify({'message': 'Only PDF files are allowed'}), 400

@app.route('/delete-license', methods=['DELETE'])
@jwt_required()
def delete_license():
    current_user = json.loads(get_jwt_identity())
    if current_user['role'] != 'customer':
        return jsonify({'message': 'Unauthorized'}), 403
        
    user = User.query.get(current_user['id'])
    
    if user.license_number:
        # Optionally delete the actual file
        filepath = os.path.join(basedir, 'uploads', user.license_number)
        if os.path.exists(filepath):
            os.remove(filepath)
            
    user.license_number = None
    user.license_verified = False
    db.session.commit()
    
    return jsonify({
        'message': 'License deleted successfully',
        'user': {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'license_verified': user.license_verified,
            'license_document': None
        }
    }), 200

# --- Bike Routes ---
@app.route('/bikes', methods=['GET'])
def get_bikes():
    status_filter = request.args.get('status')
    if status_filter:
        bikes = Bike.query.filter_by(status=status_filter).all()
    else:
        bikes = Bike.query.all()
    
    # Adding owner username for context
    result = []
    for b in bikes:
        owner = User.query.get(b.owner_id)
        result.append({
            'id': b.id, 'model': b.model, 'price_per_hour': b.price_per_hour,
            'power_cc': b.power_cc, 'mileage': b.mileage, 'status': b.status,
            'available_from': b.available_from.isoformat() if b.available_from else None,
            'available_to': b.available_to.isoformat() if b.available_to else None,
            'image_url': b.image_url, 'owner_id': b.owner_id, 'owner_username': owner.username if owner else '',
            'description': b.description
        })
    return jsonify(result), 200

@app.route('/bikes', methods=['POST'])
@jwt_required()
def add_bike():
    current_user = json.loads(get_jwt_identity())
    if current_user['role'] not in ['owner', 'admin']:
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.json
    # Default status is Pending Approval for owners
    status = 'Available' if current_user['role'] == 'admin' else 'Pending Approval'
    
    new_bike = Bike(
        model=data.get('model'),
        description=data.get('description'),
        price_per_hour=float(data.get('price_per_hour', 0)),
        power_cc=int(data.get('power_cc', 0)),
        mileage=float(data.get('mileage', 0)),
        available_from=datetime.strptime(data.get('available_from'), '%Y-%m-%d').date(),
        available_to=datetime.strptime(data.get('available_to'), '%Y-%m-%d').date(),
        image_url=data.get('image_url'),
        status=status,
        owner_id=current_user['id']
    )
    db.session.add(new_bike)
    db.session.commit()
    return jsonify({'message': 'Bike added successfully'}), 201

@app.route('/bikes/<int:id>/status', methods=['PUT'])
@jwt_required()
def update_bike_status(id):
    current_user = json.loads(get_jwt_identity())
    data = request.json
    new_status = data.get('status')
    
    bike = Bike.query.get_or_404(id)
    
    # Admin can change to any status
    # Staff can change between Available and Under Maintenance
    if current_user['role'] == 'staff' and new_status not in ['Available', 'Under Maintenance']:
        return jsonify({'message': 'Unauthorized for this status'}), 403
    elif current_user['role'] not in ['admin', 'staff']:
        return jsonify({'message': 'Unauthorized'}), 403
        
    bike.status = new_status
    db.session.commit()
    return jsonify({'message': 'Bike status updated'}), 200

@app.route('/bikes/<int:id>', methods=['PUT'])
@jwt_required()
def update_bike(id):
    current_user = json.loads(get_jwt_identity())
    bike = Bike.query.get_or_404(id)
    
    if bike.owner_id != current_user['id'] and current_user['role'] != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    data = request.json
    bike.model = data.get('model', bike.model)
    bike.description = data.get('description', bike.description)
    bike.price_per_hour = float(data.get('price_per_hour', bike.price_per_hour))
    bike.power_cc = int(data.get('power_cc', bike.power_cc))
    bike.mileage = float(data.get('mileage', bike.mileage))
    
    if data.get('available_from'):
        bike.available_from = datetime.strptime(data.get('available_from'), '%Y-%m-%d').date()
    if data.get('available_to'):
        bike.available_to = datetime.strptime(data.get('available_to'), '%Y-%m-%d').date()
        
    bike.image_url = data.get('image_url', bike.image_url)
    
    # Optional: If edited by owner, require re-approval.
    if current_user['role'] == 'owner':
        bike.status = 'Pending Approval'
        
    db.session.commit()
    return jsonify({'message': 'Bike updated successfully'}), 200

@app.route('/bikes/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_bike(id):
    current_user = json.loads(get_jwt_identity())
    bike = Bike.query.get_or_404(id)
    
    if bike.owner_id != current_user['id'] and current_user['role'] != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    active_rentals = RentalTransaction.query.filter_by(bike_id=id, status='Active').count()
    if active_rentals > 0:
        return jsonify({'message': 'Cannot delete bike with active rentals'}), 400
        
    db.session.delete(bike)
    db.session.commit()
    return jsonify({'message': 'Bike deleted successfully'}), 200

# --- Rental Routes ---
@app.route('/rent', methods=['POST'])
@jwt_required()
def rent_bike():
    current_user = json.loads(get_jwt_identity())
    if current_user['role'] != 'customer':
        return jsonify({'message': 'Only customers can rent'}), 403
        
    user = User.query.get(current_user['id'])
    if not user.license_verified:
        return jsonify({'message': 'License not verified'}), 403

    # Check if user already has an active rental
    active_rental = RentalTransaction.query.filter_by(customer_id=user.id, status='Active').first()
    if active_rental:
        return jsonify({'message': 'You can only rent one bike at a time'}), 400

    data = request.json
    bike_id = data.get('bike_id')
    duration_hours = int(data.get('duration_hours', 1))
    
    bike = Bike.query.get_or_404(bike_id)
    if bike.status != 'Available':
        return jsonify({'message': 'Bike is not available'}), 400
        
    start_time = datetime.utcnow()
    # Round off to nearest hour based on requirements
    expected_end_time = start_time + timedelta(hours=duration_hours)
    
    # Verify availability dates
    if bike.available_from and start_time.date() < bike.available_from:
        return jsonify({'message': f'Bike is only available from {bike.available_from}'}), 400
    if bike.available_to and expected_end_time.date() > bike.available_to:
        return jsonify({'message': f'Bike is only available until {bike.available_to}'}), 400
    
    rental = RentalTransaction(
        customer_id=user.id,
        bike_id=bike.id,
        start_time=start_time,
        duration_hours=duration_hours,
        expected_end_time=expected_end_time
    )
    
    bike.status = 'Unavailable'
    
    db.session.add(rental)
    db.session.commit()
    return jsonify({'message': 'Bike rented successfully'}), 200

@app.route('/return/<int:rental_id>', methods=['POST'])
@jwt_required()
def return_bike(rental_id):
    current_user = json.loads(get_jwt_identity())
    rental = RentalTransaction.query.get_or_404(rental_id)
    
    if rental.customer_id != current_user['id']:
        return jsonify({'message': 'Unauthorized'}), 403
        
    if rental.status != 'Active':
        return jsonify({'message': 'Rental is not active'}), 400
        
    bike = Bike.query.get(rental.bike_id)
    
    actual_end_time = datetime.utcnow()
    rental.actual_end_time = actual_end_time
    
    # Calculate bill (rounded hours)
    duration_diff = actual_end_time - rental.start_time
    hours_used = math.ceil(duration_diff.total_seconds() / 3600)
    if hours_used < 1: hours_used = 1 # Minimum 1 hour charge
    
    rental.total_amount = hours_used * bike.price_per_hour
    rental.status = 'Pending Admin Verification'
    
    bike.status = 'Available'
    
    db.session.commit()
    return jsonify({'message': 'Bike returned, bill generated pending admin verification', 'amount': rental.total_amount}), 200

@app.route('/rentals', methods=['GET'])
@jwt_required()
def get_rentals():
    current_user = json.loads(get_jwt_identity())
    if current_user['role'] == 'customer':
        rentals = RentalTransaction.query.filter_by(customer_id=current_user['id']).all()
    elif current_user['role'] == 'admin':
        rentals = RentalTransaction.query.all()
    elif current_user['role'] == 'owner':
        # Owner views their own bikes' rentals
        rentals = RentalTransaction.query.join(Bike).filter(Bike.owner_id == current_user['id']).all()
    else:
        return jsonify({'message': 'Unauthorized'}), 403
        
    result = []
    for r in rentals:
        bike = Bike.query.get(r.bike_id)
        customer = User.query.get(r.customer_id)
        result.append({
            'id': r.id, 'bike_id': r.bike_id, 'bike_model': bike.model,
            'customer_username': customer.username if customer else '',
            'start_time': r.start_time.isoformat() + 'Z',
            'actual_end_time': r.actual_end_time.isoformat() + 'Z' if r.actual_end_time else None,
            'duration_hours': r.duration_hours, 'status': r.status, 'total_amount': r.total_amount
        })
    return jsonify(result), 200

@app.route('/rentals/<int:id>/verify', methods=['POST'])
@jwt_required()
def verify_rental_bill(id):
    current_user = json.loads(get_jwt_identity())
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    rental = RentalTransaction.query.get_or_404(id)
    if rental.status != 'Pending Admin Verification':
        return jsonify({'message': 'Rental not in pending verification state'}), 400
        
    rental.status = 'Verified'
    db.session.commit()
    return jsonify({'message': 'Bill verified successfully'}), 200

@app.route('/earnings', methods=['GET'])
@jwt_required()
def get_earnings():
    current_user = json.loads(get_jwt_identity())
    if current_user['role'] != 'owner':
        return jsonify({'message': 'Unauthorized'}), 403
        
    # Calculate earnings from verified or completed rentals for this owner's bikes
    rentals = RentalTransaction.query.join(Bike).filter(Bike.owner_id == current_user['id'], RentalTransaction.status == 'Verified').all()
    total_earnings = sum(r.total_amount for r in rentals if r.total_amount is not None)
    
    return jsonify({'total_earnings': total_earnings}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
