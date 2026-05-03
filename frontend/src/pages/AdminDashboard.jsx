import React, { useState, useEffect } from 'react';
import api from '../api';
import { CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [bikes, setBikes] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [bikesRes, rentalsRes] = await Promise.all([
        api.get('/bikes'),
        api.get('/rentals')
      ]);
      setBikes(bikesRes.data);
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

  const approveBike = async (id) => {
    try {
      await api.put(`/bikes/${id}/status`, { status: 'Available' });
      fetchData();
    } catch (error) {
      console.error('Failed to approve bike', error);
    }
  };

  const rejectBike = async (id) => {
    try {
      await api.put(`/bikes/${id}/status`, { status: 'Unavailable' });
      fetchData();
    } catch (error) {
      console.error('Failed to reject bike', error);
    }
  };

  const verifyBill = async (id) => {
    try {
      await api.post(`/rentals/${id}/verify`);
      fetchData();
    } catch (error) {
      console.error('Failed to verify bill', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  const pendingBikes = bikes.filter(b => b.status === 'Pending Approval');
  const pendingBills = rentals.filter(r => r.status === 'Pending Admin Verification');

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Admin Control Panel</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage approvals and system data</p>
      </div>

      <div className="grid grid-cols-2">
        {/* Pending Bike Approvals */}
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            Pending Vehicle Approvals ({pendingBikes.length})
          </h2>
          {pendingBikes.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No vehicles pending approval.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingBikes.map(b => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>{b.model}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0' }}>Owner: {b.owner_username}</p>
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>₹{b.price_per_hour}/hr</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn" style={{ padding: '0.5rem', backgroundColor: '#dcfce7', color: '#166534' }} onClick={() => approveBike(b.id)}>
                      <CheckCircle size={18} />
                    </button>
                    <button className="btn" style={{ padding: '0.5rem', backgroundColor: '#fee2e2', color: '#991b1b' }} onClick={() => rejectBike(b.id)}>
                      <XCircle size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Bill Verifications */}
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            Pending Bill Verifications ({pendingBills.length})
          </h2>
          {pendingBills.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No bills pending verification.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingBills.map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>Rental #{r.id} - {r.bike_model}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0' }}>Customer: {r.customer_username}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0' }}>Start Time: {new Date(r.start_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0' }}>Duration: {r.duration_hours} hrs</p>
                    <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 'bold' }}>Amount: ₹{r.total_amount?.toFixed(2)}</span>
                  </div>
                  <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => verifyBill(r.id)}>
                    Verify Bill
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <h2 style={{ marginTop: '3rem' }}>All System Vehicles</h2>
      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Model</th>
              <th>Owner</th>
              <th>Price/hr</th>
              <th>Mileage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bikes.map(b => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.model}</td>
                <td>{b.owner_username}</td>
                <td>₹{b.price_per_hour}</td>
                <td>{b.mileage} km/l</td>
                <td>
                  <span className={`badge badge-${b.status === 'Available' ? 'available' : (b.status === 'Pending Approval' ? 'pending' : (b.status === 'Under Maintenance' ? 'maintenance' : 'unavailable'))}`}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
