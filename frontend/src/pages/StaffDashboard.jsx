import React, { useState, useEffect } from 'react';
import api from '../api';
import { Wrench, CheckCircle } from 'lucide-react';

const StaffDashboard = () => {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await api.get('/bikes');
      // Staff mainly deals with Available and Under Maintenance bikes
      setBikes(res.data.filter(b => b.status === 'Available' || b.status === 'Under Maintenance'));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/bikes/${id}/status`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Maintenance Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage vehicle conditions and repairs</p>
      </div>

      <div className="card table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Model</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bikes.map(b => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td style={{ fontWeight: 'bold' }}>{b.model}</td>
                <td>{b.owner_username}</td>
                <td>
                  <span className={`badge badge-${b.status === 'Available' ? 'available' : 'maintenance'}`}>
                    {b.status}
                  </span>
                </td>
                <td>
                  {b.status === 'Available' ? (
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      onClick={() => updateStatus(b.id, 'Under Maintenance')}
                    >
                      <Wrench size={14} /> Mark for Maintenance
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      onClick={() => updateStatus(b.id, 'Available')}
                    >
                      <CheckCircle size={14} /> Mark as Repaired
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffDashboard;
