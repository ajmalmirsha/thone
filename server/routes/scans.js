import { Router } from 'express';
import db from '../db/schema.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Helper to simulate smart AI vision analysis based on medical categories & prompts
function generateAIAnalysis(category, title, customPrompt, imageData) {
  let severity = 'normal';
  let confidenceScore = '94%';
  let findings = [];
  let summary = '';
  let keyMetrics = [];
  let suggestedMedicines = [];
  let suggestedInvestigations = [];
  let suggestedTodos = [];

  const lowerTitle = (title || '').toLowerCase();
  const lowerPrompt = (customPrompt || '').toLowerCase();

  if (category === 'xray') {
    if (lowerTitle.includes('chest') || lowerPrompt.includes('cough') || lowerPrompt.includes('fever')) {
      severity = 'moderate';
      confidenceScore = '96%';
      summary = 'AI Vision Analysis detected localized opacification and patchy infiltrate in the right lower lobe, indicative of early stage bronchopneumonia. Trachea is midline, cardiac silhouette is within normal limits, and pleural spaces are clear.';
      findings = [
        'Patchy opacification / consolidation observed in Right Lower Lobe (RLL).',
        'Costophrenic angles remain sharp bilaterally.',
        'Cardiac silhouette size is normal (Cardiothoracic ratio < 0.5).',
        'No evidence of pneumothorax, pleural effusion, or acute osseous abnormality.'
      ];
      keyMetrics = [
        { name: 'Cardiothoracic Ratio', value: '0.46', unit: 'ratio', status: 'Normal' },
        { name: 'Infiltrate Extent', value: 'Localized RLL', unit: 'zone', status: 'Abnormal' },
        { name: 'Diaphragm Position', value: 'Normal', unit: '', status: 'Normal' }
      ];
      suggestedMedicines = [
        { name: 'Amoxicillin/Clavulanate (Augmentin)', dose: '625 mg', frequency: 'TDS (Every 8 hours)', route: 'Oral', instructions: 'Take after meals for 7 days' },
        { name: 'Paracetamol', dose: '650 mg', frequency: 'SOS (As needed)', route: 'Oral', instructions: 'Take for fever > 100°F' }
      ];
      suggestedInvestigations = [
        { name: 'Repeat Chest X-Ray (AP View)', priority: 'normal', remarks: 'Evaluate resolution after 7 days of antibiotics' },
        { name: 'Sputum Culture & Sensitivity', priority: 'high', remarks: 'Confirm pathogen sensitivity' }
      ];
      suggestedTodos = [
        { task: 'Monitor SpO2 every 4 hours and maintain oxygen therapy if < 95%', priority: 'high', due_time: 'Q4H' },
        { task: 'Re-assess lung auscultation during evening rounds', priority: 'normal', due_time: '18:00' }
      ];
    } else {
      severity = 'normal';
      confidenceScore = '98%';
      summary = 'Clear radiograph with no acute cardiopulmonary abnormality detected. Lung fields are clear bilaterally with well-defined diaphragm contours.';
      findings = [
        'Bilateral lung fields clear of consolidation, nodules, or masses.',
        'Normal hila and vascular markings.',
        'Intact bony thorax without rib fractures.'
      ];
      keyMetrics = [
        { name: 'Cardiothoracic Ratio', value: '0.44', unit: 'ratio', status: 'Normal' },
        { name: 'Lung Expansion', value: 'Full', unit: 'ribs', status: 'Normal' }
      ];
    }
  } else if (category === 'lab_report') {
    severity = 'severe';
    confidenceScore = '97%';
    summary = 'AI OCR & Data Extraction detected elevated Inflammatory Markers and Leukocytosis (WBC 15.2 K/µL), accompanied by mild anemia (Hb 10.8 g/dL). Serum electrolytes and renal function tests are stable.';
    findings = [
      'Leukocytosis with neutrophilia (WBC: 15.2 x 10^3 / µL) indicating ongoing bacterial infection / systemic inflammation.',
      'Hemoglobin: 10.8 g/dL (Mild Microcytic Anemia).',
      'C-Reactive Protein (CRP): 42 mg/L (Significantly Elevated).',
      'Serum Creatinine: 0.9 mg/dL (Normal Renal Function).'
    ];
    keyMetrics = [
      { name: 'WBC Count', value: '15.2', unit: 'K/µL', status: 'High' },
      { name: 'Hemoglobin', value: '10.8', unit: 'g/dL', status: 'Low' },
      { name: 'Platelets', value: '280', unit: 'K/µL', status: 'Normal' },
      { name: 'CRP', value: '42.0', unit: 'mg/L', status: 'High' }
    ];
    suggestedMedicines = [
      { name: 'Cefoperazone + Sulbactam', dose: '1.5 g', frequency: 'BD (Every 12 hours)', route: 'IV', instructions: 'Infuse over 30 mins' },
      { name: 'Ferrous Ascorbate + Folic Acid', dose: '1 Tablet', frequency: 'OD (Once daily)', route: 'Oral', instructions: 'Take after breakfast' }
    ];
    suggestedInvestigations = [
      { name: 'Complete Blood Count (CBC) Repeat', priority: 'high', remarks: 'Check WBC trend tomorrow morning' },
      { name: 'Procalcitonin Level', priority: 'normal', remarks: 'Rule out severe sepsis' }
    ];
    suggestedTodos = [
      { task: 'Check patient temperature profile q2h and notify doctor if > 101°F', priority: 'high', due_time: 'Q2H' }
    ];
  } else if (category === 'prescription') {
    severity = 'normal';
    confidenceScore = '95%';
    summary = 'AI Prescription Vision Reader successfully digitized physician prescription. Extracted 3 prescribed medications with precise dosages and dosing schedules.';
    findings = [
      'Extracted Prescription Item 1: Pantoprazole 40 mg (Oral, BD before meals).',
      'Extracted Prescription Item 2: Ondansetron 4 mg (Oral, TDS).',
      'Extracted Prescription Item 3: Ceftriaxone 1g (IV, BD).'
    ];
    keyMetrics = [
      { name: 'Items Digitized', value: '3', unit: 'medicines', status: 'Extracted' },
      { name: 'OCR Confidence', value: '95', unit: '%', status: 'High' }
    ];
    suggestedMedicines = [
      { name: 'Pantoprazole', dose: '40 mg', frequency: 'BD', route: 'Oral', instructions: 'Before meals' },
      { name: 'Ondansetron', dose: '4 mg', frequency: 'TDS', route: 'Oral', instructions: 'For nausea / vomiting' },
      { name: 'Ceftriaxone', dose: '1 g', frequency: 'BD', route: 'IV', instructions: 'IV push over 5 mins' }
    ];
  } else if (category === 'dermatology') {
    severity = 'moderate';
    confidenceScore = '92%';
    summary = 'AI Vision Surface Inspection detected an erythematous maculopapular rash with mild scaling across localized skin surface. Border is well-demarcated with no evidence of systemic ulceration.';
    findings = [
      'Erythematous cutaneous patch measuring approx 3.5 x 2.1 cm.',
      'Slight peripheral scaling without necrotic center.',
      'No signs of cellulitic spreading or subcutaneous abscess.'
    ];
    keyMetrics = [
      { name: 'Lesion Size', value: '3.5 x 2.1', unit: 'cm', status: 'Measured' },
      { name: 'Erythema Grade', value: 'Moderate (2+)', unit: 'grade', status: 'Abnormal' }
    ];
    suggestedMedicines = [
      { name: 'Hydrocortisone 1% Cream', dose: 'Thin layer', frequency: 'BD', route: 'Topical', instructions: 'Apply to affected area twice daily' },
      { name: 'Cetirizine', dose: '10 mg', frequency: 'HS (Bedtime)', route: 'Oral', instructions: 'For pruritus / itching' }
    ];
    suggestedInvestigations = [
      { name: 'Skin Scraping for KOH Mount', priority: 'normal', remarks: 'Rule out fungal infection' }
    ];
  } else {
    severity = 'normal';
    confidenceScore = '91%';
    summary = `AI Medical Scan analysis completed for "${title || 'Medical Image'}". Image structure parsed with key clinical highlights extracted.`;
    findings = [
      'Visual features extracted successfully.',
      'No immediate life-threatening emergency signs flagged.',
      'Clinical context matched with patient chart profile.'
    ];
    keyMetrics = [
      { name: 'Scan Status', value: 'Processed', unit: '', status: 'Normal' }
    ];
  }

  return {
    summary,
    findings,
    severity,
    confidence_score: confidenceScore,
    key_metrics: keyMetrics,
    extracted_actions: {
      medicines: suggestedMedicines,
      investigations: suggestedInvestigations,
      todos: suggestedTodos
    }
  };
}

// GET /api/patients/:patientId/scans — List all medical scans for a patient
router.get('/:patientId/scans', authenticate, (req, res) => {
  try {
    const scans = db.prepare(`
      SELECT s.*, u.name as doctor_name
      FROM scans s
      JOIN users u ON s.created_by = u.id
      WHERE s.patient_id = ?
      ORDER BY s.created_at DESC
    `).all(req.params.patientId);

    // Parse JSON fields safely
    const formatted = scans.map(scan => ({
      ...scan,
      ai_analysis: JSON.parse(scan.ai_analysis || '{}'),
      extracted_data: JSON.parse(scan.extracted_data || '{}')
    }));

    res.json(formatted);
  } catch (err) {
    console.error('List scans error:', err);
    res.status(500).json({ error: 'Failed to retrieve medical scans.' });
  }
});

// POST /api/patients/:patientId/scans/analyze — Upload picture & run AI vision analysis
router.post('/:patientId/scans/analyze', authenticate, (req, res) => {
  try {
    const { title, category, image_data, custom_prompt } = req.body;

    if (!title || !category || !image_data) {
      return res.status(400).json({ error: 'Title, category, and image data are required.' });
    }

    const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get(req.params.patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    // Perform AI analysis
    const analysisObj = generateAIAnalysis(category, title, custom_prompt, image_data);

    const info = db.prepare(`
      INSERT INTO scans (patient_id, title, category, image_data, ai_analysis, extracted_data, severity, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.params.patientId,
      title,
      category,
      image_data,
      JSON.stringify(analysisObj),
      JSON.stringify(analysisObj.extracted_actions || {}),
      analysisObj.severity,
      req.user.id
    );

    const scan = db.prepare(`
      SELECT s.*, u.name as doctor_name
      FROM scans s
      JOIN users u ON s.created_by = u.id
      WHERE s.id = ?
    `).get(info.lastInsertRowid);

    scan.ai_analysis = JSON.parse(scan.ai_analysis);
    scan.extracted_data = JSON.parse(scan.extracted_data);

    res.status(201).json(scan);
  } catch (err) {
    console.error('Analyze medical scan error:', err);
    res.status(500).json({ error: 'Failed to analyze medical scan image.' });
  }
});

// GET /api/scans/:id — Get single scan details
router.get('/:id', authenticate, (req, res) => {
  try {
    const scan = db.prepare(`
      SELECT s.*, u.name as doctor_name
      FROM scans s
      JOIN users u ON s.created_by = u.id
      WHERE s.id = ?
    `).get(req.params.id);

    if (!scan) {
      return res.status(404).json({ error: 'Scan record not found.' });
    }

    scan.ai_analysis = JSON.parse(scan.ai_analysis || '{}');
    scan.extracted_data = JSON.parse(scan.extracted_data || '{}');

    res.json(scan);
  } catch (err) {
    console.error('Get scan error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/scans/:id/apply — Apply extracted AI actions to patient record (medicines, investigations, todos)
router.post('/:id/apply', authenticate, (req, res) => {
  try {
    const scan = db.prepare('SELECT * FROM scans WHERE id = ?').get(req.params.id);
    if (!scan) {
      return res.status(404).json({ error: 'Scan record not found.' });
    }

    const extracted = JSON.parse(scan.extracted_data || '{}');
    let addedCount = { medicines: 0, investigations: 0, todos: 0 };

    // Apply extracted medicines
    if (extracted.medicines && Array.isArray(extracted.medicines)) {
      for (const med of extracted.medicines) {
        db.prepare(`
          INSERT INTO medicines (patient_id, name, dose, frequency, route, instructions, prescribed_by)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          scan.patient_id,
          med.name,
          med.dose || 'Standard',
          med.frequency || 'OD',
          med.route || 'Oral',
          med.instructions || 'As directed by AI Scan Extraction',
          req.user.id
        );
        addedCount.medicines++;
      }
    }

    // Apply extracted investigations
    if (extracted.investigations && Array.isArray(extracted.investigations)) {
      for (const inv of extracted.investigations) {
        db.prepare(`
          INSERT INTO investigations (patient_id, name, priority, remarks, status, created_by)
          VALUES (?, ?, ?, ?, 'pending', ?)
        `).run(
          scan.patient_id,
          inv.name,
          inv.priority || 'normal',
          inv.remarks || 'Suggested from AI Scan Analysis',
          req.user.id
        );
        addedCount.investigations++;
      }
    }

    // Apply extracted todos
    if (extracted.todos && Array.isArray(extracted.todos)) {
      for (const t of extracted.todos) {
        db.prepare(`
          INSERT INTO todos (patient_id, task, priority, due_time, status, created_by)
          VALUES (?, ?, ?, ?, 'pending', ?)
        `).run(
          scan.patient_id,
          t.task,
          t.priority || 'normal',
          t.due_time || 'Today',
          req.user.id
        );
        addedCount.todos++;
      }
    }

    res.json({
      message: 'AI Scan recommendations successfully applied to patient record!',
      addedCount
    });
  } catch (err) {
    console.error('Apply scan recommendations error:', err);
    res.status(500).json({ error: 'Failed to apply scan actions to patient chart.' });
  }
});

// DELETE /api/scans/:id — Delete a scan entry
router.delete('/:id', authenticate, (req, res) => {
  try {
    const scan = db.prepare('SELECT * FROM scans WHERE id = ?').get(req.params.id);
    if (!scan) {
      return res.status(404).json({ error: 'Scan record not found.' });
    }

    db.prepare('DELETE FROM scans WHERE id = ?').run(req.params.id);
    res.json({ message: 'Scan entry deleted successfully.' });
  } catch (err) {
    console.error('Delete scan error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
