import { Router } from 'express';
import db from '../db/schema.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/patients/:patientId/medicines — list medicines with latest administration
router.get('/:patientId/medicines', authenticate, (req, res) => {
  try {
    const medicines = db.prepare(`
      SELECT m.*, u.name as prescribed_by_name
      FROM medicines m
      JOIN users u ON m.prescribed_by = u.id
      WHERE m.patient_id = ?
      ORDER BY m.created_at DESC
    `).all(req.params.patientId);

    // Attach latest administration for each medicine
    const medicinesWithAdmin = medicines.map((med) => {
      const latestAdmin = db.prepare(`
        SELECT a.*, u.name as administered_by_name
        FROM administrations a
        JOIN users u ON a.administered_by = u.id
        WHERE a.medicine_id = ?
        ORDER BY a.administered_at DESC
        LIMIT 1
      `).get(med.id);

      return { ...med, latestAdministration: latestAdmin || null };
    });

    res.json(medicinesWithAdmin);
  } catch (err) {
    console.error('List medicines error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/patients/:patientId/medicines — prescribe medicine (doctor only)
router.post('/:patientId/medicines', authenticate, requireRole('doctor'), (req, res) => {
  try {
    const { name, dose, frequency, route, instructions } = req.body;

    if (!name || !dose || !frequency) {
      return res.status(400).json({ error: 'Medicine name, dose, and frequency are required.' });
    }

    const info = db.prepare(`
      INSERT INTO medicines (patient_id, name, dose, frequency, route, instructions, prescribed_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.params.patientId,
      name, dose, frequency,
      route || 'Oral',
      instructions || null,
      req.user.id
    );

    const medicine = db.prepare(`
      SELECT m.*, u.name as prescribed_by_name
      FROM medicines m
      JOIN users u ON m.prescribed_by = u.id
      WHERE m.id = ?
    `).get(info.lastInsertRowid);

    res.status(201).json({ ...medicine, latestAdministration: null });
  } catch (err) {
    console.error('Prescribe medicine error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/medicines/:id — edit prescription (doctor only)
router.put('/:id', authenticate, requireRole('doctor'), (req, res) => {
  try {
    const medicine = db.prepare('SELECT * FROM medicines WHERE id = ?').get(req.params.id);
    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found.' });
    }

    const { name, dose, frequency, route, instructions } = req.body;

    db.prepare(`
      UPDATE medicines SET
        name = COALESCE(?, name),
        dose = COALESCE(?, dose),
        frequency = COALESCE(?, frequency),
        route = COALESCE(?, route),
        instructions = COALESCE(?, instructions)
      WHERE id = ?
    `).run(
      name || null, dose || null, frequency || null,
      route || null, instructions || null, req.params.id
    );

    const updated = db.prepare(`
      SELECT m.*, u.name as prescribed_by_name
      FROM medicines m
      JOIN users u ON m.prescribed_by = u.id
      WHERE m.id = ?
    `).get(req.params.id);

    res.json(updated);
  } catch (err) {
    console.error('Update medicine error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/medicines/:id — remove medicine (doctor only)
router.delete('/:id', authenticate, requireRole('doctor'), (req, res) => {
  try {
    const medicine = db.prepare('SELECT * FROM medicines WHERE id = ?').get(req.params.id);
    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found.' });
    }

    db.prepare('DELETE FROM medicines WHERE id = ?').run(req.params.id);
    res.json({ message: 'Medicine deleted.' });
  } catch (err) {
    console.error('Delete medicine error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/medicines/:id/administer — record administration
router.post('/:id/administer', authenticate, (req, res) => {
  try {
    const medicine = db.prepare('SELECT * FROM medicines WHERE id = ?').get(req.params.id);
    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found.' });
    }

    const { status, notes } = req.body;

    const info = db.prepare(`
      INSERT INTO administrations (medicine_id, administered_by, status, notes)
      VALUES (?, ?, ?, ?)
    `).run(
      req.params.id,
      req.user.id,
      status || 'given',
      notes || null
    );

    const administration = db.prepare(`
      SELECT a.*, u.name as administered_by_name
      FROM administrations a
      JOIN users u ON a.administered_by = u.id
      WHERE a.id = ?
    `).get(info.lastInsertRowid);

    res.status(201).json(administration);
  } catch (err) {
    console.error('Administer medicine error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
