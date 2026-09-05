import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Modal from './Modal';

export default function MedicinesList({ patientId }) {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPrescribeModal, setShowPrescribeModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', dose: '', frequency: '', route: 'Oral', instructions: '' });
  const [adminNotes, setAdminNotes] = useState('');

  const isDoctor = user?.role === 'doctor';

  useEffect(() => {
    fetchMedicines();
  }, [patientId]);

  const fetchMedicines = async () => {
    try {
      const res = await api.get(`/patients/${patientId}/medicines`);
      setMedicines(res.data);
    } catch (err) {
      console.error('Failed to fetch medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  const openPrescribe = () => {
    setEditItem(null);
    setForm({ name: '', dose: '', frequency: '', route: 'Oral', instructions: '' });
    setShowPrescribeModal(true);
  };

  const openEdit = (med) => {
    setEditItem(med);
    setForm({
      name: med.name,
      dose: med.dose,
      frequency: med.frequency,
      route: med.route,
      instructions: med.instructions || '',
    });
    setShowPrescribeModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/medicines/${editItem.id}`, form);
      } else {
        await api.post(`/patients/${patientId}/medicines`, form);
      }
      setShowPrescribeModal(false);
      fetchMedicines();
    } catch (err) {
      console.error('Failed to save medicine:', err);
    }
  };

  const handleAdminister = async (medId) => {
    try {
      await api.post(`/medicines/${medId}/administer`, {
        status: 'given',
        notes: adminNotes || null,
      });
      setShowAdminModal(null);
      setAdminNotes('');
      fetchMedicines();
    } catch (err) {
      console.error('Failed to administer medicine:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this medicine from the prescription?')) return;
    try {
      await api.delete(`/medicines/${id}`);
      fetchMedicines();
    } catch (err) {
      console.error('Failed to delete medicine:', err);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return <div className="loading"><div className="loading-spinner" /></div>;
  }

  return (
    <div className="tab-content animate-fade-in">
      <div className="section-header">
        <h3 className="section-title">
          💊 Medicines
          <span className="section-count">{medicines.length}</span>
        </h3>
        {isDoctor && (
          <button className="btn btn-primary btn-sm" onClick={openPrescribe}>
            + Prescribe Medicine
          </button>
        )}
      </div>

      {medicines.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💊</div>
          <p className="empty-state-text">No medicines prescribed yet.</p>
          {isDoctor && (
            <button className="btn btn-primary" onClick={openPrescribe}>
              + Prescribe Medicine
            </button>
          )}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="medicine-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Dose</th>
                <th>Frequency</th>
                <th>Route</th>
                <th>Administration</th>
                <th style={{ width: '80px' }}></th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med) => (
                <tr key={med.id}>
                  <td>
                    <div className="medicine-name">{med.name}</div>
                    {med.instructions && (
                      <div className="medicine-instructions">{med.instructions}</div>
                    )}
                  </td>
                  <td>{med.dose}</td>
                  <td>{med.frequency}</td>
                  <td>{med.route}</td>
                  <td>
                    {med.latestAdministration ? (
                      <div className="admin-status">
                        <div className="admin-status-text" style={{ color: 'var(--status-success)' }}>
                          ✓ Given
                        </div>
                        <div className="admin-status-by">
                          By {med.latestAdministration.administered_by_name}
                          <br />
                          {formatTime(med.latestAdministration.administered_at)}
                        </div>
                      </div>
                    ) : (
                      <div className="admin-status">
                        <div className="admin-status-text" style={{ color: 'var(--status-pending)' }}>
                          ⏳ Pending
                        </div>
                        <button
                          className="btn btn-success btn-sm"
                          style={{ marginTop: '4px' }}
                          onClick={() => { setShowAdminModal(med.id); setAdminNotes(''); }}
                        >
                          Administer
                        </button>
                      </div>
                    )}
                  </td>
                  <td>
                    {isDoctor && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(med)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(med.id)}>🗑️</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showPrescribeModal && (
        <Modal
          title={editItem ? 'Edit Prescription' : 'Prescribe Medicine'}
          onClose={() => setShowPrescribeModal(false)}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Medicine Name</label>
              <input
                className="form-input"
                placeholder="e.g., Paracetamol"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Dose</label>
                <input
                  className="form-input"
                  placeholder="e.g., 500 mg"
                  value={form.dose}
                  onChange={(e) => setForm({ ...form, dose: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Frequency</label>
                <input
                  className="form-input"
                  placeholder="e.g., 1-1-1"
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Route</label>
              <select className="form-select" value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })}>
                <option value="Oral">Oral</option>
                <option value="IV">IV (Intravenous)</option>
                <option value="IM">IM (Intramuscular)</option>
                <option value="Subcutaneous">Subcutaneous</option>
                <option value="Inhalation">Inhalation</option>
                <option value="Topical">Topical</option>
                <option value="Rectal">Rectal</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Instructions (Optional)</label>
              <input
                className="form-input"
                placeholder="e.g., After food"
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowPrescribeModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">
                {editItem ? 'Update' : 'Prescribe'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showAdminModal && (
        <Modal title="Administer Medicine" onClose={() => setShowAdminModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
              Confirm that this medicine has been administered to the patient.
            </p>
            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <input
                className="form-input"
                placeholder="Any notes about the administration"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setShowAdminModal(null)}>Cancel</button>
              <button className="btn btn-success" onClick={() => handleAdminister(showAdminModal)}>
                ✓ Confirm Administration
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
