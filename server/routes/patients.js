import { Router } from 'express';
import db from '../db/schema.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/patients — list all patients with optional search
router.get('/', authenticate, (req, res) => {
  try {
    const { search } = req.query;
    let patients;

    if (search) {
      patients = db.prepare(`
        SELECT * FROM patients 
        WHERE name LIKE ? OR uhid LIKE ? OR ward LIKE ?
        ORDER BY updated_at DESC
      `).all(`%${search}%`, `%${search}%`, `%${search}%`);
    } else {
      patients = db.prepare('SELECT * FROM patients ORDER BY updated_at DESC').all();
    }

    res.json(patients);
  } catch (err) {
    console.error('List patients error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/patients/:id — get patient detail with counts
router.get('/:id', authenticate, (req, res) => {
  try {
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    // Get counts for dashboard summary
    const pendingInvestigations = db.prepare(
      "SELECT COUNT(*) as count FROM investigations WHERE patient_id = ? AND status != 'completed'"
    ).get(req.params.id).count;

    const pendingTodos = db.prepare(
      "SELECT COUNT(*) as count FROM todos WHERE patient_id = ? AND status = 'pending'"
    ).get(req.params.id).count;

    const totalMedicines = db.prepare(
      'SELECT COUNT(*) as count FROM medicines WHERE patient_id = ?'
    ).get(req.params.id).count;

    // Get latest instructions
    const latestInstruction = db.prepare(`
      SELECT i.*, u.name as doctor_name 
      FROM instructions i 
      JOIN users u ON i.written_by = u.id 
      WHERE i.patient_id = ? 
      ORDER BY i.created_at DESC 
      LIMIT 1
    `).get(req.params.id);

    res.json({
      ...patient,
      pendingInvestigations,
      pendingTodos,
      totalMedicines,
      latestInstruction,
    });
  } catch (err) {
    console.error('Get patient error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/patients — create new patient information record
router.post('/', authenticate, (req, res) => {
  try {
    const { name, age, gender, blood_group, contact, ward, bed, admission_date, medical_info, uhid } = req.body;

    if (!name || !age) {
      return res.status(400).json({ error: 'Patient name and age are required.' });
    }

    // Auto-generate UHID if not provided
    let finalUhid = (uhid || '').trim();
    if (!finalUhid) {
      const randomId = Math.floor(10000 + Math.random() * 90000);
      finalUhid = `UHID-${randomId}`;
    }

    const finalGender = gender || 'Male';
    const finalAdmissionDate = admission_date || new Date().toISOString().split('T')[0];

    const result = db.prepare(`
      INSERT INTO patients (uhid, name, age, gender, blood_group, contact, ward, bed, admission_date, medical_info)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      finalUhid,
      name,
      parseInt(age, 10),
      finalGender,
      blood_group || null,
      contact || null,
      ward || 'General Ward',
      bed || 'Bed 1',
      finalAdmissionDate,
      medical_info || null
    );

    const newPatient = db.prepare('SELECT * FROM patients WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newPatient);
  } catch (err) {
    console.error('Create patient error:', err);
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'A patient with this UHID already exists.' });
    }
    res.status(500).json({ error: 'Server error while adding patient information.' });
  }
});

// PUT /api/patients/:id — update patient info (doctor or nurse)
router.put('/:id', authenticate, (req, res) => {
  try {
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    const { name, age, gender, blood_group, contact, ward, bed, medical_info } = req.body;

    db.prepare(`
      UPDATE patients SET
        name = COALESCE(?, name),
        age = COALESCE(?, age),
        gender = COALESCE(?, gender),
        blood_group = COALESCE(?, blood_group),
        contact = COALESCE(?, contact),
        ward = COALESCE(?, ward),
        bed = COALESCE(?, bed),
        medical_info = COALESCE(?, medical_info),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name || null, age || null, gender || null, blood_group || null,
      contact || null, ward || null, bed || null, medical_info || null,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error('Update patient error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/patients/:id — delete patient record (doctor only)
router.delete('/:id', authenticate, requireRole('doctor'), (req, res) => {
  try {
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    db.prepare('DELETE FROM patients WHERE id = ?').run(req.params.id);
    res.json({ message: 'Patient information deleted successfully.' });
  } catch (err) {
    console.error('Delete patient error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;

