import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Modal from './Modal';

export default function TodoList({ patientId }) {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ task: '', priority: 'normal', due_time: '' });

  const isDoctor = user?.role === 'doctor';

  useEffect(() => {
    fetchTodos();
  }, [patientId]);

  const fetchTodos = async () => {
    try {
      const res = await api.get(`/patients/${patientId}/todos`);
      setTodos(res.data);
    } catch (err) {
      console.error('Failed to fetch todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditItem(null);
    setForm({ task: '', priority: 'normal', due_time: '' });
    setShowModal(true);
  };

  const openEdit = (todo) => {
    setEditItem(todo);
    setForm({
      task: todo.task,
      priority: todo.priority,
      due_time: todo.due_time || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/todos/${editItem.id}`, form);
      } else {
        await api.post(`/patients/${patientId}/todos`, form);
      }
      setShowModal(false);
      fetchTodos();
    } catch (err) {
      console.error('Failed to save todo:', err);
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      if (todo.status === 'completed') {
        // Only doctors can un-complete
        if (!isDoctor) return;
        await api.put(`/todos/${todo.id}`, { status: 'pending' });
      } else {
        await api.put(`/todos/${todo.id}`, { status: 'completed' });
      }
      fetchTodos();
    } catch (err) {
      console.error('Failed to toggle todo:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this TODO?')) return;
    try {
      await api.delete(`/todos/${id}`);
      fetchTodos();
    } catch (err) {
      console.error('Failed to delete todo:', err);
    }
  };

  const priorityBadge = (priority) => `badge-priority-${priority}`;

  if (loading) {
    return <div className="loading"><div className="loading-spinner" /></div>;
  }

  return (
    <div className="tab-content animate-fade-in">
      <div className="section-header">
        <h3 className="section-title">
          ✅ Patient TODOs
          <span className="section-count">{todos.filter(t => t.status === 'pending').length} pending</span>
        </h3>
        {isDoctor && (
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            + Add TODO
          </button>
        )}
      </div>

      {todos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <p className="empty-state-text">No TODOs for this patient.</p>
          {isDoctor && (
            <button className="btn btn-primary" onClick={openAdd}>
              + Add TODO
            </button>
          )}
        </div>
      ) : (
        todos.map((todo) => (
          <div key={todo.id} className={`todo-item ${todo.status === 'completed' ? 'completed' : ''}`}>
            <div
              className={`todo-checkbox ${todo.status === 'completed' ? 'checked' : ''}`}
              onClick={() => handleToggleComplete(todo)}
            >
              {todo.status === 'completed' ? '✓' : ''}
            </div>
            <div className="todo-content">
              <div className="todo-task">{todo.task}</div>
              <div className="todo-meta">
                <span className={`badge ${priorityBadge(todo.priority)}`}>
                  {todo.priority}
                </span>
                {todo.due_time && (
                  <span className="todo-meta-item">
                    🕐 Due: {todo.due_time}
                  </span>
                )}
                {todo.status === 'completed' && todo.completed_by_name && (
                  <span className="todo-meta-item">
                    ✓ Completed by {todo.completed_by_name}
                  </span>
                )}
              </div>
            </div>
            {isDoctor && (
              <div className="todo-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(todo)}>✏️</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(todo.id)}>🗑️</button>
              </div>
            )}
          </div>
        ))
      )}

      {showModal && (
        <Modal
          title={editItem ? 'Edit TODO' : 'Add TODO'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Task</label>
              <input
                className="form-input"
                placeholder="e.g., Check BP every 4 hours"
                value={form.task}
                onChange={(e) => setForm({ ...form, task: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Time (Optional)</label>
                <input
                  className="form-input"
                  placeholder="e.g., 10:00 PM"
                  value={form.due_time}
                  onChange={(e) => setForm({ ...form, due_time: e.target.value })}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">
                {editItem ? 'Update' : 'Add'} TODO
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
