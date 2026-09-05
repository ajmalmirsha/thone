import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Modal from './Modal';

export default function PatientInfo({ patient, onUpdate }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const isDoctor = user?.role === 'doctor';

  const startEdit = () => {
    setForm({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      blood_group: patient.blood_group || '',
      contact: patient.contact || '',
      ward: patient.ward || '',
      bed: patient.bed || '',
      medical_info: patient.medical_info || '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/patients/${patient.id}`, form);
      setEditing(false);
      onUpdate();
    } catch (err) {
      console.error('Failed to update patient:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setDeleteError('');
      await api.delete(`/patients/${patient.id}`);
      setShowDeleteModal(false);
      navigate('/');
    } catch (err) {
      console.error('Failed to delete patient:', err);
      setDeleteError(err.response?.data?.error || 'Failed to delete patient record.');
    } finally {
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <div className="tab-content animate-fade-in">
        <div className="section-header">
          <h3 className="section-title">📋 Edit Patient Information</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input className="form-input" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-select" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select className="form-select" value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })}>
                <option value="">Select</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ward</label>
              <input className="form-input" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Bed</label>
              <input className="form-input" value={form.bed} onChange={(e) => setForm({ ...form, bed: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Contact</label>
            <input className="form-input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Medical Information</label>
            <textarea className="form-textarea" value={form.medical_info} onChange={(e) => setForm({ ...form, medical_info: e.target.value })} rows={4} />
          </div>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content animate-fade-in">
      <div className="section-header">
        <h3 className="section-title">📋 Patient Information</h3>
        {isDoctor && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={startEdit}>
              ✏️ Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteModal(true)}>
              🗑️ Delete Patient
            </button>
          </div>
        )}
      </div>
      <div className="info-grid">
        <div className="info-item">
          <div className="info-label">UHID</div>
          <div className="info-value">{patient.uhid}</div>
        </div>
        <div className="info-item">
          <div className="info-label">Full Name</div>
          <div className="info-value">{patient.name}</div>
        </div>
        <div className="info-item">
          <div className="info-label">Age</div>
          <div className="info-value">{patient.age} years</div>
        </div>
        <div className="info-item">
          <div className="info-label">Gender</div>
          <div className="info-value">{patient.gender}</div>
        </div>
        <div className="info-item">
          <div className="info-label">Blood Group</div>
          <div className="info-value">{patient.blood_group || 'Not specified'}</div>
        </div>
        <div className="info-item">
          <div className="info-label">Contact</div>
          <div className="info-value">{patient.contact || 'Not specified'}</div>
        </div>
        <div className="info-item">
          <div className="info-label">Ward</div>
          <div className="info-value">{patient.ward}</div>
        </div>
        <div className="info-item">
          <div className="info-label">Bed</div>
          <div className="info-value">{patient.bed}</div>
        </div>
        <div className="info-item">
          <div className="info-label">Admission Date</div>
          <div className="info-value">
            {new Date(patient.admission_date).toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </div>
        </div>
      </div>
      {patient.medical_info && (
        <div style={{ marginTop: '16px' }}>
          <div className="info-item" style={{ gridColumn: '1 / -1' }}>
            <div className="info-label">Medical Information</div>
            <div className="info-value medical-info">{patient.medical_info}</div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <Modal title="⚠️ Delete Patient Information" onClose={() => setShowDeleteModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ margin: 0 }}>
              Are you sure you want to delete <strong>{patient.name}</strong> (UHID: <strong>{patient.uhid}</strong>)?
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              This will permanently delete all patient information, medical scans, investigations, prescriptions, instructions, and tasks for this patient. This action cannot be undone.
            </p>
            {deleteError && (
              <div className="login-error" style={{ margin: 0 }}>
                ⚠️ {deleteError}
              </div>
            )}
            <div className="form-actions" style={{ marginTop: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Patient'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
