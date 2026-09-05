import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Modal from './Modal';

export default function InstructionsBanner({ patient, instruction, onUpdate }) {
  const { user } = useAuth();
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [content, setContent] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [saving, setSaving] = useState(false);

  const isDoctor = user?.role === 'doctor';

  const handleWriteInstructions = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);
    try {
      await api.post(`/patients/${patient.id}/instructions`, {
        content: content.trim(),
        next_action: nextAction.trim() || null,
      });
      setContent('');
      setNextAction('');
      setShowWriteModal(false);
      onUpdate();
    } catch (err) {
      console.error('Failed to write instructions:', err);
    } finally {
      setSaving(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await api.get(`/patients/${patient.id}/instructions`);
      setHistory(res.data);
      setShowHistory(true);
    } catch (err) {
      console.error('Failed to load instruction history:', err);
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <>
      <div className="instructions-banner">
        <div className="instructions-banner-header">
          <h2 className="instructions-banner-title">
            {instruction ? '🔔' : '📝'} Instructions for Next Doctor
          </h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {instruction && (
              <button className="btn btn-ghost btn-sm" onClick={loadHistory}>
                History
              </button>
            )}
            {isDoctor && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowWriteModal(true)}>
                ✏️ Write Instructions
              </button>
            )}
          </div>
        </div>

        {instruction ? (
          <>
            <div className="instructions-banner-doctor">
              Written by {instruction.doctor_name} • {formatTime(instruction.created_at)}
            </div>
            <div className="instructions-content">{instruction.content}</div>
            {instruction.next_action && (
              <div className="instructions-next-action">
                <div className="instructions-next-action-label">Next Action</div>
                <div className="instructions-next-action-text">{instruction.next_action}</div>
              </div>
            )}
          </>
        ) : (
          <div className="instructions-empty">
            No instructions have been written yet.
            {isDoctor && ' Click "Write Instructions" to add handoff notes.'}
          </div>
        )}
      </div>

      {showWriteModal && (
        <Modal title="Write Instructions for Next Doctor" onClose={() => setShowWriteModal(false)}>
          <form className="write-instructions-form" onSubmit={handleWriteInstructions}>
            <div className="form-group">
              <label className="form-label">Instructions</label>
              <textarea
                className="form-textarea"
                placeholder="Write detailed instructions for the next doctor...&#10;&#10;• Current patient status&#10;• Key observations&#10;• Pending items&#10;• Important notes"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Next Action (Optional)</label>
              <textarea
                className="form-textarea"
                placeholder="What should the next doctor do first?"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                rows={3}
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowWriteModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Instructions'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showHistory && (
        <Modal title="Instructions History" onClose={() => setShowHistory(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.length === 0 ? (
              <p className="empty-state-text">No instructions history.</p>
            ) : (
              history.map((inst) => (
                <div key={inst.id} className="instruction-history-item">
                  <div className="instruction-history-header">
                    <span className="instruction-history-doctor">{inst.doctor_name}</span>
                    <span className="instruction-history-time">{formatTime(inst.created_at)}</span>
                  </div>
                  <div className="instruction-history-content">{inst.content}</div>
                  {inst.next_action && (
                    <div className="instructions-next-action" style={{ marginTop: '8px' }}>
                      <div className="instructions-next-action-label">Next Action</div>
                      <div className="instructions-next-action-text">{inst.next_action}</div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
