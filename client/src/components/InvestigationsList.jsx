import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Modal from './Modal';

export default function InvestigationsList({ patientId }) {
  const { user } = useAuth();
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', status: 'pending', priority: 'normal', result: '', remarks: '' });

  const isDoctor = user?.role === 'doctor';

  useEffect(() => {
    fetchInvestigations();
  }, [patientId]);

  const fetchInvestigations = async () => {
    try {
      const res = await api.get(`/patients/${patientId}/investigations`);
      setInvestigations(res.data);
    } catch (err) {
      console.error('Failed to fetch investigations:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: '', status: 'pending', priority: 'normal', result: '', remarks: '' });
    setShowModal(true);
  };

  const openEdit = (inv) => {
    setEditItem(inv);
    setForm({
      name: inv.name,
      status: inv.status,
      priority: inv.priority,
      result: inv.result || '',
      remarks: inv.remarks || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/investigations/${editItem.id}`, form);
      } else {
        await api.post(`/patients/${patientId}/investigations`, form);
      }
      setShowModal(false);
      fetchInvestigations();
    } catch (err) {
      console.error('Failed to save investigation:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this investigation?')) return;
    try {
      await api.delete(`/investigations/${id}`);
      fetchInvestigations();
    } catch (err) {
      console.error('Failed to delete investigation:', err);
    }
  };

  const statusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '🔄';
      default: return '⏳';
    }
  };

  const statusBadge = (status) => {
    const map = {
      completed: 'badge-success',
      in_progress: 'badge-info',
      pending: 'badge-warning',
    };
    return map[status] || 'badge-neutral';
  };

  const priorityBadge = (priority) => `badge-priority-${priority}`;

  if (loading) {
    return <div className="loading"><div className="loading-spinner" /></div>;
  }

  return (
    <div className="tab-content animate-fade-in">
      <div className="section-header">
        <h3 className="section-title">
          🧪 Investigations
          <span className="section-count">{investigations.length}</span>
        </h3>
        {isDoctor && (
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            + Add Investigation
          </button>
        )}
      </div>

      {investigations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🧪</div>
          <p className="empty-state-text">No investigations ordered yet.</p>
          {isDoctor && (
            <button className="btn btn-primary" onClick={openAdd}>
              + Add Investigation
            </button>
          )}
        </div>
      ) : (
        investigations.map((inv) => (
          <div key={inv.id} className="investigation-item">
            <div className="investigation-info">
              <div className="investigation-name">
                {statusIcon(inv.status)} {inv.name}
              </div>
              <div className="investigation-meta">
                <span className={`badge ${statusBadge(inv.status)}`}>
                  {inv.status.replace('_', ' ')}
                </span>
                {inv.priority !== 'normal' && (
                  <span className={`badge ${priorityBadge(inv.priority)}`}>
                    {inv.priority.toUpperCase()}
                  </span>
                )}
              </div>
              {inv.result && (
                <div className="investigation-result">
                  <strong>Result:</strong> {inv.result}
                </div>
              )}
              {inv.remarks && (
                <div className="investigation-result">
                  <strong>Remarks:</strong> {inv.remarks}
                </div>
              )}
            </div>
            {isDoctor && (
              <div className="investigation-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(inv)}>✏️</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(inv.id)}>🗑️</button>
              </div>
            )}
          </div>
        ))
      )}

      {showModal && (
        <Modal
          title={editItem ? 'Edit Investigation' : 'Add Investigation'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Investigation Name</label>
              <input
                className="form-input"
                placeholder="e.g., CBC, MRI Brain, Blood Sugar"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Result</label>
              <input
                className="form-input"
                placeholder="e.g., Normal, Borderline High"
                value={form.result}
                onChange={(e) => setForm({ ...form, result: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Remarks</label>
              <textarea
                className="form-textarea"
                placeholder="Additional notes or observations"
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                rows={3}
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">
                {editItem ? 'Update' : 'Add'} Investigation
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
