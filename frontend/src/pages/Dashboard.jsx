import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJobs } from '../api/jobs';

const STATUS_COLORS = {
  applied: 'bg-blue-100 text-blue-700',
  'in progress': 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  ghosted: 'bg-gray-100 text-gray-500',
};

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const { token, logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const result = await getJobs(token);
        setJobs(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Stats
  const stats = {
    total: jobs.length,
    inProgress: jobs.filter((j) => j.status === 'in progress').length,
    accepted: jobs.filter((j) => j.status === 'accepted').length,
    rejected: jobs.filter((j) => j.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Job Tracker</h1>
        <div className="flex items-center gap-4">
          {user && <p className="text-sm text-gray-500">{user.email}</p>}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-800 font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-800' },
            { label: 'In Progress', value: stats.inProgress, color: 'text-yellow-600' },
            { label: 'Accepted', value: stats.accepted, color: 'text-green-600' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-500' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Applications</h2>
          <button
            onClick={() => navigate('/addapplication')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Add Application
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-400 text-sm">Loading applications...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-400 text-sm mb-4">No applications yet.</p>
            <button
              onClick={() => navigate('/addapplication')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg"
            >
              Add your first application
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.job_id}
                onClick={() => navigate(`/applicationdetail/${job.job_id}`)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-4 flex items-center justify-between cursor-pointer hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div>
                  <p className="font-semibold text-gray-900">{job.company_name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{job.role}</p>
                  {job.platform && (
                    <p className="text-xs text-gray-400 mt-1">via {job.platform}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-xs text-gray-400">
                    {new Date(job.date_applied).toLocaleDateString()}
                  </p>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[job.status] || 'bg-gray-100 text-gray-600'}`}>
                    {job.status}
                  </span>
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
