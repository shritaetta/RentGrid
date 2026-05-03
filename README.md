# RentGrid - Premium Bike Rental Platform

## Overview

RentGrid is a comprehensive full-stack web application designed to facilitate peer-to-peer motorcycle and bike rentals. The platform connects bike owners with customers while providing administrative oversight and maintenance tracking capabilities. Built with modern web technologies, RentGrid offers a seamless user experience across multiple user roles with secure authentication and real-time transaction management.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [API Endpoints](#api-endpoints)
- [User Workflows](#user-workflows)
- [Key Features Explained](#key-features-explained)
- [Configuration](#configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Functionality

- **Multi-Role User System**: Support for customers, bike owners, maintenance staff, and administrators with role-based access control
- **License Verification**: Secure PDF document upload system for customer license verification
- **Bike Inventory Management**: Complete CRUD operations for bike listings with detailed specifications
- **Rental Transactions**: Real-time rental booking, tracking, and return management
- **Automated Billing System**: Intelligent bill generation with hourly rate calculations
- **Admin Approval Workflow**: Bike listings and rental bills require admin verification
- **Earnings Dashboard**: Track rental income for bike owners in real-time
- **Maintenance Tracking**: Staff can mark bikes for maintenance and update repair status
- **Advanced Search Filters**: Search bikes by name and filter by maximum hourly rate
- **Responsive Design**: Optimized for desktop and mobile devices

### User Roles & Permissions

| Role | Capabilities |
|------|---|
| **Customer** | Browse available bikes, upload/manage license, rent bikes, view rental history, track active rentals, manage ongoing bookings |
| **Owner** | Add/edit bikes for rental, submit bikes for approval, view rental history of their bikes, track earnings from verified rentals |
| **Staff** | Mark bikes for maintenance, track vehicle conditions, update maintenance status, manage bike availability |
| **Admin** | Approve/reject bike listings, verify rental bills, manage all system data, access analytics |

## Technology Stack

### Frontend
- **Framework**: React 19.2.5 - Modern UI library with hooks and functional components
- **Build Tool**: Vite 8.0.9 - Lightning-fast build tool and development server
- **State Management**: React Context API - Lightweight state management for authentication
- **HTTP Client**: Axios 1.15.1 - Promise-based HTTP client with interceptors
- **Routing**: React Router DOM 7.14.2 - Client-side routing and navigation
- **UI Icons**: Lucide React 1.8.0 - Beautiful, consistent icon library
- **Styling**: Custom CSS with CSS Variables - Responsive design with dark theme

### Backend
- **Framework**: Flask - Lightweight Python web framework
- **Database**: SQLite with SQLAlchemy ORM - SQL toolkit and Object Relational Mapper
- **Authentication**: Flask-JWT-Extended - JWT token-based authentication
- **Security**: Werkzeug - Secure password hashing with PBKDF2
- **CORS**: Flask-CORS - Cross-origin resource sharing
- **Server Port**: 5000 (Development)

### Database

**SQLite Database**: `backend/database.db`
- Automatic creation on first run
- Support for 4 core entities with relationships
- Transaction management for rental operations

## Database Schema

### User Model
```
Table: user
├── id (Integer, Primary Key)
├── username (String[80], Unique)
├── email (String[120], Unique)
├── password_hash (String[256])
├── role (String[20]) - customer/owner/staff/admin
├── license_number (String[50], Nullable)
└── license_verified (Boolean, Default: False)

Relationships:
- One-to-Many: User → Bike (Owner)
- One-to-Many: User → RentalTransaction (Customer)
```

### Bike Model
```
Table: bike
├── id (Integer, Primary Key)
├── model (String[100])
├── description (Text, Nullable)
├── price_per_hour (Float)
├── power_cc (Integer, Nullable)
├── mileage (Float, Nullable)
├── image_url (String[500], Nullable)
├── available_from (Date)
├── available_to (Date)
├── status (String[30]) - Available/Unavailable/Under Maintenance/Pending Approval
├── owner_id (Integer, Foreign Key)
└── Relationships:
    └── One-to-Many: Bike → RentalTransaction
```

### RentalTransaction Model
```
Table: rental_transaction
├── id (Integer, Primary Key)
├── customer_id (Integer, Foreign Key → user.id)
├── bike_id (Integer, Foreign Key → bike.id)
├── start_time (DateTime)
├── duration_hours (Integer)
├── expected_end_time (DateTime)
├── actual_end_time (DateTime, Nullable)
├── status (String[40]) - Active/Pending Admin Verification/Verified/Completed
└── total_amount (Float, Nullable)
```

## Project Structure

```
RentGrid/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx                 # Navigation bar with user info
│   │   ├── context/
│   │   │   └── AuthContext.jsx            # Authentication state management
│   │   ├── pages/
│   │   │   ├── Login.jsx                  # User login page
│   │   │   ├── Register.jsx               # User registration page
│   │   │   ├── CustomerDashboard.jsx      # Customer bike browsing & rental
│   │   │   ├── OwnerDashboard.jsx         # Owner bike management
│   │   │   ├── StaffDashboard.jsx         # Staff maintenance tracking
│   │   │   └── AdminDashboard.jsx         # Admin control panel
│   │   ├── App.jsx                        # Main application component
│   │   ├── api.js                         # Axios configuration
│   │   ├── index.css                      # Global styles
│   │   └── main.jsx                       # Entry point
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── README.md
│
├── backend/
│   ├── app.py                             # Flask application & API routes
│   ├── models.py                          # SQLAlchemy database models
│   ├── seed.py                            # Database seeding script
│   ├── database.db                        # SQLite database
│   ├── uploads/                           # User license documents
│   └── requirements.txt                   # Python dependencies
│
├── .gitignore                             # Git ignore rules
├── package.json                           # Root package configuration
└── README.md                              # This file
```

## Installation & Setup

### Prerequisites

- **Node.js**: v16 or higher (with npm)
- **Python**: 3.8 or higher
- **pip**: Python package manager
- **Git**: For version control
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest version)

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install required packages
pip install flask
pip install flask-cors
pip install flask-jwt-extended
pip install flask-sqlalchemy
pip install werkzeug

# Or install all at once:
pip install flask flask-cors flask-jwt-extended flask-sqlalchemy werkzeug

# Create database and seed sample data (optional)
python seed.py

# Run the Flask development server (runs on http://localhost:5000)
python app.py
```

### Verify Installation

Once both servers are running:
1. Frontend accessible at: `http://localhost:5173`
2. Backend API accessible at: `http://localhost:5000`
3. Login with test credentials (see Testing section)

## API Endpoints

### Authentication Endpoints

```
POST /register
├── Description: Register a new user
├── Body: { username, email, password, role }
├── Role: Public
└── Response: 201 Created

POST /login
├── Description: User login and token generation
├── Body: { username, password }
├── Role: Public
└── Response: 200 OK { token, user }

POST /upload-license
├── Description: Upload driving license document (PDF)
├── Auth: Required (JWT)
├── Role: Customer only
├── Body: FormData { file }
└── Response: 200 OK { user }

DELETE /delete-license
├── Description: Remove license document
├── Auth: Required (JWT)
├── Role: Customer only
└── Response: 200 OK { user }
```

### Bike Management Endpoints

```
GET /bikes
├── Description: Fetch all bikes with optional filtering
├── Query: ?status=Available
├── Role: Public
└── Response: 200 OK [bikes]

POST /bikes
├── Description: Add new bike to inventory
├── Auth: Required (JWT)
├── Role: Owner, Admin
├── Body: { model, description, price_per_hour, power_cc, 
│          mileage, available_from, available_to, image_url }
└── Response: 201 Created

PUT /bikes/<id>
├── Description: Update bike details
├── Auth: Required (JWT)
├── Role: Owner (own bikes), Admin
├── Body: { model, description, price_per_hour, ... }
└── Response: 200 OK

PUT /bikes/<id>/status
├── Description: Update bike status
├── Auth: Required (JWT)
├── Role: Admin, Staff (limited)
├── Body: { status }
└── Response: 200 OK

DELETE /bikes/<id>
├── Description: Delete bike from inventory
├── Auth: Required (JWT)
├── Role: Owner (own bikes), Admin
├── Constraint: No active rentals
└── Response: 200 OK
```

### Rental Transaction Endpoints

```
POST /rent
├── Description: Initiate bike rental
├── Auth: Required (JWT)
├── Role: Customer (license verified)
├── Body: { bike_id, duration_hours }
├── Constraint: One active rental per customer
└── Response: 200 OK

POST /return/<rental_id>
├── Description: Return rented bike and generate bill
├── Auth: Required (JWT)
├── Role: Customer (rental owner)
├── Auto-calculates: total_amount = ceil(hours) × price_per_hour
└── Response: 200 OK { amount }

GET /rentals
├── Description: Fetch rental history (role-based filtering)
├── Auth: Required (JWT)
├── Role: Customer (own rentals), Owner (fleet rentals), Admin (all)
└── Response: 200 OK [rentals]

POST /rentals/<id>/verify
├── Description: Verify and approve rental bill
├── Auth: Required (JWT)
├── Role: Admin only
├── Status change: Pending Admin Verification → Verified
└── Response: 200 OK

GET /earnings
├── Description: Get owner's total earnings
├── Auth: Required (JWT)
├── Role: Owner only
├── Calculation: Sum of verified rental amounts
└── Response: 200 OK { total_earnings }
```

## User Workflows

### Customer Workflow

```
1. Registration
   └─ Register with username, email, password
   └─ Role defaults to "customer"

2. License Upload (Mandatory)
   └─ Upload PDF driving license document
   └─ License verified status enables rentals

3. Browse Bikes
   └─ Search by model name
   └─ Filter by maximum hourly rate
   └─ View bike details (specs, availability dates, images)

4. Rent Bike
   ├─ Select available bike
   ├─ Choose rental duration (hours)
   ├─ View estimated cost
   └─ Confirm booking

5. Active Rental
   └─ View current ride details
   └─ Return bike anytime

6. Return & Bill
   ├─ Click "Return Bike"
   ├─ System calculates bill (rounded up hours × rate)
   ├─ Bill marked pending admin verification
   └─ View bill summary

7. Manage Account
   ├─ View rental history
   ├─ Delete/re-upload license
   └─ View active and past rentals
```

### Owner Workflow

```
1. Registration
   └─ Register with username, email, password
   └─ Select role "owner"

2. Add Bikes
   ├─ Fill bike details (model, specs, price, images)
   ├─ Set availability dates
   ├─ Submit for admin approval
   └─ Bikes initially in "Pending Approval" status

3. Wait for Approval
   └─ Admin reviews and approves/rejects bike

4. Manage Inventory
   ├─ View all bikes
   ├─ Edit bike details (requires re-approval)
   ├─ Delete bikes (no active rentals)
   └─ Track bike status

5. Monitor Rentals
   ├─ View rental history of fleet
   ├─ Track rental duration and amounts
   └─ View customer details

6. Earnings Dashboard
   ├─ View total earnings
   ├─ Only verified rentals count
   └─ Real-time calculation
```

### Staff Workflow

```
1. Registration
   └─ Register with username, email, password
   └─ Select role "staff"

2. View Fleet
   ├─ See all available bikes
   └─ See bikes under maintenance

3. Maintenance Operations
   ├─ Mark available bikes for maintenance
   ├─ Update bike status and conditions
   └─ Mark bikes as repaired/available

4. Track Status
   └─ Monitor which bikes need repair
   └─ Update maintenance progress
```

### Admin Workflow

```
1. Default Account
   └─ Admin account created on first run
   └─ Credentials: admin / admin123

2. Approve Bike Listings
   ├─ View pending bike approvals
   ├─ Review bike details and specifications
   ├─ Approve (Available) or Reject (Unavailable)
   └─ Notification in dashboard

3. Verify Rental Bills
   ├─ View pending bill verifications
   ├─ Review rental details and amounts
   ├─ Click "Verify Bill"
   └─ Update rental status to "Verified"

4. System Management
   ├─ View all bikes in system
   ├─ View all rentals and transactions
   ├─ Monitor system health
   └─ Generate reports

5. Change Bike Status
   ├─ Manually update any bike status
   ├─ Mark for maintenance
   └─ Manage availability
```

## Key Features Explained

### License Verification System

```
Purpose: Ensure only verified customers can rent bikes

Flow:
1. Customer uploads PDF document
2. File stored in backend/uploads/ directory
3. User marked as license_verified in database
4. License verification checked on rental attempt
5. Customer can delete and re-upload anytime

Security:
├─ Only PDF files accepted
├─ Filename sanitized with werkzeug.utils.secure_filename
├─ Stored with secure file naming
└─ Can be deleted anytime
```

### Billing System

```
Calculation Method:
├─ Start Time: When rental begins (datetime.utcnow())
├─ End Time: When bike returned (actual_end_time)
├─ Duration: ceil((end_time - start_time) / 3600 seconds)
├─ Minimum: 1 hour
└─ Total: duration_hours × bike.price_per_hour

Example:
├─ Bike Price: ₹100/hour
├─ Rental Duration: 2 hours 15 minutes
├─ Charged Hours: 3 (rounded up)
└─ Total Bill: ₹300

Workflow:
1. Customer returns bike
2. System calculates duration and bill
3. Amount stored in rental record
4. Status: "Pending Admin Verification"
5. Admin verifies and approves
6. Status: "Verified"
7. Amount counts toward owner earnings
```

### Admin Approval Workflow

```
For Bikes:
1. Owner adds bike (status: "Pending Approval")
2. Admin dashboard shows pending approvals
3. Admin clicks approve/reject
4. Status changes to "Available" or "Unavailable"
5. Customer can see approved bikes only

For Rentals:
1. Customer returns bike
2. Bill generated (status: "Pending Admin Verification")
3. Admin dashboard shows pending bills
4. Admin clicks "Verify Bill"
5. Status changes to "Verified"
6. Amount added to owner earnings
```

### Earnings Dashboard

```
Calculation:
├─ Query: All rentals for owner's bikes
├─ Filter: status == "Verified"
├─ Sum: total_amount for all matching rentals
└─ Display: Real-time earnings

Example:
├─ Bike A: 2 verified rentals (₹200, ₹300)
├─ Bike B: 1 verified rental (₹400)
└─ Total Earnings: ₹900

Features:
├─ Only verified rentals counted
├─ Updated in real-time
├─ Displayed on owner dashboard
└─ Separate from pending approvals
```

### Search & Filter System

```
Customer Dashboard:
├─ Search by bike model name (case-insensitive)
├─ Filter by maximum hourly rate
├─ Combined filtering (AND logic)
├─ Real-time filter updates
└─ Only shows "Available" bikes

Example:
├─ Search: "ducati"
├─ Max Price: ₹150
└─ Shows: Ducati bikes ≤ ₹150/hour
```

## Configuration

### Frontend API Configuration

Edit `frontend/src/api.js`:
```javascript
const api = axios.create({
  baseURL: 'http://localhost:5000', // Change for production
});
```

### Backend JWT Configuration

Edit `backend/app.py`:
```python
app.config['JWT_SECRET_KEY'] = 'super-secret-key-bike-rental-12345'
# Change to strong random string in production
```

### Database Configuration

Edit `backend/app.py`:
```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
# Change to PostgreSQL for production
```

### CORS Configuration

Edit `backend/app.py`:
```python
CORS(app)  # Currently allows all origins
# Restrict in production
```

## Testing

### Sample Credentials (After running seed.py)

```
Admin Account:
├─ Username: admin
├─ Password: admin123
└─ Role: admin

Test Owner Account:
├─ Username: testowner
├─ Password: password123
├─ Role: owner
└─ Pre-loaded bikes: 4 sample bikes

Create Customer Accounts:
├─ Use registration page
├─ Any username/password
├─ Must upload license before renting
└─ Recommended test flow:
    ├─ Register
    ├─ Upload PDF
    ├─ Browse bikes
    ├─ Rent bike
    └─ Return and check bill
```

### Testing Scenarios

```
Scenario 1: Customer Rental Flow
├─ Register as customer
├─ Upload license (sample PDF in docs/)
├─ Browse and search bikes
├─ Rent bike for 2 hours
├─ Return bike
└─ Verify bill in history

Scenario 2: Owner Bike Management
├─ Login as testowner
├─ View pre-loaded bikes
├─ Edit bike details
├─ Monitor rentals
└─ Check earnings

Scenario 3: Admin Approval
├─ Login as admin
├─ View pending bike approvals
├─ Approve/reject bikes
├─ View pending bills
├─ Verify rentals
└─ Check system data

Scenario 4: Staff Maintenance
├─ Login as staff
├─ View available bikes
├─ Mark bike for maintenance
├─ Update status
└─ Mark as repaired
```

## Deployment

### Frontend Deployment

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

#### GitHub Pages
```bash
npm run build
# Deploy dist/ folder to GitHub Pages
```

### Backend Deployment

#### Heroku
```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create your-app-name

# Deploy
git push heroku main
```

#### PythonAnywhere
1. Upload code to PythonAnywhere
2. Configure virtual environment
3. Set up Flask app in WSGI file
4. Configure PostgreSQL database
5. Update API base URL in frontend

### Production Checklist

- [ ] Replace SQLite with PostgreSQL
- [ ] Set strong JWT_SECRET_KEY
- [ ] Configure CORS for specific domains
- [ ] Enable HTTPS/SSL
- [ ] Set up environment variables (.env file)
- [ ] Implement rate limiting
- [ ] Add request logging and monitoring
- [ ] Set up automated backups
- [ ] Configure CDN for static assets
- [ ] Implement error tracking (Sentry)
- [ ] Add health check endpoints
- [ ] Set up CI/CD pipeline
- [ ] Perform security audit
- [ ] Load test application
- [ ] Document deployment process

### Environment Variables Template

Create `.env` file in root:
```
# Backend
FLASK_ENV=production
FLASK_DEBUG=False
JWT_SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:pass@localhost/rentgrid
CORS_ORIGINS=https://yourdomain.com

# Frontend
REACT_APP_API_URL=https://api.yourdomain.com
```

## Future Enhancements

### Phase 2 Features
- [ ] Email notifications (booking, return, approval)
- [ ] SMS alerts for rental reminders
- [ ] Automated payment gateway integration (Stripe, Razorpay)
- [ ] Advanced analytics dashboard
- [ ] Subscription/membership plans

### Phase 3 Features
- [ ] Real-time GPS tracking
- [ ] Mobile app (React Native/Flutter)
- [ ] User reviews and ratings system
- [ ] Insurance integration
- [ ] Damage assessment system

### Phase 4 Features
- [ ] AI-powered pricing recommendations
- [ ] Predictive maintenance system
- [ ] Customer support chat (WebSocket)
- [ ] Multi-language support
- [ ] Advanced reporting and exports

### Technical Improvements
- [ ] Implement caching (Redis)
- [ ] Add comprehensive logging
- [ ] Database query optimization
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] Kubernetes deployment

## Contributing

### Code Style
- Follow PEP 8 for Python
- Use ES6+ for JavaScript
- Write meaningful commit messages
- Add comments for complex logic

### Testing Before Submission
1. Test across all user roles
2. Verify database operations
3. Check API responses
4. Test responsive design
5. Validate form inputs
6. Test error scenarios

### Pull Request Process
1. Create feature branch from `main`
2. Make changes and test thoroughly
3. Update documentation
4. Commit with clear messages
5. Submit PR with description
6. Address code review feedback

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Frontend (port 5173)
npm run dev -- --port 5174

# Backend (port 5000)
python app.py  # Check for other Flask instances
```

**Database Errors**
```bash
# Reset database
rm backend/database.db
python backend/seed.py
```

**JWT Token Issues**
- Clear browser localStorage
- Re-login
- Check JWT_SECRET_KEY matches

**CORS Errors**
- Verify frontend and backend URLs
- Check CORS configuration in app.py
- Ensure correct API base URL in api.js

## License

MIT License - See LICENSE file for details

---

## Contact & Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review API response error messages

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Core rental functionality
- Multi-role user system
- License verification
- Admin approval workflow
- Earnings dashboard
- Maintenance tracking

---

**Last Updated**: May 2026  
**Status**: Production Ready  
**Maintainer**: RentGrid Development Team