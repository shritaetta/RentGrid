import React, { useState, useEffect } from 'react';
import api from '../api';
import { PlusCircle, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const OwnerDashboard = () => {
  const [bikes, setBikes] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBikeId, setEditingBikeId] = useState(null);
  const [formData, setFormData] = useState({
    model: '',
    description: '',
    price_per_hour: '',
    power_cc: '',
    mileage: '',
    available_from: '',
    available_to: '',
    image_url: ''
  });

  const fetchData = async () => {
    try {
      const [bikesRes, earningsRes, rentalsRes] = await Promise.all([
        api.get('/bikes'),
        api.get('/earnings'),
        api.get('/rentals')
      ]);
      setBikes(bikesRes.data.filter(b => b.owner_id === user.id));
      setEarnings(earningsRes.data.total_earnings);
      setRentals(rentalsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddBike = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/bikes/${editingBikeId}`, formData);
        alert('Vehicle updated successfully! Sent to admin for approval.');
      } else {
        await api.post('/bikes', formData);
        alert('Request sent to admin for approval!');
      }
      closeModal();
      fetchData();
    } catch (error) {
      console.error('Failed to save bike', error);
      alert('Failed to save vehicle: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleEditClick = (bike) => {
    setFormData({
      model: bike.model,
      description: bike.description || '',
      price_per_hour: bike.price_per_hour,
      power_cc: bike.power_cc,
      mileage: bike.mileage,
      available_from: bike.available_from ? bike.available_from.split('T')[0] : '',
      available_to: bike.available_to ? bike.available_to.split('T')[0] : '',
      image_url: bike.image_url || ''
    });
    setEditingBikeId(bike.id);
    setIsEditing(true);
    setShowAddModal(true);
  };

  const handleDeleteBike = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await api.delete(`/bikes/${id}`);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete vehicle');
      }
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setIsEditing(false);
    setEditingBikeId(null);
    setFormData({ model: '', description: '', price_per_hour: '', power_cc: '', mileage: '', available_from: '', available_to: '', image_url: '' });
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Owner Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your fleet and earnings</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="card" style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', padding: '0.75rem', borderRadius: '50%' }}>
              <DollarSign color="var(--primary-color)" />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Earnings</p>
              <h2 style={{ margin: 0 }}>₹{earnings.toFixed(2)}</h2>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <PlusCircle size={18} /> Add Vehicle
          </button>
        </div>
      </div>

      <h2>Your Vehicles</h2>
      <div className="grid grid-cols-3">
        {bikes.map(bike => (
          <div key={bike.id} className="bike-card">
            <img src={bike.image_url || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80'} alt={bike.model} className="bike-card-image" />
            <div className="bike-card-body">
              <div className="bike-header">
                <h3 className="bike-title">{bike.model}</h3>
                <span className="bike-price">₹{bike.price_per_hour}<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/hr</span></span>
              </div>
              <div className="bike-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge badge-${bike.status === 'Available' ? 'available' : (bike.status === 'Pending Approval' ? 'pending' : 'unavailable')}`}>
                  {bike.status}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleEditClick(bike)}>Edit</button>
                  <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleDeleteBike(bike.id)}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {bikes.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ color: 'var(--text-muted)' }}>You haven't added any vehicles yet.</p>
          </div>
        )}
      </div>

      <h2 style={{ marginTop: '4rem' }}>Fleet Rental History</h2>
      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>Bike Name</th>
              <th>Customer</th>
              <th>Start Time</th>
              <th>Return Time</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Bill Amount</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map(r => (
              <tr key={r.id}>
                <td>{r.bike_model}</td>
                <td>{r.customer_username}</td>
                <td>{new Date(r.start_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</td>
                <td>{r.actual_end_time ? new Date(r.actual_end_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '-'}</td>
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
              <tr><td colSpan="7" style={{ textAlign: 'center' }}>No rental history found for your vehicles.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>&times;</button>
            <h2>{isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
            <form onSubmit={handleAddBike}>
              <div className="form-group">
                <label>Model Name</label>
                <input type="text" name="model" className="form-control" value={formData.model} onChange={handleChange} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Price per Hour (₹)</label>
                  <input type="number" name="price_per_hour" className="form-control" value={formData.price_per_hour} onChange={handleChange} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Power (CC)</label>
                  <input type="number" name="power_cc" className="form-control" value={formData.power_cc} onChange={handleChange} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Mileage (km/l)</label>
                  <input type="number" step="0.1" name="mileage" className="form-control" value={formData.mileage} onChange={handleChange} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Available From</label>
                  <input type="date" name="available_from" className="form-control" value={formData.available_from} onChange={handleChange} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Available To</label>
                  <input type="date" name="available_to" className="form-control" value={formData.available_to} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input type="url" name="image_url" className="form-control" placeholder="https://..." value={formData.image_url} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" className="form-control" rows="3" value={formData.description} onChange={handleChange}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit for Approval</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
