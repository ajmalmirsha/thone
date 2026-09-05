import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Modal from './Modal';

export default function BystanderBrief({ patientId }) {
  const { user } = useAuth();
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    current_situation: '',
    plan_of_management: '',
    recovery_expectations: '',
  });

  const isDoctor = user?.role === 'doctor';

  useEffect(() => {
    fetchBriefs();
  }, [patientId]);

  const fetchBriefs = async () => {
    try {
      const res = await api.get(`/patients/${patientId}/bystander-briefs`);
      setBriefs(res.data);
    } catch (err) {
      console.error('Failed to fetch bystander briefs:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditItem(null);
    setForm({ current_situation: '', plan_of_management: '', recovery_expectations: '' });
    setShowModal(true);
  };

  const openEdit = (brief) => {
    setEditItem(brief);
    setForm({
      current_situation: brief.current_situation,
      plan_of_management: brief.plan_of_management,
      recovery_expectations: brief.recovery_expectations,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/bystander-briefs/${editItem.id}`, form);
      } else {
        await api.post(`/patients/${patientId}/bystander-briefs`, form);
      }
      setShowModal(false);
      fetchBriefs();
    } catch (err) {
      console.error('Failed to save bystander brief:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this bystander brief?')) return;
    try {
      await api.delete(`/bystander-briefs/${id}`);
      fetchBriefs();
    } catch (err) {
      console.error('Failed to delete bystander brief:', err);
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const latestBrief = briefs[0];
  const olderBriefs = briefs.slice(1);

  if (loading) {
    return <div className="loading"><div className="loading-spinner" /></div>;
  }

  return (
    <div className="tab-content animate-fade-in">
      <div className="section-header">
        <h3 className="section-title">
          👥 Bystander Brief
          {briefs.length > 0 && <span className="section-count">{briefs.length}</span>}
        </h3>
        {isDoctor && (
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            + New Brief
          </button>
        )}
      </div>

      {!latestBrief ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <p className="empty-state-text">
            No bystander brief has been created yet.
            {isDoctor && ' Create one to communicate with the patient\'s family.'}
          </p>
          {isDoctor && (
            <button className="btn btn-primary" onClick={openAdd}>
              + Create Bystander Brief
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Latest Brief — Prominent Display */}
          <div className="bystander-brief-card bystander-brief-latest">
            <div className="bystander-brief-header">
              <div className="bystander-brief-meta">
                <span className="bystander-brief-doctor">{latestBrief.doctor_name}</span>
                <span className="bystander-brief-time">{formatTime(latestBrief.created_at)}</span>
              </div>
              {isDoctor && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(latestBrief)}>✏️</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(latestBrief.id)}>🗑️</button>
                </div>
              )}
            </div>

            <div className="bystander-sections">
              <div className="bystander-section">
                <div className="bystander-section-icon">🔍</div>
                <div className="bystander-section-content">
                  <h4 className="bystander-section-title">Current Situation</h4>
                  <p className="bystander-section-text">{latestBrief.current_situation}</p>
                </div>
              </div>

              <div className="bystander-section">
                <div className="bystander-section-icon">📋</div>
                <div className="bystander-section-content">
                  <h4 className="bystander-section-title">Plan of Management</h4>
                  <p className="bystander-section-text">{latestBrief.plan_of_management}</p>
                </div>
              </div>

              <div className="bystander-section">
                <div className="bystander-section-icon">💪</div>
                <div className="bystander-section-content">
                  <h4 className="bystander-section-title">Recovery Expectations</h4>
                  <p className="bystander-section-text">{latestBrief.recovery_expectations}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Older Briefs */}
          {olderBriefs.length > 0 && (
            <div className="bystander-history">
              <h4 className="bystander-history-title">Previous Briefs</h4>
              {olderBriefs.map((brief) => (
                <div key={brief.id} className="bystander-brief-card bystander-brief-older">
                  <div className="bystander-brief-header">
                    <div className="bystander-brief-meta">
                      <span className="bystander-brief-doctor">{brief.doctor_name}</span>
                      <span className="bystander-brief-time">{formatTime(brief.created_at)}</span>
                    </div>
                    {isDoctor && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(brief)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(brief.id)}>🗑️</button>
                      </div>
                    )}
                  </div>
                  <div className="bystander-sections bystander-sections-compact">
                    <div className="bystander-section-compact">
                      <strong>Situation:</strong> {brief.current_situation}
                    </div>
                    <div className="bystander-section-compact">
                      <strong>Management:</strong> {brief.plan_of_management}
                    </div>
                    <div className="bystander-section-compact">
                      <strong>Recovery:</strong> {brief.recovery_expectations}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showModal && (
        <Modal
          title={editItem ? 'Edit Bystander Brief' : 'New Bystander Brief'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">🔍 Current Situation</label>
              <textarea
                className="form-textarea"
                placeholder="Describe the patient's current condition in simple terms for the family...&#10;&#10;e.g., Your father is currently stable. He was admitted with breathing difficulty and is on oxygen support."
                value={form.current_situation}
                onChange={(e) => setForm({ ...form, current_situation: e.target.value })}
                rows={4}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">📋 Plan of Management</label>
              <textarea
                className="form-textarea"
                placeholder="Explain the treatment plan...&#10;&#10;e.g., We are giving him antibiotics and nebulization. We have ordered some blood tests and a chest X-ray to understand the cause better."
                value={form.plan_of_management}
                onChange={(e) => setForm({ ...form, plan_of_management: e.target.value })}
                rows={4}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">💪 Recovery Expectations</label>
              <textarea
                className="form-textarea"
                placeholder="Set recovery expectations...&#10;&#10;e.g., With proper treatment, we expect improvement in 3-5 days. He will need to stay in the hospital for observation during this period."
                value={form.recovery_expectations}
                onChange={(e) => setForm({ ...form, recovery_expectations: e.target.value })}
                rows={4}
                required
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">
                {editItem ? 'Update' : 'Save'} Brief
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
