import { Router } from 'express';
import db from '../db/schema.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/patients/:patientId/bystander-briefs — get all briefs (latest first)
router.get('/:patientId/bystander-briefs', authenticate, (req, res) => {
  try {
    const briefs = db.prepare(`
      SELECT b.*, u.name as doctor_name
      FROM bystander_briefs b
      JOIN users u ON b.written_by = u.id
      WHERE b.patient_id = ?
      ORDER BY b.created_at DESC
    `).all(req.params.patientId);

    res.json(briefs);
  } catch (err) {
    console.error('List bystander briefs error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/patients/:patientId/bystander-briefs (doctor only)
router.post('/:patientId/bystander-briefs', authenticate, requireRole('doctor'), (req, res) => {
  try {
    const { current_situation, plan_of_management, recovery_expectations } = req.body;

    if (!current_situation || !plan_of_management || !recovery_expectations) {
      return res.status(400).json({ error: 'All three fields are required: current situation, plan of management, and recovery expectations.' });
    }

    const info = db.prepare(`
      INSERT INTO bystander_briefs (patient_id, current_situation, plan_of_management, recovery_expectations, written_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      req.params.patientId,
      current_situation,
      plan_of_management,
      recovery_expectations,
      req.user.id
    );

    const brief = db.prepare(`
      SELECT b.*, u.name as doctor_name
      FROM bystander_briefs b
      JOIN users u ON b.written_by = u.id
      WHERE b.id = ?
    `).get(info.lastInsertRowid);

    res.status(201).json(brief);
  } catch (err) {
    console.error('Create bystander brief error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/bystander-briefs/:id (doctor only)
router.put('/:id', authenticate, requireRole('doctor'), (req, res) => {
  try {
    const brief = db.prepare('SELECT * FROM bystander_briefs WHERE id = ?').get(req.params.id);
    if (!brief) {
      return res.status(404).json({ error: 'Bystander brief not found.' });
    }

    const { current_situation, plan_of_management, recovery_expectations } = req.body;

    db.prepare(`
      UPDATE bystander_briefs SET
        current_situation = COALESCE(?, current_situation),
        plan_of_management = COALESCE(?, plan_of_management),
        recovery_expectations = COALESCE(?, recovery_expectations),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      current_situation || null,
      plan_of_management || null,
      recovery_expectations || null,
      req.params.id
    );

    const updated = db.prepare(`
      SELECT b.*, u.name as doctor_name
      FROM bystander_briefs b
      JOIN users u ON b.written_by = u.id
      WHERE b.id = ?
    `).get(req.params.id);

    res.json(updated);
  } catch (err) {
    console.error('Update bystander brief error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/bystander-briefs/:id (doctor only)
router.delete('/:id', authenticate, requireRole('doctor'), (req, res) => {
  try {
    const brief = db.prepare('SELECT * FROM bystander_briefs WHERE id = ?').get(req.params.id);
    if (!brief) {
      return res.status(404).json({ error: 'Bystander brief not found.' });
    }

    db.prepare('DELETE FROM bystander_briefs WHERE id = ?').run(req.params.id);
    res.json({ message: 'Bystander brief deleted.' });
  } catch (err) {
    console.error('Delete bystander brief error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
