import { Router } from 'express';
import db from '../db/schema.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/patients/:patientId/todos
router.get('/:patientId/todos', authenticate, (req, res) => {
  try {
    const todos = db.prepare(`
      SELECT t.*, 
        creator.name as created_by_name,
        completer.name as completed_by_name
      FROM todos t
      JOIN users creator ON t.created_by = creator.id
      LEFT JOIN users completer ON t.completed_by = completer.id
      WHERE t.patient_id = ?
      ORDER BY 
        CASE t.status WHEN 'pending' THEN 0 ELSE 1 END,
        CASE t.priority 
          WHEN 'urgent' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'normal' THEN 3 
          WHEN 'low' THEN 4 
        END,
        t.created_at DESC
    `).all(req.params.patientId);

    res.json(todos);
  } catch (err) {
    console.error('List todos error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/patients/:patientId/todos (doctor only)
router.post('/:patientId/todos', authenticate, requireRole('doctor'), (req, res) => {
  try {
    const { task, priority, due_time } = req.body;

    if (!task) {
      return res.status(400).json({ error: 'Task description is required.' });
    }

    const info = db.prepare(`
      INSERT INTO todos (patient_id, task, priority, due_time, created_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      req.params.patientId,
      task,
      priority || 'normal',
      due_time || null,
      req.user.id
    );

    const todo = db.prepare(`
      SELECT t.*, 
        creator.name as created_by_name,
        completer.name as completed_by_name
      FROM todos t
      JOIN users creator ON t.created_by = creator.id
      LEFT JOIN users completer ON t.completed_by = completer.id
      WHERE t.id = ?
    `).get(info.lastInsertRowid);

    res.status(201).json(todo);
  } catch (err) {
    console.error('Create todo error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/todos/:id — doctor can edit, nurse can mark complete
router.put('/:id', authenticate, (req, res) => {
  try {
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: 'TODO not found.' });
    }

    const { task, priority, due_time, status } = req.body;

    // Nurses can only mark as completed
    if (req.user.role === 'nurse') {
      if (task || priority || due_time) {
        return res.status(403).json({ error: 'Nurses can only mark TODOs as completed.' });
      }

      db.prepare(`
        UPDATE todos SET 
          status = 'completed', 
          completed_by = ?,
          updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(req.user.id, req.params.id);
    } else {
      // Doctors can edit everything
      db.prepare(`
        UPDATE todos SET
          task = COALESCE(?, task),
          priority = COALESCE(?, priority),
          due_time = COALESCE(?, due_time),
          status = COALESCE(?, status),
          completed_by = CASE WHEN ? = 'completed' THEN COALESCE(completed_by, ?) ELSE completed_by END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        task || null, priority || null, due_time || null, status || null,
        status || '', req.user.id, req.params.id
      );
    }

    const updated = db.prepare(`
      SELECT t.*, 
        creator.name as created_by_name,
        completer.name as completed_by_name
      FROM todos t
      JOIN users creator ON t.created_by = creator.id
      LEFT JOIN users completer ON t.completed_by = completer.id
      WHERE t.id = ?
    `).get(req.params.id);

    res.json(updated);
  } catch (err) {
    console.error('Update todo error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/todos/:id (doctor only)
router.delete('/:id', authenticate, requireRole('doctor'), (req, res) => {
  try {
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: 'TODO not found.' });
    }

    db.prepare('DELETE FROM todos WHERE id = ?').run(req.params.id);
    res.json({ message: 'TODO deleted.' });
  } catch (err) {
    console.error('Delete todo error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
