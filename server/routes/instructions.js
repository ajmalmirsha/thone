import { Router } from 'express';
import db from '../db/schema.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/patients/:patientId/instructions — get all instructions (latest first)
router.get('/:patientId/instructions', authenticate, (req, res) => {
  try {
    const instructions = db.prepare(`
      SELECT i.*, u.name as doctor_name, u.email as doctor_email
      FROM instructions i
      JOIN users u ON i.written_by = u.id
      WHERE i.patient_id = ?
      ORDER BY i.created_at DESC
    `).all(req.params.patientId);

    res.json(instructions);
  } catch (err) {
    console.error('List instructions error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/patients/:patientId/instructions (doctor only)
router.post('/:patientId/instructions', authenticate, requireRole('doctor'), (req, res) => {
  try {
    const { content, next_action } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Instruction content is required.' });
    }

    const info = db.prepare(`
      INSERT INTO instructions (patient_id, content, next_action, written_by)
      VALUES (?, ?, ?, ?)
    `).run(
      req.params.patientId,
      content,
      next_action || null,
      req.user.id
    );

    const instruction = db.prepare(`
      SELECT i.*, u.name as doctor_name, u.email as doctor_email
      FROM instructions i
      JOIN users u ON i.written_by = u.id
      WHERE i.id = ?
    `).get(info.lastInsertRowid);

    res.status(201).json(instruction);
  } catch (err) {
    console.error('Create instruction error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
