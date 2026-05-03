import React, { useState, useEffect } from 'react';
import api from '../api';
import { Search, Zap, Bike as BikeIcon, ShieldCheck, Droplet, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CustomerDashboard = () => {
  const [bikes, setBikes] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeRental, setActiveRental] = useState(null);

  const [showRentModal, setShowRentModal] = useState(false);
  const [selectedBike, setSelectedBike] = useState(null);
  const [rentDuration, setRentDuration] = useState(1);
  const [rentError, setRentError] = useState('');
  
  const { user, uploadLicense, deleteLicense } = useAuth();
  const [licenseInput, setLicenseInput] = useState(null);
  const [licenseError, setLicenseError] = useState('');

  const handleUploadLicense = async (e) => {
    e.preventDefault();
    if (!licenseInput) {
      setLicenseError('Please select a file first.');
      return;
    }
    const result = await uploadLicense(licenseInput);
    if (!result.success) {
      setLicenseError(result.message);
    } else {
      setLicenseInput(null);
      setLicenseError('');
    }
  };

  const handleDeleteLicense = async () => {
    if (window.confirm('Are you sure you want to delete your uploaded license document?')) {
      const result = await deleteLicense();
      if (!result.success) {
        alert(result.message);
      }
    }
  };

  const fetchData = async () => {
    try {
      const [bikesRes, rentalsRes] = await Promise.all([
        api.get('/bikes'),
        api.get('/rentals')
      ]);
      setBikes(bikesRes.data);
      setRentals(rentalsRes.data);
      
      const active = rentalsRes.data.find(r => r.status === 'Active');
      setActiveRental(active);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRentClick = (bike) => {
    setSelectedBike(bike);
    setShowRentModal(true);
    setRentError('');
  };

  const confirmRent = async () => {
    try {
      await api.post('/rent', {
        bike_id: selectedBike.id,
        duration_hours: parseInt(rentDuration)
      });
      setShowRentModal(false);
      fetchData();
    } catch (error) {
      setRentError(error.response?.data?.message || 'Failed to rent bike');
    }
  };

  const handleReturn = async () => {
    try {
      const res = await api.post(`/return/${activeRental.id}`);
      
      const formatTime = new Date(activeRental.start_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
      const bikeModel = bikes.find(b => b.id === activeRental.bike_id)?.model || `Bike #${activeRental.bike_id}`;
      
      alert(`BIKE RETURNED SUCCESSFULLY!\n\nRental Bill Summary:\n----------------------\nBike Name: ${bikeModel}\nStart Time: ${formatTime}\n\nTotal Amount to Pay: ₹${res.data.amount.toFixed(2)}\n\n(Pending Admin Verification)`);
      
      fetchData();
    } catch (error) {
      console.error('Error returning bike', error);
      alert(error.response?.data?.message || 'Error returning bike');
    }
  };

  const filteredBikes = bikes.filter(b => 
    b.status === 'Available' && 
    b.model.toLowerCase().includes(search.toLowerCase()) &&
    (maxPrice ? b.price_per_hour <= parseFloat(maxPrice) : true)
  );

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div>
      {/* License Upload Banner */}
      {!user?.license_verified ? (
        <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          <h2>Upload Your License</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>You must upload your driving license document before you can rent any vehicles.</p>
          
          {licenseError && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{licenseError}</div>}
          
          <form onSubmit={handleUploadLicense} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0, flex: 1, maxWidth: '400px' }}>
              <label>Upload PDF Document</label>
              <input 
                type="file" 
                accept=".pdf"
                className="form-control" 
                onChange={(e) => setLicenseInput(e.target.files[0])}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: '45px' }}>
              <ShieldCheck size={18} /> Upload License
            </button>
          </form>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid #10b981', backgroundColor: 'rgba(16, 185, 129, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="#10b981" /> License Uploaded
            </h2>
            <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>
              Document: <strong>{user.license_document}</strong>
            </p>
          </div>
          <button className="btn" style={{ padding: '0.5rem 1rem', border: '1px solid #ef4444', color: '#ef4444', backgroundColor: 'transparent' }} onClick={handleDeleteLicense}>
             Delete & Reupload
          </button>
        </div>
      )}

      {/* Active Rental Banner */}
      {activeRental && (
        <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary-color)' }}>
          <h2>Current Ride</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <div>
              <p style={{ color: 'var(--text-muted)' }}>Start Time: {new Date(activeRental.start_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
              <p>Duration: {activeRental.duration_hours} hours</p>
            </div>
            <button className="btn btn-primary" onClick={handleReturn}>
              Return Bike
            </button>
          </div>
        </div>
      )}

      {/* Explore Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>Explore Premium Bikes</h1>
          <p style={{ color: 'var(--text-muted)' }}>Experience the thrill at a lower price</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '250px', padding: '0.5rem 1rem' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search models..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', color: 'inherit', width: '100%', outline: 'none' }}
            />
          </div>
          <div className="form-control" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '200px', padding: '0.5rem 1rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Max ₹/hr:</span>
            <input 
              type="number" 
              placeholder="Any" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{ border: 'none', background: 'transparent', color: 'inherit', width: '100%', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3">
        {filteredBikes.map(bike => (
          <div key={bike.id} className="bike-card">
            <img 
              src={bike.image_url || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80'} 
              alt={bike.model} 
              className="bike-card-image"
            />
            <div className="bike-card-body">
              <div className="bike-header">
                <h3 className="bike-title">{bike.model}</h3>
                <span className="bike-price">₹{bike.price_per_hour}<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/hr</span></span>
              </div>
              
              <div className="bike-specs">
                <div className="spec-item">
                  <div className="spec-label">Power</div>
                  <div className="spec-val" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                    <Zap size={14} color="var(--primary-color)" /> {bike.power_cc}cc
                  </div>
                </div>
                <div className="spec-item">
                  <div className="spec-label">Mileage</div>
                  <div className="spec-val" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                    <Droplet size={14} color="#3b82f6" /> {bike.mileage}km/l
                  </div>
                </div>
              </div>
              
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={14} /> 
                Avail: {new Date(bike.available_from).toLocaleDateString()} - {new Date(bike.available_to).toLocaleDateString()}
              </div>
              
              <div className="bike-actions">
                <span className="badge badge-available">Available</span>
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleRentClick(bike)}
                  disabled={activeRental !== undefined && activeRental !== null}
                >
                  Rent Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBikes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <BikeIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3>No bikes available right now</h3>
          <p>Try adjusting your search filters.</p>
        </div>
      )}

      {/* History Section */}
      <h2 style={{ marginTop: '4rem' }}>Rental History</h2>
      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>Bike Name</th>
              <th>Start Time</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Bill Amount</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map(r => (
              <tr key={r.id}>
                <td>{r.bike_model || `Bike #${r.bike_id}`}</td>
                <td>{new Date(r.start_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</td>
                <td>{r.duration_hours} hrs</td>
                <td>
                  <span className={`badge badge-${r.status === 'Active' ? 'pending' : (r.status === 'Verified' ? 'available' : 'maintenance')}`}>
                    {r.status}
                  </span>
                </td>
                <td>{r.total_amount ? `₹${r.total_amount.toFixed(2)}` : '-'}</td>
              </tr>
            ))}
            {rentals.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>No rental history found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Rent Modal */}
      {showRentModal && selectedBike && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowRentModal(false)}>&times;</button>
            <h2>Rent {selectedBike.model}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>₹{selectedBike.price_per_hour}/hr</p>
            
            {rentError && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{rentError}</div>}
            
            <div className="form-group">
              <label>How many hours?</label>
              <input 
                type="number" 
                min="1" 
                max="72"
                className="form-control" 
                value={rentDuration} 
                onChange={(e) => setRentDuration(e.target.value)} 
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Total:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', marginLeft: '0.5rem', color: 'var(--primary-color)' }}>
                  ₹{(selectedBike.price_per_hour * rentDuration).toFixed(2)}
                </span>
              </div>
              <button className="btn btn-primary" onClick={confirmRent}>Confirm Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
