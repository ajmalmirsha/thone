import { Router } from 'express';
import db from '../db/schema.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/patients/:patientId/investigations
router.get('/:patientId/investigations', authenticate, (req, res) => {
  try {
    const investigations = db.prepare(`
      SELECT inv.*, u.name as created_by_name
      FROM investigations inv
      JOIN users u ON inv.created_by = u.id
      WHERE inv.patient_id = ?
      ORDER BY 
        CASE inv.priority 
          WHEN 'urgent' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'normal' THEN 3 
          WHEN 'low' THEN 4 
        END,
        inv.created_at DESC
    `).all(req.params.patientId);

    res.json(investigations);
  } catch (err) {
    console.error('List investigations error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/patients/:patientId/investigations (doctor only)
router.post('/:patientId/investigations', authenticate, requireRole('doctor'), (req, res) => {
  try {
    const { name, status, priority, result, remarks } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Investigation name is required.' });
    }

    const info = db.prepare(`
      INSERT INTO investigations (patient_id, name, status, priority, result, remarks, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.params.patientId,
      name,
      status || 'pending',
      priority || 'normal',
      result || null,
      remarks || null,
      req.user.id
    );

    const investigation = db.prepare(`
      SELECT inv.*, u.name as created_by_name
      FROM investigations inv
      JOIN users u ON inv.created_by = u.id
      WHERE inv.id = ?
    `).get(info.lastInsertRowid);

    res.status(201).json(investigation);
  } catch (err) {
    console.error('Create investigation error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/investigations/:id (doctor only)
router.put('/:id', authenticate, requireRole('doctor'), (req, res) => {
  try {
    const investigation = db.prepare('SELECT * FROM investigations WHERE id = ?').get(req.params.id);
    if (!investigation) {
      return res.status(404).json({ error: 'Investigation not found.' });
    }

    const { name, status, priority, result, remarks } = req.body;

    db.prepare(`
      UPDATE investigations SET
        name = COALESCE(?, name),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        result = COALESCE(?, result),
        remarks = COALESCE(?, remarks),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name || null, status || null, priority || null,
      result || null, remarks || null, req.params.id
    );

    const updated = db.prepare(`
      SELECT inv.*, u.name as created_by_name
      FROM investigations inv
      JOIN users u ON inv.created_by = u.id
      WHERE inv.id = ?
    `).get(req.params.id);

    res.json(updated);
  } catch (err) {
    console.error('Update investigation error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/investigations/:id (doctor only)
router.delete('/:id', authenticate, requireRole('doctor'), (req, res) => {
  try {
    const investigation = db.prepare('SELECT * FROM investigations WHERE id = ?').get(req.params.id);
    if (!investigation) {
      return res.status(404).json({ error: 'Investigation not found.' });
    }

    db.prepare('DELETE FROM investigations WHERE id = ?').run(req.params.id);
    res.json({ message: 'Investigation deleted.' });
  } catch (err) {
    console.error('Delete investigation error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
