import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createJob } from '../api/jobs';
import {
  BriefcaseIcon, ChevronLeftIcon, CalendarIcon, LinkIcon,
  DocumentTextIcon, PlusIcon, Spinner,
} from '../components/Icons';

const PLATFORMS = ['LinkedIn', 'Seek', 'Indeed', 'Company Website', 'Other'];
const STATUSES = ['applied', 'in progress', 'accepted', 'rejected', 'ghosted'];

function AddApplication() {
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('applied');
  const [dateApplied, setDateApplied] = useState('');
  const [platform, setPlatform] = useState('');
  const [notes, setNotes] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { token, handleUnauthorized } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createJob(token, {
        company_name: companyName,
        role,
        status,
        date_applied: dateApplied,
        platform,
        notes,
        job_url: jobUrl,
      });
      navigate('/');
    } catch (err) {
      if (err.status === 401) { handleUnauthorized(); return; }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center sticky top-0 z-10">
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
            <span className="text-sm font-bold text-gray-900 tracking-tight">Job Tracker</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">New Application</h1>
          <p className="text-gray-500 text-sm mt-1">Track a new job application in your pipeline.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Company Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Atlassian, Google, Canva"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Role <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Junior Frontend Developer"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status <span className="text-red-400">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors cursor-pointer"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                    Date Applied <span className="text-red-400">*</span>
                  </span>
                </label>
                <input
                  type="date"
                  value={dateApplied}
                  onChange={(e) => setDateApplied(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors cursor-pointer"
              >
                <option value="">Select platform (optional)</option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-gray-400" />
                  Job URL
                </span>
              </label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <DocumentTextIcon className="w-3.5 h-3.5 text-gray-400" />
                  Notes
                </span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about this application — referral, recruiter contact, etc."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors resize-none"
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:opacity-80 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm transition-colors cursor-pointer shadow-sm"
              >
                {loading ? (
                  <>
                    <Spinner className="w-4 h-4" />
                    Adding application…
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4" />
                    Add Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddApplication;
