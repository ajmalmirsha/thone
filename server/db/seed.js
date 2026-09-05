import bcrypt from 'bcryptjs';
import db from './schema.js';

console.log('🌱 Seeding database...\n');

// Clear existing data
db.exec(`
  DELETE FROM administrations;
  DELETE FROM instructions;
  DELETE FROM bystander_briefs;
  DELETE FROM scans;
  DELETE FROM medicines;
  DELETE FROM todos;
  DELETE FROM investigations;
  DELETE FROM patients;
  DELETE FROM users;
`);

// --- Users ---
const hashPassword = (pw) => bcrypt.hashSync(pw, 10);

const insertUser = db.prepare(
  'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
);

const drSmith = insertUser.run('Dr. Sarah Smith', 'dr.smith@hospital.com', hashPassword('doctor123'), 'doctor');
const drJones = insertUser.run('Dr. Michael Jones', 'dr.jones@hospital.com', hashPassword('doctor123'), 'doctor');
const nurseAnna = insertUser.run('Anna Williams', 'nurse.anna@hospital.com', hashPassword('nurse123'), 'nurse');
const nurseJohn = insertUser.run('John Carter', 'nurse.john@hospital.com', hashPassword('nurse123'), 'nurse');

console.log('✅ Users created');

// --- Patients ---
const insertPatient = db.prepare(`
  INSERT INTO patients (uhid, name, age, gender, blood_group, contact, ward, bed, admission_date, medical_info)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const p1 = insertPatient.run('UHID-10293', 'John Doe', 56, 'Male', 'O+', '+91 9876543210', 'Ward 3', 'Bed 12', '2026-09-01', 'Hypertension, Type 2 Diabetes. History of cardiac events. Currently stable on medication.');
const p2 = insertPatient.run('UHID-10294', 'Mary Johnson', 34, 'Female', 'A+', '+91 9876543211', 'Ward 2', 'Bed 5', '2026-09-03', 'Post-appendectomy recovery. No known allergies. Vitals stable.');
const p3 = insertPatient.run('UHID-10295', 'Robert Williams', 72, 'Male', 'B-', '+91 9876543212', 'ICU', 'Bed 1', '2026-08-28', 'COPD exacerbation. On oxygen therapy. History of smoking (40 years). Kidney function mildly impaired.');
const p4 = insertPatient.run('UHID-10296', 'Priya Sharma', 28, 'Female', 'AB+', '+91 9876543213', 'Ward 1', 'Bed 8', '2026-09-04', 'Dengue fever. Platelet count dropping. Under close monitoring.');
const p5 = insertPatient.run('UHID-10297', 'Ahmed Khan', 45, 'Male', 'A-', '+91 9876543214', 'Ward 3', 'Bed 3', '2026-09-02', 'Fracture left femur. Post-surgical. Pain management ongoing. No other comorbidities.');

console.log('✅ Patients created');

// --- Investigations for Patient 1 (John Doe) ---
const insertInv = db.prepare(`
  INSERT INTO investigations (patient_id, name, status, priority, result, remarks, created_by)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

insertInv.run(p1.lastInsertRowid, 'CBC (Complete Blood Count)', 'completed', 'normal', 'Normal', 'All values within range. WBC 7200, RBC 4.8M, Platelets 250K', drSmith.lastInsertRowid);
insertInv.run(p1.lastInsertRowid, 'MRI Brain', 'pending', 'high', null, 'Scheduled for tomorrow morning', drSmith.lastInsertRowid);
insertInv.run(p1.lastInsertRowid, 'Blood Sugar (Fasting)', 'pending', 'normal', null, null, drSmith.lastInsertRowid);
insertInv.run(p1.lastInsertRowid, 'Lipid Profile', 'completed', 'normal', 'Borderline High', 'Total Cholesterol: 220, LDL: 145, HDL: 42', drSmith.lastInsertRowid);
insertInv.run(p1.lastInsertRowid, 'ECG', 'completed', 'high', 'Normal Sinus Rhythm', 'No acute changes', drSmith.lastInsertRowid);

// Investigations for Patient 3 (Robert Williams)
insertInv.run(p3.lastInsertRowid, 'Chest X-Ray', 'completed', 'urgent', 'Hyperinflated lungs', 'Consistent with COPD', drJones.lastInsertRowid);
insertInv.run(p3.lastInsertRowid, 'ABG (Arterial Blood Gas)', 'pending', 'urgent', null, 'To monitor oxygen levels', drJones.lastInsertRowid);
insertInv.run(p3.lastInsertRowid, 'Kidney Function Test', 'in_progress', 'high', null, 'Creatinine was elevated last time', drJones.lastInsertRowid);

// Investigations for Patient 4 (Priya Sharma)
insertInv.run(p4.lastInsertRowid, 'Platelet Count', 'completed', 'urgent', '85,000/μL', 'Below normal. Repeat in 6 hours', drSmith.lastInsertRowid);
insertInv.run(p4.lastInsertRowid, 'Dengue NS1 Antigen', 'completed', 'high', 'Positive', 'Confirmed dengue', drSmith.lastInsertRowid);
insertInv.run(p4.lastInsertRowid, 'Liver Function Test', 'pending', 'high', null, null, drSmith.lastInsertRowid);

console.log('✅ Investigations created');

// --- TODOs ---
const insertTodo = db.prepare(`
  INSERT INTO todos (patient_id, task, priority, due_time, status, completed_by, created_by)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

// Patient 1 TODOs
insertTodo.run(p1.lastInsertRowid, 'Collect blood sample for fasting sugar', 'high', '10:00 PM', 'completed', nurseAnna.lastInsertRowid, drSmith.lastInsertRowid);
insertTodo.run(p1.lastInsertRowid, 'Review MRI report when available', 'high', null, 'pending', null, drSmith.lastInsertRowid);
insertTodo.run(p1.lastInsertRowid, 'Check BP every 4 hours', 'normal', null, 'pending', null, drSmith.lastInsertRowid);
insertTodo.run(p1.lastInsertRowid, 'Monitor fluid intake', 'normal', null, 'pending', null, drSmith.lastInsertRowid);

// Patient 3 TODOs
insertTodo.run(p3.lastInsertRowid, 'Check SpO2 every 2 hours', 'urgent', null, 'pending', null, drJones.lastInsertRowid);
insertTodo.run(p3.lastInsertRowid, 'Titrate oxygen flow based on ABG', 'high', null, 'pending', null, drJones.lastInsertRowid);
insertTodo.run(p3.lastInsertRowid, 'Nebulization every 6 hours', 'high', null, 'completed', nurseJohn.lastInsertRowid, drJones.lastInsertRowid);

// Patient 4 TODOs
insertTodo.run(p4.lastInsertRowid, 'Monitor platelet count every 6 hours', 'urgent', null, 'pending', null, drSmith.lastInsertRowid);
insertTodo.run(p4.lastInsertRowid, 'Ensure IV fluids running', 'high', null, 'pending', null, drSmith.lastInsertRowid);
insertTodo.run(p4.lastInsertRowid, 'Watch for bleeding signs', 'urgent', null, 'pending', null, drSmith.lastInsertRowid);

console.log('✅ TODOs created');

// --- Medicines ---
const insertMed = db.prepare(`
  INSERT INTO medicines (patient_id, name, dose, frequency, route, instructions, prescribed_by)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

// Patient 1 Medicines
const med1 = insertMed.run(p1.lastInsertRowid, 'Paracetamol', '500 mg', '1-1-1', 'Oral', 'After food', drSmith.lastInsertRowid);
const med2 = insertMed.run(p1.lastInsertRowid, 'Amoxicillin', '500 mg', '1-0-1', 'Oral', 'Before food', drSmith.lastInsertRowid);
const med3 = insertMed.run(p1.lastInsertRowid, 'Insulin (Mixtard)', '10 units', 'Before meals', 'Subcutaneous', 'Check blood sugar before administering', drSmith.lastInsertRowid);
const med4 = insertMed.run(p1.lastInsertRowid, 'Amlodipine', '5 mg', '0-0-1', 'Oral', 'At bedtime', drSmith.lastInsertRowid);
const med5 = insertMed.run(p1.lastInsertRowid, 'Metformin', '500 mg', '1-0-1', 'Oral', 'After food', drSmith.lastInsertRowid);

// Patient 3 Medicines
const med6 = insertMed.run(p3.lastInsertRowid, 'Salbutamol Nebulization', '2.5 mg', 'Every 6 hours', 'Inhalation', null, drJones.lastInsertRowid);
const med7 = insertMed.run(p3.lastInsertRowid, 'Prednisolone', '40 mg', '1-0-0', 'Oral', 'With food. Taper over 5 days', drJones.lastInsertRowid);
const med8 = insertMed.run(p3.lastInsertRowid, 'Ipratropium Nebulization', '500 mcg', 'Every 8 hours', 'Inhalation', null, drJones.lastInsertRowid);

// Patient 4 Medicines
const med9 = insertMed.run(p4.lastInsertRowid, 'IV Normal Saline', '1000 mL', 'Over 8 hours', 'IV', 'Maintain hydration', drSmith.lastInsertRowid);
const med10 = insertMed.run(p4.lastInsertRowid, 'Paracetamol', '650 mg', '1-1-1', 'Oral', 'For fever. SOS if temp > 101°F', drSmith.lastInsertRowid);

console.log('✅ Medicines created');

// --- Administrations ---
const insertAdmin = db.prepare(`
  INSERT INTO administrations (medicine_id, administered_by, status, notes, administered_at)
  VALUES (?, ?, ?, ?, ?)
`);

// Some medicines administered
insertAdmin.run(med1.lastInsertRowid, nurseAnna.lastInsertRowid, 'given', null, '2026-09-05 08:42:00');
insertAdmin.run(med2.lastInsertRowid, nurseAnna.lastInsertRowid, 'given', null, '2026-09-05 08:30:00');
insertAdmin.run(med4.lastInsertRowid, nurseJohn.lastInsertRowid, 'given', null, '2026-09-04 22:00:00');
insertAdmin.run(med5.lastInsertRowid, nurseAnna.lastInsertRowid, 'given', 'Patient had food before administration', '2026-09-05 08:45:00');
insertAdmin.run(med6.lastInsertRowid, nurseJohn.lastInsertRowid, 'given', null, '2026-09-05 06:00:00');
insertAdmin.run(med7.lastInsertRowid, nurseJohn.lastInsertRowid, 'given', null, '2026-09-05 08:00:00');

console.log('✅ Administrations created');

// --- Instructions ---
const insertInstruction = db.prepare(`
  INSERT INTO instructions (patient_id, content, next_action, written_by, created_at)
  VALUES (?, ?, ?, ?, ?)
`);

// Patient 1 instructions
insertInstruction.run(
  p1.lastInsertRowid,
  'Patient is currently stable.\n\n• Monitor BP regularly — was slightly elevated at 150/90 during evening rounds.\n• Review MRI Brain report when available — ordered to rule out any neurological cause for recent dizziness.\n• Continue current medication — no changes needed.\n• Patient complained of mild dizziness at 8 PM — likely positional. Observe.\n• Fasting blood sugar sample to be collected at 10 PM.',
  'Review investigation results (MRI + Fasting Sugar) and reassess patient in morning rounds. Consider adjusting antihypertensive if BP remains elevated.',
  drSmith.lastInsertRowid,
  '2026-09-05 20:30:00'
);

// Patient 3 instructions
insertInstruction.run(
  p3.lastInsertRowid,
  'Patient remains on O2 support — currently on 4L/min via nasal cannula.\n\n• SpO2 maintaining at 92-94% on current settings.\n• Nebulization being given every 6 hours — patient reports mild relief.\n• Kidney function needs close monitoring — creatinine was 1.8 last check.\n• Patient is alert and oriented but complains of breathlessness on exertion.',
  'Await ABG results. If PaO2 < 60, consider escalating to BiPAP. Renal team consultation if creatinine rises above 2.0.',
  drJones.lastInsertRowid,
  '2026-09-05 19:00:00'
);

// Patient 4 instructions
insertInstruction.run(
  p4.lastInsertRowid,
  'Confirmed Dengue — NS1 positive.\n\n• Platelet count at 85,000 and trending down — was 1.2L yesterday.\n• Currently on IV fluids for hydration.\n• No active bleeding — but watch for petechiae, gum bleeding, or melena.\n• Patient is febrile (100.8°F at last check) — Paracetamol given.',
  'Repeat platelet count in 6 hours. If platelets drop below 50,000, consider platelet transfusion. Continue supportive care.',
  drSmith.lastInsertRowid,
  '2026-09-05 21:00:00'
);

console.log('✅ Instructions created');

// --- Bystander Briefs ---
const insertBrief = db.prepare(`
  INSERT INTO bystander_briefs (patient_id, current_situation, plan_of_management, recovery_expectations, written_by, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

// Patient 1 (John Doe) — Hypertension + Diabetes
insertBrief.run(
  p1.lastInsertRowid,
  'Your father is currently stable and resting comfortably. His blood pressure was slightly elevated this evening (150/90), which we are monitoring closely. He experienced some mild dizziness around 8 PM, but it resolved on its own. His blood sugar levels are being checked regularly.',
  'We are continuing his current medications for blood pressure and diabetes. We have ordered an MRI scan of his brain to rule out any neurological cause for the dizziness — this is a precautionary measure. A fasting blood sugar test will be done tonight. His heart rhythm (ECG) looks normal.',
  'We expect his blood pressure to stabilize over the next 1-2 days with medication adjustments. The MRI results will help us understand the dizziness better. Overall, he is in a stable condition and we anticipate a positive recovery. We will keep you updated after morning rounds.',
  drSmith.lastInsertRowid,
  '2026-09-05 20:45:00'
);

// Patient 3 (Robert Williams) — COPD
insertBrief.run(
  p3.lastInsertRowid,
  'Your father has been admitted with a worsening of his chronic lung condition (COPD). He is currently on oxygen support through a nasal cannula at 4 liters per minute. His oxygen levels are maintaining between 92-94%, which is acceptable. He is alert, can speak in full sentences, but gets breathless when he tries to move around.',
  'We are treating him with nebulization (breathing treatments) every 6 hours to open his airways, along with steroid medication to reduce the inflammation in his lungs. We have ordered blood tests to check his oxygen levels more precisely and to monitor his kidney function. If his condition does not improve with current treatment, we may need to use a special breathing mask (BiPAP).',
  'COPD flare-ups typically take 5-7 days to improve with treatment. Given his age (72) and the severity, he will need to stay in the ICU for close monitoring for at least 3-4 days. We expect gradual improvement, but full recovery to his baseline may take 2-3 weeks. Long-term, we will discuss a plan to prevent future episodes.',
  drJones.lastInsertRowid,
  '2026-09-05 19:15:00'
);

// Patient 4 (Priya Sharma) — Dengue
insertBrief.run(
  p4.lastInsertRowid,
  'Your daughter has been diagnosed with dengue fever. She currently has a mild fever (100.8°F) and is feeling weak. Her platelet count is at 85,000 — this is below normal (normal range is 1.5-4 lakh) but not at a critical level yet. There is no sign of active bleeding.',
  'We are giving her IV fluids to keep her hydrated, which is the most important part of dengue treatment. We are checking her platelet count every 6 hours to track the trend. She is receiving paracetamol for fever — please note that no other painkillers (like ibuprofen or aspirin) should be given as they can worsen bleeding risk. We are also monitoring her liver function.',
  'Dengue fever typically peaks around day 4-5 of illness and then starts improving. The platelet count may drop further over the next 1-2 days before it starts recovering — this is the expected course. Most patients recover fully within 7-10 days. We are monitoring her closely during this critical phase and will keep you informed of any changes.',
  drSmith.lastInsertRowid,
  '2026-09-05 21:15:00'
);

console.log('✅ Bystander briefs created');

// --- Medical Scans ---
const insertScan = db.prepare(`
  INSERT INTO scans (patient_id, title, category, image_data, ai_analysis, extracted_data, severity, created_by)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const sampleXraySvg = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="100%" height="100%">
    <rect width="600" height="500" fill="#0c1017"/>
    <text x="300" y="35" fill="#4a5568" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">CHEST RADIOGRAPH - AP VIEW (THONE IMAGING)</text>
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
    <text x="300" y="475" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="middle">Patient: UHID-10293 • AI Diagnostic Vision Ready</text>
  </svg>
`);

const sampleAnalysis = {
  summary: 'AI Vision Analysis detected localized opacification and patchy infiltrate in the right lower lobe, indicative of early stage bronchopneumonia. Trachea is midline, cardiac silhouette is within normal limits, and pleural spaces are clear.',
  findings: [
    'Patchy opacification / consolidation observed in Right Lower Lobe (RLL).',
    'Costophrenic angles remain sharp bilaterally.',
    'Cardiac silhouette size is normal (Cardiothoracic ratio < 0.5).',
    'No evidence of pneumothorax, pleural effusion, or acute osseous abnormality.'
  ],
  severity: 'moderate',
  confidence_score: '96%',
  key_metrics: [
    { name: 'Cardiothoracic Ratio', value: '0.46', unit: 'ratio', status: 'Normal' },
    { name: 'Infiltrate Extent', value: 'Localized RLL', unit: 'zone', status: 'Abnormal' },
    { name: 'Diaphragm Position', value: 'Normal', unit: '', status: 'Normal' }
  ],
  extracted_actions: {
    medicines: [
      { name: 'Amoxicillin/Clavulanate (Augmentin)', dose: '625 mg', frequency: 'TDS (Every 8 hours)', route: 'Oral', instructions: 'Take after meals for 7 days' },
      { name: 'Paracetamol', dose: '650 mg', frequency: 'SOS (As needed)', route: 'Oral', instructions: 'Take for fever > 100°F' }
    ],
    investigations: [
      { name: 'Repeat Chest X-Ray (AP View)', priority: 'normal', remarks: 'Evaluate resolution after 7 days of antibiotics' }
    ],
    todos: [
      { task: 'Monitor SpO2 every 4 hours and maintain oxygen therapy if < 95%', priority: 'high', due_time: 'Q4H' }
    ]
  }
};

insertScan.run(
  p1.lastInsertRowid,
  'Chest Radiograph - RLL Pneumonia Screening',
  'xray',
  sampleXraySvg,
  JSON.stringify(sampleAnalysis),
  JSON.stringify(sampleAnalysis.extracted_actions),
  'moderate',
  drSmith.lastInsertRowid
);

console.log('✅ Medical scans created');

console.log('\n🎉 Database seeded successfully!\n');
console.log('Demo accounts:');
console.log('  Doctor:  dr.smith@hospital.com / doctor123');
console.log('  Doctor:  dr.jones@hospital.com / doctor123');
console.log('  Nurse:   nurse.anna@hospital.com / nurse123');
console.log('  Nurse:   nurse.john@hospital.com / nurse123');
