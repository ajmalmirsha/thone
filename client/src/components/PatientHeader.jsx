export default function PatientHeader({ patient }) {
  return (
    <div className="patient-header">
      <div className="patient-header-top">
        <div className="patient-header-info">
          <h1 className="patient-name">{patient.name}</h1>
          <div className="patient-details">
            <span>{patient.age} Years</span>
            <span className="separator">•</span>
            <span>{patient.gender}</span>
            <span className="separator">•</span>
            <span>🩸 {patient.blood_group || 'N/A'}</span>
            <span className="separator">•</span>
            <span>🏥 {patient.ward} • {patient.bed}</span>
            <span className="separator">•</span>
            <span>📅 Admitted {new Date(patient.admission_date).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}</span>
          </div>
        </div>
        <div className="patient-uhid-badge">{patient.uhid}</div>
      </div>
    </div>
  );
}
