import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import PatientHeader from '../components/PatientHeader';
import InstructionsBanner from '../components/InstructionsBanner';
import PatientInfo from '../components/PatientInfo';
import InvestigationsList from '../components/InvestigationsList';
import MedicinesList from '../components/MedicinesList';
import TodoList from '../components/TodoList';
import BystanderBrief from '../components/BystanderBrief';

import ScansList from '../components/ScansList';

const TABS = [
  { key: 'info', label: '📋 Patient Info' },
  { key: 'todos', label: '✅ TODOs' },
  { key: 'investigations', label: '🧪 Investigations' },
  { key: 'medicines', label: '💊 Medicines' },
  { key: 'scans', label: '📷 AI Medical Scans' },
  { key: 'bystander', label: '👥 Bystander Brief' },
];

export default function PatientPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/patients/${id}`);
      setPatient(res.data);
    } catch (err) {
      console.error('Failed to fetch patient:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="patient-page">
        <div className="loading" style={{ minHeight: '60vh' }}>
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="patient-page">
        <div className="empty-state">
          <div className="empty-state-icon">😕</div>
          <p className="empty-state-text">Patient not found.</p>
          <Link to="/" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return <PatientInfo patient={patient} onUpdate={fetchPatient} />;
      case 'scans':
        return <ScansList patientId={patient.id} onUpdate={fetchPatient} />;
      case 'investigations':
        return <InvestigationsList patientId={patient.id} />;
      case 'medicines':
        return <MedicinesList patientId={patient.id} />;
      case 'todos':
        return <TodoList patientId={patient.id} />;
      case 'bystander':
        return <BystanderBrief patientId={patient.id} />;
      default:
        return null;
    }
  };

  return (
    <div className="patient-page">
      <Link to="/" className="back-link">
        ← Back to Dashboard
      </Link>

      <PatientHeader patient={patient} />

      <InstructionsBanner
        patient={patient}
        instruction={patient.latestInstruction}
        onUpdate={fetchPatient}
      />

      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderTabContent()}
    </div>
  );
}
