import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJobs } from '../api/jobs';
import {
  BriefcaseIcon, SearchIcon, PlusIcon, ChevronRightIcon,
  CheckCircleIcon, XCircleIcon, ClockIcon, InboxStackIcon,
  ArrowRightOnRectangleIcon, Spinner,
} from '../components/Icons';

const STATUS_COLORS = {
  applied:      'bg-blue-100 text-blue-700',
  'in progress':'bg-amber-100 text-amber-700',
  accepted:     'bg-emerald-100 text-emerald-700',
  rejected:     'bg-red-100 text-red-600',
  ghosted:      'bg-gray-100 text-gray-500',
};

const STATUS_OPTIONS = ['applied', 'in progress', 'accepted', 'rejected', 'ghosted'];

const AVATAR_COLORS = [
  'bg-blue-500','bg-violet-500','bg-emerald-500','bg-amber-500',
  'bg-rose-500','bg-indigo-500','bg-pink-500','bg-teal-500',
];

function avatarColor(name = '') {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { token, logout, user, handleUnauthorized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const result = await getJobs(token);
        setJobs(result);
      } catch (err) {
        if (err.status === 401) { handleUnauthorized(); return; }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const stats = {
    total:      jobs.length,
    inProgress: jobs.filter((j) => j.status === 'in progress').length,
    accepted:   jobs.filter((j) => j.status === 'accepted').length,
    rejected:   jobs.filter((j) => j.status === 'rejected').length,
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.company_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === '' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isFiltering = searchQuery !== '' || statusFilter !== '';

  const userInitial = user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
            <BriefcaseIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-gray-900 tracking-tight">Job Tracker</span>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {userInitial}
              </div>
              <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total',       value: stats.total,      Icon: InboxStackIcon,  iconBg: 'bg-gray-100',    iconColor: 'text-gray-500',   num: 'text-gray-800' },
            { label: 'In Progress', value: stats.inProgress, Icon: ClockIcon,       iconBg: 'bg-amber-100',   iconColor: 'text-amber-600',  num: 'text-amber-600' },
            { label: 'Accepted',    value: stats.accepted,   Icon: CheckCircleIcon, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600',num: 'text-emerald-600' },
            { label: 'Rejected',    value: stats.rejected,   Icon: XCircleIcon,     iconBg: 'bg-red-100',     iconColor: 'text-red-500',    num: 'text-red-500' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
                <p className={`text-3xl font-bold mt-1 ${s.num}`}>{s.value}</p>
              </div>
              <div className={`${s.iconBg} p-3 rounded-xl`}>
                <s.Icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Applications</h2>
            {!loading && (
              <p className="text-sm text-gray-400 mt-0.5">
                {isFiltering ? `${filteredJobs.length} of ${jobs.length}` : jobs.length} {jobs.length === 1 ? 'application' : 'applications'}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate('/addapplication')}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:opacity-80 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Add Application
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <SearchIcon className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name…"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-600 cursor-pointer"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          {isFiltering && (
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
              className="text-sm text-gray-400 hover:text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center gap-3">
            <Spinner className="w-6 h-6 text-blue-500" />
            <p className="text-gray-400 text-sm">Loading applications…</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-2xl mb-4">
              <BriefcaseIcon className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">No applications yet</h3>
            <p className="text-gray-400 text-sm mb-6">Start tracking your job search by adding your first application.</p>
            <button
              onClick={() => navigate('/addapplication')}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:opacity-80 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              <PlusIcon className="w-4 h-4" />
              Add your first application
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <SearchIcon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-sm">No applications match your search</p>
            <p className="text-gray-400 text-xs mt-1">Try a different company name or status filter</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredJobs.map((job) => (
              <div
                key={job.job_id}
                onClick={() => navigate(`/applicationdetail/${job.job_id}`)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4 cursor-pointer hover:border-blue-200 hover:shadow-md transition-all group"
              >
                {/* Company avatar */}
                <div className={`w-10 h-10 rounded-xl ${avatarColor(job.company_name)} flex items-center justify-center text-white font-bold text-base shrink-0`}>
                  {job.company_name[0]?.toUpperCase() ?? '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{job.company_name}</p>
                  <p className="text-sm text-gray-500 truncate mt-0.5">{job.role}</p>
                  {job.platform && (
                    <p className="text-xs text-gray-400 mt-0.5">via {job.platform}</p>
                  )}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 shrink-0">
                  <p className="text-xs text-gray-400 hidden sm:block">
                    {new Date(job.date_applied).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[job.status] || 'bg-gray-100 text-gray-600'}`}>
                    {job.status}
                  </span>
                  <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
