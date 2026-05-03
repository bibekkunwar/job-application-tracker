import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJobById, deleteJob, updateJob, getStatuses, createStatus, updateStatus, deleteStatus } from '../api/jobs';

const STATUS_OPTIONS = ['applied', 'in progress', 'accepted', 'rejected', 'ghosted'];
const PLATFORM_OPTIONS = ['LinkedIn', 'Seek', 'Indeed', 'Company Website', 'Other'];
const ROUND_TYPES = ['phone screen', 'technical', 'HR round', 'other'];
const OUTCOMES = ['positive', 'negative', 'waiting'];

const STATUS_COLORS = {
  applied: 'bg-blue-100 text-blue-700',
  'in progress': 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  ghosted: 'bg-gray-100 text-gray-600',
};

function ApplicationDetail() {
  const { id } = useParams();
  const { token, handleUnauthorized } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit job state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Add round form state
  const [showForm, setShowForm] = useState(false);
  const [round, setRound] = useState('phone screen');
  const [date, setDate] = useState('');
  const [roundStatus, setRoundStatus] = useState('waiting');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit round state
  const [editingRoundId, setEditingRoundId] = useState(null);
  const [roundEditForm, setRoundEditForm] = useState({});
  const [savingRound, setSavingRound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobData, statusData] = await Promise.all([
          getJobById(token, id),
          getStatuses(token, id),
        ]);
        setJob(jobData[0]);
        setStatuses(statusData);
      } catch (err) {
        if (err.status === 401) { handleUnauthorized(); return; }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    try {
      await deleteJob(token, id);
      navigate('/');
    } catch (err) {
      if (err.status === 401) { handleUnauthorized(); return; }
      setError(err.message);
    }
  };

  const handleEditStart = () => {
    setEditForm({
      company_name: job.company_name,
      role: job.role,
      status: job.status,
      date_applied: job.date_applied?.split('T')[0] ?? '',
      platform: job.platform || '',
      job_url: job.job_url || '',
      notes: job.notes || '',
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateJob(token, id, editForm);
      setJob(updated[0]);
      setIsEditing(false);
    } catch (err) {
      if (err.status === 401) { handleUnauthorized(); return; }
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddStatus = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newStatus = await createStatus(token, id, { round, date, round_status: roundStatus, notes });
      setStatuses([...statuses, newStatus.data[0]]);
      setShowForm(false);
      setRound('phone screen');
      setDate('');
      setRoundStatus('waiting');
      setNotes('');
    } catch (err) {
      if (err.status === 401) { handleUnauthorized(); return; }
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoundEditStart = (s) => {
    setEditingRoundId(s.app_id);
    setRoundEditForm({
      round: s.round,
      date: s.date?.split('T')[0] ?? '',
      round_status: s.round_status || 'waiting',
      notes: s.notes || '',
    });
  };

  const handleRoundEditSave = async (e, statusId) => {
    e.preventDefault();
    setSavingRound(true);
    try {
      const updated = await updateStatus(token, id, statusId, roundEditForm);
      setStatuses(statuses.map((s) => s.app_id === statusId ? updated[0] : s));
      setEditingRoundId(null);
    } catch (err) {
      if (err.status === 401) { handleUnauthorized(); return; }
      setError(err.message);
    } finally {
      setSavingRound(false);
    }
  };

  const handleDeleteStatus = async (statusId) => {
    if (!confirm('Delete this interview round?')) return;
    try {
      await deleteStatus(token, id, statusId);
      setStatuses(statuses.filter((s) => s.app_id !== statusId));
    } catch (err) {
      if (err.status === 401) { handleUnauthorized(); return; }
      setError(err.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-red-500 text-sm">{error}</p>
    </div>
  );

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-800 text-sm"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Application Detail</h1>
        </div>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 text-sm font-medium"
        >
          Delete
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Job Details Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={editForm.company_name}
                    onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                  <input
                    type="text"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date Applied</label>
                  <input
                    type="date"
                    value={editForm.date_applied}
                    onChange={(e) => setEditForm({ ...editForm, date_applied: e.target.value })}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Platform</label>
                  <select
                    value={editForm.platform}
                    onChange={(e) => setEditForm({ ...editForm, platform: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select platform</option>
                    {PLATFORM_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Job URL</label>
                  <input
                    type="url"
                    value={editForm.job_url}
                    onChange={(e) => setEditForm({ ...editForm, job_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm py-2 rounded-lg transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{job.company_name}</h2>
                  <p className="text-gray-600 mt-1">{job.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[job.status] || 'bg-gray-100 text-gray-600'}`}>
                    {job.status}
                  </span>
                  <button
                    onClick={handleEditStart}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Date Applied</p>
                  <p className="text-gray-700">{new Date(job.date_applied).toLocaleDateString()}</p>
                </div>
                {job.platform && (
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Platform</p>
                    <p className="text-gray-700">{job.platform}</p>
                  </div>
                )}
                {job.job_url && (
                  <div className="col-span-2">
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Job URL</p>
                    <a href={job.job_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
                      {job.job_url}
                    </a>
                  </div>
                )}
                {job.notes && (
                  <div className="col-span-2">
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-gray-700">{job.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Interview Rounds */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Interview Rounds</h3>
            <button
              onClick={() => setShowForm(!showForm)}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-colors"
            >
              + Add Round
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddStatus} className="mb-6 bg-gray-50 rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Round Type</label>
                  <select
                    value={round}
                    onChange={(e) => setRound(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ROUND_TYPES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Outcome</label>
                <select
                  value={roundStatus}
                  onChange={(e) => setRoundStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {OUTCOMES.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="How did it go?"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm py-2 rounded-lg transition-colors"
                >
                  {submitting ? 'Saving...' : 'Save Round'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {statuses.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No interview rounds logged yet.</p>
          ) : (
            <div className="space-y-3">
              {[...statuses].sort((a, b) => new Date(a.date) - new Date(b.date)).map((s) => (
                <div key={s.app_id} className="py-3 border-b border-gray-50 last:border-0">
                  {editingRoundId === s.app_id ? (
                    <form onSubmit={(e) => handleRoundEditSave(e, s.app_id)} className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Round Type</label>
                          <select
                            value={roundEditForm.round}
                            onChange={(e) => setRoundEditForm({ ...roundEditForm, round: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {ROUND_TYPES.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                          <input
                            type="date"
                            value={roundEditForm.date}
                            onChange={(e) => setRoundEditForm({ ...roundEditForm, date: e.target.value })}
                            required
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Outcome</label>
                        <select
                          value={roundEditForm.round_status}
                          onChange={(e) => setRoundEditForm({ ...roundEditForm, round_status: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {OUTCOMES.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                        <textarea
                          value={roundEditForm.notes}
                          onChange={(e) => setRoundEditForm({ ...roundEditForm, notes: e.target.value })}
                          rows={2}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={savingRound}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm py-2 rounded-lg transition-colors"
                        >
                          {savingRound ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingRoundId(null)}
                          className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800 capitalize">{s.round}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(s.date).toLocaleDateString()}</p>
                        {s.notes && <p className="text-xs text-gray-600 mt-1">{s.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          s.round_status === 'positive' ? 'bg-green-100 text-green-700' :
                          s.round_status === 'negative' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {s.round_status || 'waiting'}
                        </span>
                        <button
                          onClick={() => handleRoundEditStart(s)}
                          className="text-gray-300 hover:text-blue-500 text-xs transition-colors"
                          aria-label="Edit round"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDeleteStatus(s.app_id)}
                          className="text-gray-300 hover:text-red-500 text-sm transition-colors"
                          aria-label="Delete round"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApplicationDetail;
