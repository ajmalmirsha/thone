import React, { useState, useRef } from 'react';
import { analyzeMedicalScan, applyScanActions } from '../api';

const svgToBase64 = (svgStr) => {
  try {
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr.trim())));
  } catch (e) {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgStr.trim());
  }
};

const PRESET_IMAGES = [
  {
    id: 'xray_preset',
    name: '🫁 Chest X-Ray (Pneumonia)',
    category: 'xray',
    title: 'Chest X-Ray (AP View)',
    prompt: 'Evaluate RLL opacity and cardiothoracic ratio',
    dataUrl: svgToBase64(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="100%" height="100%">
        <rect width="600" height="500" fill="#0c1017"/>
        <text x="300" y="35" fill="#94a3b8" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">CHEST RADIOGRAPH - AP VIEW (THONE IMAGING)</text>
        <g stroke="#ffffff" stroke-opacity="0.15" stroke-width="1.5" fill="none">
          <line x1="300" y1="60" x2="300" y2="440" stroke="#cbd5e1" stroke-opacity="0.4" stroke-width="8"/>
          <path d="M300 100 C 230 110, 140 160, 140 240 C 140 320, 240 380, 300 400" />
          <path d="M300 140 C 220 150, 160 190, 160 260 C 160 330, 250 370, 300 390" />
          <path d="M300 180 C 230 190, 180 220, 180 280 C 180 340, 260 370, 300 380" />
          <path d="M300 100 C 370 110, 460 160, 460 240 C 460 320, 360 380, 300 400" />
          <path d="M300 140 C 380 150, 440 190, 440 260 C 440 330, 350 370, 300 390" />
          <path d="M300 180 C 370 190, 420 220, 420 280 C 420 340, 340 370, 300 380" />
        </g>
        <ellipse cx="220" cy="240" rx="65" ry="110" fill="#1e293b" opacity="0.8"/>
        <ellipse cx="380" cy="240" rx="65" ry="110" fill="#1e293b" opacity="0.8"/>
        <path d="M 280 200 C 270 240, 240 320, 300 340 C 330 340, 340 280, 300 200 Z" fill="#94a3b8" opacity="0.45"/>
        <circle cx="395" cy="290" r="38" fill="#f87171" opacity="0.55" filter="blur(8px)"/>
        <circle cx="400" cy="285" r="24" fill="#ef4444" opacity="0.7"/>
        <text x="400" y="290" fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">RLL INFILTRATE</text>
        <text x="300" y="475" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="middle">Patient Scan • AI Diagnostic Vision Ready</text>
      </svg>
    `)
  },
  {
    id: 'lab_preset',
    name: '🩸 Blood Test Lab Report',
    category: 'lab_report',
    title: 'Complete Blood Count & Inflammatory Panel',
    prompt: 'Extract abnormal CBC, WBC, and CRP values',
    dataUrl: svgToBase64(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="100%" height="100%">
        <rect width="600" height="500" fill="#0f172a"/>
        <rect x="30" y="30" width="540" height="440" fill="#1e293b" rx="8" stroke="#334155" stroke-width="2"/>
        <text x="60" y="70" fill="#38bdf8" font-family="sans-serif" font-size="18" font-weight="bold">THONE PATHOLOGY LABORATORY</text>
        <text x="60" y="95" fill="#94a3b8" font-family="sans-serif" font-size="12">Lab Reg No: LAB-882019 • Date: Today</text>
        <line x1="60" y1="110" x2="540" y2="110" stroke="#334155" stroke-width="1.5"/>
        <text x="60" y="145" fill="#cbd5e1" font-family="sans-serif" font-size="13" font-weight="bold">TEST NAME</text>
        <text x="260" y="145" fill="#cbd5e1" font-family="sans-serif" font-size="13" font-weight="bold">RESULT</text>
        <text x="380" y="145" fill="#cbd5e1" font-family="sans-serif" font-size="13" font-weight="bold">REF RANGE</text>
        <text x="60" y="185" fill="#f1f5f9" font-family="sans-serif" font-size="13">WBC Count</text>
        <text x="260" y="185" fill="#ef4444" font-family="sans-serif" font-size="14" font-weight="bold">15.2 K/µL [HIGH]</text>
        <text x="380" y="185" fill="#94a3b8" font-family="sans-serif" font-size="13">4.5 - 11.0</text>
        <text x="60" y="225" fill="#f1f5f9" font-family="sans-serif" font-size="13">Hemoglobin (Hb)</text>
        <text x="260" y="225" fill="#f59e0b" font-family="sans-serif" font-size="14" font-weight="bold">10.8 g/dL [LOW]</text>
        <text x="380" y="225" fill="#94a3b8" font-family="sans-serif" font-size="13">13.0 - 17.5</text>
        <text x="60" y="265" fill="#f1f5f9" font-family="sans-serif" font-size="13">Platelet Count</text>
        <text x="260" y="265" fill="#10b981" font-family="sans-serif" font-size="14">280 K/µL</text>
        <text x="380" y="265" fill="#94a3b8" font-family="sans-serif" font-size="13">150 - 450</text>
        <text x="60" y="305" fill="#f1f5f9" font-family="sans-serif" font-size="13">C-Reactive Protein (CRP)</text>
        <text x="260" y="305" fill="#ef4444" font-family="sans-serif" font-size="14" font-weight="bold">42.0 mg/L [HIGH]</text>
        <text x="380" y="305" fill="#94a3b8" font-family="sans-serif" font-size="13">&lt; 5.0</text>
        <rect x="60" y="380" width="480" height="60" fill="#0f172a" rx="6" stroke="#ef4444" stroke-opacity="0.3"/>
        <text x="75" y="405" fill="#f87171" font-family="sans-serif" font-size="12" font-weight="bold">⚠️ CRITICAL ALERT: Leukocytosis + High CRP Detected</text>
        <text x="75" y="425" fill="#94a3b8" font-family="sans-serif" font-size="11">AI OCR confidence: 97.4% • Click "Analyze" to extract medicines &amp; lab orders.</text>
      </svg>
    `)
  },
  {
    id: 'rx_preset',
    name: '📝 Doctor Prescription Note',
    category: 'prescription',
    title: 'Outpatient Clinical Prescription',
    prompt: 'Digitize written drugs and frequencies',
    dataUrl: svgToBase64(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="100%" height="100%">
        <rect width="600" height="500" fill="#fefce8"/>
        <rect x="30" y="30" width="540" height="440" fill="#ffffff" rx="6" stroke="#fde047" stroke-width="3"/>
        <text x="60" y="70" fill="#1e3a8a" font-family="serif" font-size="20" font-weight="bold">Rx — THONE MEDICAL CENTER</text>
        <line x1="60" y1="85" x2="540" y2="85" stroke="#cbd5e1" stroke-width="1.5"/>
        <text x="60" y="130" fill="#0284c7" font-family="sans-serif" font-size="28" font-weight="bold">Rx</text>
        <g fill="#1e293b" font-family="cursive, sans-serif" font-size="16">
          <text x="110" y="160">1. Tab. Pantoprazole 40mg  -- 1-0-1 (BD before food)</text>
          <text x="110" y="210">2. Tab. Ondansetron 4mg    -- 1-1-1 (TDS for nausea)</text>
          <text x="110" y="260">3. Inj. Ceftriaxone 1g      -- IV BD x 5 days</text>
        </g>
        <line x1="60" y1="310" x2="540" y2="310" stroke="#cbd5e1" stroke-dasharray="4,4"/>
        <text x="60" y="350" fill="#475569" font-family="sans-serif" font-size="13" font-weight="bold">Special Instructions:</text>
        <text x="60" y="375" fill="#64748b" font-family="sans-serif" font-size="13">• Maintain hydration with ORS / oral fluids</text>
        <text x="60" y="395" fill="#64748b" font-family="sans-serif" font-size="13">• Follow up after 5 days with repeat blood report</text>
        <text x="420" y="440" fill="#1e3a8a" font-family="serif" font-size="14" font-weight="bold">Dr. A. Sharma, MD</text>
        <text x="420" y="455" fill="#64748b" font-family="sans-serif" font-size="11">Reg. No: MED-74920</text>
      </svg>
    `)
  },
  {
    id: 'derm_preset',
    name: '🔬 Dermatology Lesion Photo',
    category: 'dermatology',
    title: 'Skin Rash & Lesion Visual Assessment',
    prompt: 'Check erythema extent and border regularity',
    dataUrl: svgToBase64(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="100%" height="100%">
        <rect width="600" height="500" fill="#111827"/>
        <rect x="40" y="40" width="520" height="420" fill="#f5d0b5" rx="12"/>
        <ellipse cx="300" cy="240" rx="140" ry="90" fill="#e11d48" opacity="0.45" filter="blur(6px)"/>
        <ellipse cx="300" cy="240" rx="90" ry="50" fill="#be123c" opacity="0.6"/>
        <circle cx="250" cy="220" r="6" fill="#881337"/>
        <circle cx="280" cy="250" r="8" fill="#881337"/>
        <circle cx="330" cy="210" r="5" fill="#881337"/>
        <circle cx="310" cy="260" r="7" fill="#881337"/>
        <circle cx="350" cy="240" r="6" fill="#881337"/>
        <rect x="150" y="130" width="300" height="220" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6,6"/>
        <circle cx="150" cy="130" r="4" fill="#38bdf8"/>
        <circle cx="450" cy="130" r="4" fill="#38bdf8"/>
        <circle cx="150" cy="350" r="4" fill="#38bdf8"/>
        <circle cx="450" cy="350" r="4" fill="#38bdf8"/>
        <text x="300" y="120" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">AI VISION MEASUREMENT: 3.5 cm x 2.1 cm</text>
      </svg>
    `)
  }
];

export default function AIImageScanner({ patientId, onClose, onScanComplete }) {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_IMAGES[0]);
  const [customImage, setCustomImage] = useState(null);
  const [title, setTitle] = useState(PRESET_IMAGES[0].title);
  const [category, setCategory] = useState(PRESET_IMAGES[0].category);
  const [customPrompt, setCustomPrompt] = useState(PRESET_IMAGES[0].prompt);

  const [analyzing, setAnalyzing] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanResult, setScanResult] = useState(null);
  const [applyingActions, setApplyingActions] = useState(false);
  const [applySuccessMessage, setApplySuccessMessage] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  const steps = [
    'Initializing AI Vision Engine...',
    'Preprocessing visual RGB & Contrast matrix...',
    'Extracting anatomical features & OCR text...',
    'Comparing against clinical diagnostic database...',
    'Synthesizing clinical findings & recommendations...'
  ];

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setCustomImage(null);
    setTitle(preset.title);
    setCategory(preset.category);
    setCustomPrompt(preset.prompt);
    setScanResult(null);
    setApplySuccessMessage('');
    setError('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid picture/image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCustomImage(reader.result);
      setSelectedPreset(null);
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
      setScanResult(null);
      setApplySuccessMessage('');
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = async () => {
    const imageData = customImage || selectedPreset?.dataUrl;
    if (!imageData) {
      setError('Please select or upload a picture first.');
      return;
    }

    setAnalyzing(true);
    setScanStep(0);
    setError('');
    setApplySuccessMessage('');

    const interval = setInterval(() => {
      setScanStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 400);

    try {
      const response = await analyzeMedicalScan(patientId, {
        title: title || 'Medical Picture Scan',
        category,
        image_data: imageData,
        custom_prompt: customPrompt
      });

      clearInterval(interval);
      setScanStep(steps.length - 1);
      setTimeout(() => {
        setAnalyzing(false);
        setScanResult(response.data);
        if (onScanComplete) onScanComplete();
      }, 500);

    } catch (err) {
      clearInterval(interval);
      setAnalyzing(false);
      setError(err.response?.data?.error || 'Failed to complete AI medical picture analysis.');
    }
  };

  const handleApplyToChart = async () => {
    if (!scanResult || !scanResult.id) return;

    setApplyingActions(true);
    setApplySuccessMessage('');
    setError('');

    try {
      const res = await applyScanActions(scanResult.id);
      setApplyingActions(false);
      setApplySuccessMessage(
        `✅ Applied to chart: Added ${res.data.addedCount.medicines} medicine(s), ${res.data.addedCount.investigations} lab investigation(s), and ${res.data.addedCount.todos} follow-up task(s)!`
      );
      if (onScanComplete) onScanComplete();
    } catch (err) {
      setApplyingActions(false);
      setError(err.response?.data?.error || 'Failed to apply extracted recommendations.');
    }
  };

  const activeImageData = customImage || selectedPreset?.dataUrl;

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'critical':
      case 'severe':
        return <span className="severity-badge badge-critical">🚨 {sev.toUpperCase()} SEVERITY</span>;
      case 'moderate':
        return <span className="severity-badge badge-moderate">⚠️ MODERATE SEVERITY</span>;
      case 'mild':
        return <span className="severity-badge badge-mild">⚡ MILD SEVERITY</span>;
      default:
        return <span className="severity-badge badge-normal">✅ NORMAL FINDINGS</span>;
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content scanner-modal-large">
        <div className="modal-header bg-gradient-header">
          <div className="header-title-box">
            <h2>📷 AI Medical Image & Document Scanner</h2>
            <p className="subtitle">Upload patient pictures (X-Rays, Lab Reports, Prescriptions) for automated AI diagnostic vision analysis</p>
          </div>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <div className="scanner-modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          {applySuccessMessage && <div className="alert alert-success">{applySuccessMessage}</div>}

          {!scanResult && !analyzing && (
            <div className="scanner-grid">
              <div className="scanner-left-panel">
                <h3>1. Select Sample Picture or Upload</h3>
                <div className="preset-buttons-container">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`preset-card-btn ${selectedPreset?.id === preset.id ? 'active' : ''}`}
                      onClick={() => handleSelectPreset(preset)}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>

                <div className="or-divider">
                  <span>OR UPLOAD CUSTOM PICTURE</span>
                </div>

                <div
                  className="upload-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <div className="dropzone-icon">📁</div>
                  <p className="dropzone-title">Click or Drop Picture Here</p>
                  <p className="dropzone-sub">Supports PNG, JPG, WEBP, DICOM-Export</p>
                </div>

                <div className="form-group margin-top">
                  <label>Picture Title / Description</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Chest X-Ray AP View"
                  />
                </div>

                <div className="form-group">
                  <label>Medical Category</label>
                  <select
                    className="form-control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="xray">🫁 Radiograph / X-Ray</option>
                    <option value="lab_report">🩸 Blood Test / Lab Report (OCR)</option>
                    <option value="prescription">📝 Hand-written Prescription (OCR)</option>
                    <option value="dermatology">🔬 Dermatology / Skin Lesion</option>
                    <option value="ct_mri">🧠 CT / MRI Scan</option>
                    <option value="other">📋 Other Clinical Document</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Doctor Notes / Focus Prompt (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g. Focus on lower lung opacity..."
                  />
                </div>
              </div>

              <div className="scanner-right-panel">
                <h3>2. Picture Preview</h3>
                <div className="image-preview-frame">
                  {activeImageData ? (
                    <img src={activeImageData} alt="Medical Scan Preview" className="scan-preview-img" />
                  ) : (
                    <div className="empty-preview-placeholder">
                      <span className="placeholder-icon">🖼️</span>
                      <span>No picture selected yet</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-block btn-lg margin-top-md"
                  onClick={handleRunAnalysis}
                  disabled={!activeImageData}
                >
                  ✨ Run AI Diagnostic Vision Scanner
                </button>
              </div>
            </div>
          )}

          {analyzing && (
            <div className="scanning-progress-container">
              <div className="scan-animation-wrapper">
                <img src={activeImageData} alt="Scanning" className="scanning-target-img" />
                <div className="laser-beam"></div>
              </div>
              <div className="scanning-status-card">
                <div className="spinner"></div>
                <h4>Scanning Picture with AI...</h4>
                <p className="scan-step-text">{steps[scanStep]}</p>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${((scanStep + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {scanResult && !analyzing && (
            <div className="scan-results-container">
              <div className="results-header-banner">
                <div className="header-badge-row">
                  {getSeverityBadge(scanResult.severity)}
                  <span className="confidence-pill">🎯 AI Confidence: {scanResult.ai_analysis?.confidence_score || '95%'}</span>
                  <span className="category-pill">Category: {scanResult.category?.toUpperCase()}</span>
                </div>
                <h3 className="result-title">{scanResult.title}</h3>
                <p className="result-summary">{scanResult.ai_analysis?.summary}</p>
              </div>

              <div className="results-grid">
                <div className="result-img-column">
                  <h4>Scanned Picture</h4>
                  <div className="result-image-box">
                    <img src={scanResult.image_data} alt={scanResult.title} />
                  </div>
                  <button
                    className="btn btn-secondary btn-sm btn-block margin-top-sm"
                    onClick={() => setScanResult(null)}
                  >
                    🔄 Scan Another Picture
                  </button>
                </div>

                <div className="result-details-column">
                  <h4>🔍 Key Diagnostic Findings</h4>
                  <ul className="findings-list">
                    {scanResult.ai_analysis?.findings?.map((item, idx) => (
                      <li key={idx}>🔹 {item}</li>
                    ))}
                  </ul>

                  {scanResult.ai_analysis?.key_metrics?.length > 0 && (
                    <div className="metrics-section">
                      <h4>📊 Extracted Quantitative Metrics</h4>
                      <div className="metrics-grid">
                        {scanResult.ai_analysis.key_metrics.map((m, idx) => (
                          <div key={idx} className={`metric-card metric-${m.status?.toLowerCase()}`}>
                            <span className="metric-name">{m.name}</span>
                            <span className="metric-value">{m.value} <small>{m.unit}</small></span>
                            <span className="metric-status-tag">{m.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="actions-extracted-box">
                    <div className="actions-header-row">
                      <h4>⚡ AI Prescribed Actions & Orders</h4>
                      <button
                        type="button"
                        className="btn btn-success btn-apply-chart"
                        onClick={handleApplyToChart}
                        disabled={applyingActions}
                      >
                        {applyingActions ? 'Applying...' : '➕ 1-Click Apply to Patient Chart'}
                      </button>
                    </div>

                    <div className="extracted-lists">
                      {scanResult.extracted_data?.medicines?.length > 0 && (
                        <div className="extracted-group">
                          <h5>💊 Prescribed Medicines ({scanResult.extracted_data.medicines.length}):</h5>
                          <ul>
                            {scanResult.extracted_data.medicines.map((med, i) => (
                              <li key={i}><strong>{med.name}</strong> - {med.dose} ({med.frequency}, {med.route}) - <em>{med.instructions}</em></li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {scanResult.extracted_data?.investigations?.length > 0 && (
                        <div className="extracted-group">
                          <h5>🧪 Recommended Lab Tests ({scanResult.extracted_data.investigations.length}):</h5>
                          <ul>
                            {scanResult.extracted_data.investigations.map((inv, i) => (
                              <li key={i}><strong>{inv.name}</strong> [Priority: {inv.priority}] — <em>{inv.remarks}</em></li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {scanResult.extracted_data?.todos?.length > 0 && (
                        <div className="extracted-group">
                          <h5>📋 Care Tasks ({scanResult.extracted_data.todos.length}):</h5>
                          <ul>
                            {scanResult.extracted_data.todos.map((t, i) => (
                              <li key={i}><strong>{t.task}</strong> [Due: {t.due_time}]</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
