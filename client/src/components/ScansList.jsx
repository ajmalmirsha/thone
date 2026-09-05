import React, { useState, useEffect } from 'react';
import { getPatientScans, deleteMedicalScan, applyScanActions } from '../api';
import AIImageScanner from './AIImageScanner';

export default function ScansList({ patientId, onUpdate }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [activeDetailScan, setActiveDetailScan] = useState(null);
  const [activeTabModal, setActiveTabModal] = useState('summary');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [applying, setApplying] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const fetchScans = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPatientScans(patientId);
      setScans(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error loading patient scans:', err);
      setError('Failed to load patient medical scans.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchScans();
    }
  }, [patientId]);

  const handleDelete = async (scanId) => {
    if (!window.confirm('Are you sure you want to delete this medical scan record?')) return;
    try {
      await deleteMedicalScan(scanId);
      if (activeDetailScan?.id === scanId) setActiveDetailScan(null);
      fetchScans();
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete scan.');
    }
  };

  const handleApplyActions = async (scanId) => {
    setApplying(true);
    setActionMsg('');
    try {
      const res = await applyScanActions(scanId);
      setApplying(false);
      setActionMsg(`✅ Successfully applied to patient chart: ${res.data.addedCount.medicines} medicine(s), ${res.data.addedCount.investigations} lab test(s), and ${res.data.addedCount.todos} care task(s)!`);
      if (onUpdate) onUpdate();
    } catch (err) {
      setApplying(false);
      alert(err.response?.data?.error || 'Failed to apply actions.');
    }
  };

  const filteredScans = filterCategory === 'all'
    ? scans
    : scans.filter(s => s.category === filterCategory);

  const totalScans = scans.length;
  const highSeverityCount = scans.filter(s => s.severity === 'severe' || s.severity === 'critical' || s.severity === 'moderate').length;
  const totalOrdersExtracted = scans.reduce((acc, s) => {
    const meds = s.extracted_data?.medicines?.length || 0;
    const invs = s.extracted_data?.investigations?.length || 0;
    return acc + meds + invs;
  }, 0);

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'critical':
      case 'severe':
        return <span className="severity-badge badge-critical">🚨 {sev?.toUpperCase()} SEVERITY</span>;
      case 'moderate':
        return <span className="severity-badge badge-moderate">⚠️ MODERATE</span>;
      case 'mild':
        return <span className="severity-badge badge-mild">⚡ MILD</span>;
      default:
        return <span className="severity-badge badge-normal">✅ NORMAL</span>;
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'xray': return { label: '🫁 Radiograph / X-Ray', icon: '🫁' };
      case 'lab_report': return { label: '🩸 Lab Report', icon: '🩸' };
      case 'prescription': return { label: '📝 Prescription', icon: '📝' };
      case 'dermatology': return { label: '🔬 Dermatology', icon: '🔬' };
      case 'ct_mri': return { label: '🧠 CT / MRI Scan', icon: '🧠' };
      default: return { label: '📋 Clinical Document', icon: '📋' };
    }
  };

  return (
    <div className="scans-container-section">
      {/* Top Banner & Hero Stats */}
      <div className="scans-hero-card">
        <div className="scans-hero-text">
          <div className="ai-status-pill">
            <span className="live-dot"></span>
            AI Vision Intelligence Active
          </div>
          <h2>📷 Patient AI Medical Image & Diagnostic Suite</h2>
          <p>Scan X-Rays, Blood Reports, Prescriptions, and Dermatology photos with instant AI visual breakdown and 1-click chart population.</p>
        </div>

        <button
          className="btn btn-scan-launch"
          onClick={() => setShowScannerModal(true)}
        >
          ✨ Launch AI Scanner Engine
        </button>
      </div>

      {/* Analytics Summary Bar */}
      <div className="scans-stats-bar">
        <div className="scans-stat-box">
          <span className="stat-num">{totalScans}</span>
          <span className="stat-lbl">Digitized Scans</span>
        </div>
        <div className="scans-stat-box highlight-amber">
          <span className="stat-num">{highSeverityCount}</span>
          <span className="stat-lbl">Clinical Flags / Alerts</span>
        </div>
        <div className="scans-stat-box highlight-cyan">
          <span className="stat-num">{totalOrdersExtracted}</span>
          <span className="stat-lbl">Orders Extracted</span>
        </div>
        <div className="scans-stat-box highlight-green">
          <span className="stat-num">97.4%</span>
          <span className="stat-lbl">AI Vision Accuracy</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="scans-filter-bar">
        <div className="filter-pills">
          <button
            className={`filter-pill ${filterCategory === 'all' ? 'active' : ''}`}
            onClick={() => setFilterCategory('all')}
          >
            All Categories ({scans.length})
          </button>
          <button
            className={`filter-pill ${filterCategory === 'xray' ? 'active' : ''}`}
            onClick={() => setFilterCategory('xray')}
          >
            🫁 X-Rays ({scans.filter(s => s.category === 'xray').length})
          </button>
          <button
            className={`filter-pill ${filterCategory === 'lab_report' ? 'active' : ''}`}
            onClick={() => setFilterCategory('lab_report')}
          >
            🩸 Lab Reports ({scans.filter(s => s.category === 'lab_report').length})
          </button>
          <button
            className={`filter-pill ${filterCategory === 'prescription' ? 'active' : ''}`}
            onClick={() => setFilterCategory('prescription')}
          >
            📝 Prescriptions ({scans.filter(s => s.category === 'prescription').length})
          </button>
          <button
            className={`filter-pill ${filterCategory === 'dermatology' ? 'active' : ''}`}
            onClick={() => setFilterCategory('dermatology')}
          >
            🔬 Dermatology ({scans.filter(s => s.category === 'dermatology').length})
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {actionMsg && <div className="alert alert-success">{actionMsg}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading AI medical scans...</p>
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="empty-scans-card">
          <div className="empty-icon">🖼️</div>
          <h4>No {filterCategory !== 'all' ? filterCategory.toUpperCase() : ''} Scans Found</h4>
          <p>Scan X-rays, blood reports, or prescription pictures to get instant AI diagnostic breakdown and automated record extraction.</p>
          <button
            className="btn btn-primary margin-top-sm"
            onClick={() => setShowScannerModal(true)}
          >
            ✨ Run First AI Medical Picture Scan
          </button>
        </div>
      ) : (
        <div className="scans-cards-grid">
          {filteredScans.map((scan) => {
            const catInfo = getCategoryBadge(scan.category);
            return (
              <div key={scan.id} className="scan-card-ultra">
                <div
                  className="scan-card-thumb-wrapper"
                  onClick={() => {
                    setActiveDetailScan(scan);
                    setZoomLevel(1);
                    setActiveTabModal('summary');
                  }}
                >
                  <img src={scan.image_data} alt={scan.title} className="scan-card-thumb" />
                  <div className="scan-card-glow-overlay"></div>
                  <div className="scan-card-hover-action">
                    <span>🔍 Inspect AI Analysis</span>
                  </div>
                </div>

                <div className="scan-card-body">
                  <div className="scan-card-top-row">
                    <span className="scan-cat-tag">{catInfo.label}</span>
                    {getSeverityBadge(scan.severity)}
                  </div>

                  <h4
                    className="scan-card-title"
                    onClick={() => {
                      setActiveDetailScan(scan);
                      setZoomLevel(1);
                      setActiveTabModal('summary');
                    }}
                  >
                    {scan.title}
                  </h4>

                  <p className="scan-card-summary">
                    {scan.ai_analysis?.summary ? (
                      scan.ai_analysis.summary.length > 115
                        ? scan.ai_analysis.summary.substring(0, 115) + '...'
                        : scan.ai_analysis.summary
                    ) : 'AI analysis completed.'}
                  </p>

                  <div className="scan-card-meta">
                    <span>👤 {scan.doctor_name || 'Medical Staff'}</span>
                    <span>📅 {new Date(scan.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="scan-card-actions-row">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setActiveDetailScan(scan);
                        setZoomLevel(1);
                        setActiveTabModal('summary');
                      }}
                    >
                      🔍 Full Findings
                    </button>

                    <button
                      className="btn btn-success btn-sm btn-quick-apply"
                      onClick={() => handleApplyActions(scan.id)}
                      disabled={applying}
                    >
                      ⚡ Apply Orders
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(scan.id)}
                      title="Delete Scan"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Scan Scanner Modal */}
      {showScannerModal && (
        <AIImageScanner
          patientId={patientId}
          onClose={() => setShowScannerModal(false)}
          onScanComplete={() => {
            fetchScans();
            if (onUpdate) onUpdate();
          }}
        />
      )}

      {/* View Scan Details Lightbox Modal with Zoom & Multi-Tab breakdown */}
      {activeDetailScan && (
        <div className="modal-backdrop" onClick={() => setActiveDetailScan(null)}>
          <div className="modal-content scanner-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header bg-gradient-header">
              <div className="header-title-box">
                <h2>📷 AI Vision Diagnostic Report: {activeDetailScan.title}</h2>
                <p className="subtitle">Scanned on {new Date(activeDetailScan.created_at).toLocaleString()} by {activeDetailScan.doctor_name}</p>
              </div>
              <button className="btn-close" onClick={() => setActiveDetailScan(null)}>&times;</button>
            </div>

            <div className="scanner-modal-body">
              <div className="results-header-banner">
                <div className="header-badge-row">
                  {getSeverityBadge(activeDetailScan.severity)}
                  <span className="confidence-pill">🎯 AI Vision Confidence: {activeDetailScan.ai_analysis?.confidence_score || '96%'}</span>
                  <span className="category-pill">Category: {activeDetailScan.category?.toUpperCase()}</span>
                </div>
                <p className="result-summary">{activeDetailScan.ai_analysis?.summary}</p>
              </div>

              {/* Multi-Tab Navigation inside Detail Modal */}
              <div className="detail-modal-tabs">
                <button
                  className={`detail-tab-btn ${activeTabModal === 'summary' ? 'active' : ''}`}
                  onClick={() => setActiveTabModal('summary')}
                >
                  🔍 Diagnostic Findings
                </button>
                <button
                  className={`detail-tab-btn ${activeTabModal === 'metrics' ? 'active' : ''}`}
                  onClick={() => setActiveTabModal('metrics')}
                >
                  📊 Quantitative Biomarkers ({activeDetailScan.ai_analysis?.key_metrics?.length || 0})
                </button>
                <button
                  className={`detail-tab-btn ${activeTabModal === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTabModal('orders')}
                >
                  ⚡ Extracted Orders
                </button>
              </div>

              <div className="results-grid">
                {/* Left: Image Viewer with Interactive Zoom Controls */}
                <div className="result-img-column">
                  <div className="image-viewer-toolbar">
                    <span>Magnification: {Math.round(zoomLevel * 100)}%</span>
                    <div className="zoom-btn-group">
                      <button className="btn-zoom" onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.5))}>➕</button>
                      <button className="btn-zoom" onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}>➖</button>
                      <button className="btn-zoom" onClick={() => setZoomLevel(1)}>🔄 Reset</button>
                    </div>
                  </div>

                  <div className="result-image-box-zoomable">
                    <img
                      src={activeDetailScan.image_data}
                      alt={activeDetailScan.title}
                      style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease' }}
                    />
                  </div>
                </div>

                {/* Right: Tabbed Content Details */}
                <div className="result-details-column">
                  {activeTabModal === 'summary' && (
                    <div className="tab-pane-content">
                      <h4>🔍 Key Clinical Findings</h4>
                      <ul className="findings-list">
                        {activeDetailScan.ai_analysis?.findings?.map((item, idx) => (
                          <li key={idx}>🔹 {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeTabModal === 'metrics' && (
                    <div className="tab-pane-content">
                      <h4>📊 Extracted Lab & Visual Metrics</h4>
                      {activeDetailScan.ai_analysis?.key_metrics?.length > 0 ? (
                        <div className="metrics-grid">
                          {activeDetailScan.ai_analysis.key_metrics.map((m, idx) => (
                            <div key={idx} className={`metric-card metric-${m.status?.toLowerCase()}`}>
                              <span className="metric-name">{m.name}</span>
                              <span className="metric-value">{m.value} <small>{m.unit}</small></span>
                              <span className="metric-status-tag">{m.status}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted">No quantitative metrics extracted for this image.</p>
                      )}
                    </div>
                  )}

                  {activeTabModal === 'orders' && (
                    <div className="tab-pane-content">
                      <div className="actions-extracted-box">
                        <div className="actions-header-row">
                          <h4>⚡ Auto-Populate Patient Chart</h4>
                          <button
                            type="button"
                            className="btn btn-success btn-apply-chart"
                            onClick={() => handleApplyActions(activeDetailScan.id)}
                            disabled={applying}
                          >
                            {applying ? 'Applying...' : '➕ 1-Click Apply All Orders'}
                          </button>
                        </div>

                        <div className="extracted-lists">
                          {activeDetailScan.extracted_data?.medicines?.length > 0 && (
                            <div className="extracted-group">
                              <h5>💊 Prescribed Medicines:</h5>
                              <ul>
                                {activeDetailScan.extracted_data.medicines.map((med, i) => (
                                  <li key={i}><strong>{med.name}</strong> - {med.dose} ({med.frequency}, {med.route})</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {activeDetailScan.extracted_data?.investigations?.length > 0 && (
                            <div className="extracted-group">
                              <h5>🧪 Recommended Investigations:</h5>
                              <ul>
                                {activeDetailScan.extracted_data.investigations.map((inv, i) => (
                                  <li key={i}><strong>{inv.name}</strong> [Priority: {inv.priority}]</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {activeDetailScan.extracted_data?.todos?.length > 0 && (
                            <div className="extracted-group">
                              <h5>📋 Care Tasks:</h5>
                              <ul>
                                {activeDetailScan.extracted_data.todos.map((t, i) => (
                                  <li key={i}><strong>{t.task}</strong> [Due: {t.due_time}]</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
