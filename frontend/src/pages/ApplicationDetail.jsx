import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJobById, deleteJob, updateJob, getStatuses, createStatus, updateStatus, deleteStatus } from '../api/jobs';
import {
  BriefcaseIcon, ChevronLeftIcon, CalendarIcon, LinkIcon, DocumentTextIcon,
  PencilIcon, TrashIcon, PlusIcon, Spinner, MapPinIcon,
  PhoneIcon, CodeBracketIcon, UsersIcon,
} from '../components/Icons';

const STATUS_OPTIONS = ['applied', 'in progress', 'accepted', 'rejected', 'ghosted'];
const PLATFORM_OPTIONS = ['LinkedIn', 'Seek', 'Indeed', 'Company Website', 'Other'];
const ROUND_TYPES = ['phone screen', 'technical', 'HR round', 'other'];
const OUTCOMES = ['positive', 'negative', 'waiting'];

const STATUS_COLORS = {
  applied:      'bg-blue-100 text-blue-700',
  'in progress':'bg-amber-100 text-amber-700',
  accepted:     'bg-emerald-100 text-emerald-700',
  rejected:     'bg-red-100 text-red-600',
  ghosted:      'bg-gray-100 text-gray-500',
};

const OUTCOME_COLORS = {
  positive: 'bg-emerald-100 text-emerald-700',
  negative: 'bg-red-100 text-red-600',
  waiting:  'bg-amber-100 text-amber-700',
};

const ROUND_ICONS = {
  'phone screen': PhoneIcon,
  'technical':    CodeBracketIcon,
  'HR round':     UsersIcon,
  'other':        DocumentTextIcon,
};

const AVATAR_COLORS = [
  'bg-blue-500','bg-violet-500','bg-emerald-500','bg-amber-500',
  'bg-rose-500','bg-indigo-500','bg-pink-500','bg-teal-500',
];
function avatarColor(name = '') {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors';
const selectCls = `${inputCls} cursor-pointer`;
const btnPrimary = 'flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:opacity-80 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition-colors cursor-pointer';
const btnSecondary = 'flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer';

function ApplicationDetail() {
  const { id } = useParams();
  const { token, handleUnauthorized } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [round, setRound] = useState('phone screen');
  const [date, setDate] = useState('');
  const [roundStatus, setRoundStatus] = useState('waiting');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      <div className="flex flex-col items-center gap-3">
        <Spinner className="w-6 h-6 text-blue-500" />
        <p className="text-gray-400 text-sm">Loading application…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm max-w-sm text-center">
        {error}
      </div>
    </div>
  );

  if (!job) return null;

  const sortedStatuses = [...statuses].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Back
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 bg-blue-600 rounded-lg">
              <BriefcaseIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900 tracking-tight hidden sm:block">Job Tracker</span>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 active:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <TrashIcon className="w-4 h-4" />
          <span className="hidden sm:block">Delete</span>
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-5">

        {/* Job Details Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Edit Application</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Company Name</label>
                  <input type="text" value={editForm.company_name}
                    onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                    required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                  <input type="text" value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className={selectCls}>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date Applied</label>
                  <input type="date" value={editForm.date_applied}
                    onChange={(e) => setEditForm({ ...editForm, date_applied: e.target.value })}
                    required className={selectCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Platform</label>
                  <select value={editForm.platform}
                    onChange={(e) => setEditForm({ ...editForm, platform: e.target.value })}
                    className={selectCls}>
                    <option value="">Select platform</option>
                    {PLATFORM_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Job URL</label>
                  <input type="url" value={editForm.job_url}
                    onChange={(e) => setEditForm({ ...editForm, job_url: e.target.value })}
                    placeholder="https://..." className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3} className={`${inputCls} resize-none`} />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving} className={btnPrimary}>
                  {saving ? <><Spinner className="w-3.5 h-3.5" />Saving…</> : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className={btnSecondary}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Company header with avatar */}
              <div className="flex items-start gap-4 mb-5">
                <div className={`w-14 h-14 rounded-2xl ${avatarColor(job.company_name)} flex items-center justify-center text-white font-bold text-xl shrink-0`}>
                  {job.company_name[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold text-gray-900 leading-tight truncate">{job.company_name}</h2>
                      <p className="text-gray-500 mt-0.5 truncate">{job.role}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[job.status] || 'bg-gray-100 text-gray-600'}`}>
                        {job.status}
                      </span>
                      <button
                        onClick={handleEditStart}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-colors cursor-pointer"
                        aria-label="Edit application"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata rows */}
              <div className="space-y-3 border-t border-gray-50 pt-4">
                <div className="flex items-center gap-2.5 text-sm">
                  <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-gray-400 text-xs font-medium w-16 shrink-0">Applied</span>
                  <span className="text-gray-700">
                    {new Date(job.date_applied).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {job.platform && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <MapPinIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-400 text-xs font-medium w-16 shrink-0">Platform</span>
                    <span className="text-gray-700">{job.platform}</span>
                  </div>
                )}
                {job.job_url && (
                  <div className="flex items-start gap-2.5 text-sm">
                    <LinkIcon className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-gray-400 text-xs font-medium w-16 shrink-0 pt-0.5">Job URL</span>
                    <a
                      href={job.job_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline break-all cursor-pointer transition-colors"
                    >
                      {job.job_url}
                    </a>
                  </div>
                )}
                {job.notes && (
                  <div className="flex items-start gap-2.5 text-sm">
                    <DocumentTextIcon className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-gray-400 text-xs font-medium w-16 shrink-0 pt-0.5">Notes</span>
                    <p className="text-gray-700 leading-relaxed">{job.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Interview Rounds */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-800">Interview Rounds</h3>
              {statuses.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {statuses.length} {statuses.length === 1 ? 'round' : 'rounds'} logged
                </p>
              )}
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:opacity-80 text-white px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              Add Round
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddStatus} className="mb-6 bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New Round</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Round Type</label>
                  <select value={round} onChange={(e) => setRound(e.target.value)} className={selectCls}>
                    {ROUND_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    required className={selectCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Outcome</label>
                <select value={roundStatus} onChange={(e) => setRoundStatus(e.target.value)} className={selectCls}>
                  {OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  rows={2} placeholder="How did it go?"
                  className={`${inputCls} resize-none`} />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={submitting} className={btnPrimary}>
                  {submitting ? <><Spinner className="w-3.5 h-3.5" />Saving…</> : 'Save Round'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className={btnSecondary}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {sortedStatuses.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-2xl mb-3">
                <CalendarIcon className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-sm">No rounds logged yet</p>
              <p className="text-gray-400 text-xs mt-1">Add your first interview round above.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sortedStatuses.map((s, idx) => {
                const RoundIcon = ROUND_ICONS[s.round] || DocumentTextIcon;
                return (
                  <div key={s.app_id}>
                    {editingRoundId === s.app_id ? (
                      <form onSubmit={(e) => handleRoundEditSave(e, s.app_id)}
                        className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100 mb-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Edit Round</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Round Type</label>
                            <select value={roundEditForm.round}
                              onChange={(e) => setRoundEditForm({ ...roundEditForm, round: e.target.value })}
                              className={selectCls}>
                              {ROUND_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                            <input type="date" value={roundEditForm.date}
                              onChange={(e) => setRoundEditForm({ ...roundEditForm, date: e.target.value })}
                              required className={selectCls} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Outcome</label>
                          <select value={roundEditForm.round_status}
                            onChange={(e) => setRoundEditForm({ ...roundEditForm, round_status: e.target.value })}
                            className={selectCls}>
                            {OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                          <textarea value={roundEditForm.notes}
                            onChange={(e) => setRoundEditForm({ ...roundEditForm, notes: e.target.value })}
                            rows={2} className={`${inputCls} resize-none`} />
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" disabled={savingRound} className={btnPrimary}>
                            {savingRound ? <><Spinner className="w-3.5 h-3.5" />Saving…</> : 'Save'}
                          </button>
                          <button type="button" onClick={() => setEditingRoundId(null)} className={btnSecondary}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-start gap-3 py-3.5 border-b border-gray-50 last:border-0 group">
                        {/* Step number */}
                        <div className="w-7 h-7 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-blue-500 font-bold text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <RoundIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="text-sm font-semibold text-gray-800 capitalize">{s.round}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${OUTCOME_COLORS[s.round_status] || OUTCOME_COLORS.waiting}`}>
                              {s.round_status || 'waiting'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(s.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                          {s.notes && <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{s.notes}</p>}
                        </div>
                        {/* Actions — visible on hover */}
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleRoundEditStart(s)}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                            aria-label="Edit round"
                          >
                            <PencilIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStatus(s.app_id)}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            aria-label="Delete round"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default ApplicationDetail;
