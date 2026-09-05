import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const initialForm = {
  name: '',
  age: '',
  gender: 'Male',
  blood_group: 'O+',
  uhid: '',
  contact: '',
  ward: 'Ward 1',
  bed: 'Bed 1',
  admission_date: new Date().toISOString().split('T')[0],
  medical_info: '',
};

export default function DashboardPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [patientToDelete, setPatientToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async (query = '') => {
    try {
      setLoading(true);
      const res = await api.get('/patients', { params: { search: query || undefined } });
      setPatients(res.data);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;
    try {
      setDeleting(true);
      setDeleteError('');
      await api.delete(`/patients/${patientToDelete.id}`);
      setPatientToDelete(null);
      fetchPatients(search);
    } catch (err) {
      console.error('Failed to delete patient:', err);
      setDeleteError(err.response?.data?.error || 'Failed to delete patient.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    clearTimeout(window._searchTimeout);
    window._searchTimeout = setTimeout(() => fetchPatients(value), 300);
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (!form.name || !form.age) {
      setError('Please enter patient name and age.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await api.post('/patients', form);
      setShowAddModal(false);
      setForm(initialForm);
      fetchPatients(search);
    } catch (err) {
      console.error('Failed to add patient:', err);
      setError(err.response?.data?.error || 'Failed to add patient. Please check the details.');
    } finally {
      setSaving(false);
    }
  };

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="dashboard-greeting">
            {greeting}, <span>{user?.name?.split(' ').slice(0, 2).join(' ')}</span>
          </h1>
          <p className="dashboard-date">{dateStr}</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setForm(initialForm);
            setError('');
            setShowAddModal(true);
          }}
          style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          ➕ Register New Patient
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">🛏️</div>
          <div className="stat-value">{patients.length}</div>
          <div className="stat-label">Total Patients</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-value">
            {patients.filter(p => p.ward === 'ICU').length}
          </div>
          <div className="stat-label">ICU Patients</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div className="stat-value">
            {[...new Set(patients.map(p => p.ward))].length}
          </div>
          <div className="stat-label">Active Wards</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="stat-label">Current Time</div>
        </div>
      </div>

      <div className="dashboard-search">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search patients by name, UHID, or ward..."
            value={search}
            onChange={handleSearch}
            id="patient-search"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="loading-spinner" />
        </div>
      ) : patients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p className="empty-state-text">
            {search ? 'No patients match your search.' : 'No patients found. Add a patient to get started.'}
          </p>
        </div>
      ) : (
        <div className="patient-list">
          {patients.map((patient, index) => (
            <Link
              key={patient.id}
              to={`/patient/${patient.id}`}
              className="patient-card"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="patient-card-main">
                <div className="patient-card-name">{patient.name}</div>
                <div className="patient-card-meta">
                  <span>{patient.age} yrs • {patient.gender}</span>
                  <span>🩸 {patient.blood_group || 'N/A'}</span>
                  <span>🏥 {patient.ward || 'General'} • {patient.bed || 'N/A'}</span>
                  <span>📅 {new Date(patient.admission_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
              <div className="patient-card-badges" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="patient-card-uhid">{patient.uhid}</span>
                {user?.role === 'doctor' && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    title="Delete Patient Record"
                    style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeleteError('');
                      setPatientToDelete(patient);
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {showAddModal && (
        <Modal title="📋 Register New Patient Information" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddPatient} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div className="login-error" style={{ margin: 0 }}>
                ⚠️ {error}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  className="form-input"
                  placeholder="e.g. John Smith"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Age (Years) *</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="e.g. 45"
                  min="0"
                  max="120"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select
                  className="form-select"
                  value={form.blood_group}
                  onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">UHID (Optional)</label>
                <input
                  className="form-input"
                  placeholder="Auto-generated if empty (e.g. UHID-10298)"
                  value={form.uhid}
                  onChange={(e) => setForm({ ...form, uhid: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Number</label>
                <input
                  className="form-input"
                  placeholder="+91 9876543210"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ward</label>
                <input
                  className="form-input"
                  placeholder="e.g. Ward 1, ICU, Emergency"
                  value={form.ward}
                  onChange={(e) => setForm({ ...form, ward: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Bed Number</label>
                <input
                  className="form-input"
                  placeholder="e.g. Bed 4, ICU-2"
                  value={form.bed}
                  onChange={(e) => setForm({ ...form, bed: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Admission Date</label>
              <input
                className="form-input"
                type="date"
                value={form.admission_date}
                onChange={(e) => setForm({ ...form, admission_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Medical History / Clinical Information</label>
              <textarea
                className="form-textarea"
                placeholder="Enter diagnosis, comorbidities, allergies, current condition or notes..."
                rows={3}
                value={form.medical_info}
                onChange={(e) => setForm({ ...form, medical_info: e.target.value })}
              />
            </div>

            <div className="form-actions" style={{ marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving Patient...' : 'Save Patient Information'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {patientToDelete && (
        <Modal title="⚠️ Delete Patient Information" onClose={() => setPatientToDelete(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ margin: 0 }}>
              Are you sure you want to delete patient <strong>{patientToDelete.name}</strong> (UHID: <strong>{patientToDelete.uhid}</strong>)?
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              This will permanently delete all associated medical scans, investigations, prescriptions, instructions, and tasks for this patient. This action cannot be undone.
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
                onClick={() => setPatientToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
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

