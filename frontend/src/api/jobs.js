const API_URL = import.meta.env.VITE_API_URL;

function apiError(data, status) {
  const err = new Error(data.error || 'Request failed');
  err.status = status;
  return err;
}

export const getJobs = async (token) => {
  const response = await fetch(`${API_URL}/api/jobs`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw apiError(data, response.status);
  return data;
};

export const getJobById = async (token, id) => {
  const response = await fetch(`${API_URL}/api/jobs/${id}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw apiError(data, response.status);
  return data;
};

export const createJob = async (token, jobData) => {
  const response = await fetch(`${API_URL}/api/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(jobData),
  });
  const data = await response.json();
  if (!response.ok) throw apiError(data, response.status);
  return data;
};

export const updateJob = async (token, id, updates) => {
  const response = await fetch(`${API_URL}/api/jobs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (!response.ok) throw apiError(data, response.status);
  return data;
};

export const deleteJob = async (token, id) => {
  const response = await fetch(`${API_URL}/api/jobs/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status === 401) throw apiError({}, 401);
  return null;
};

export const getStatuses = async (token, jobId) => {
  const response = await fetch(`${API_URL}/api/jobs/${jobId}/status`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw apiError(data, response.status);
  return data;
};

export const createStatus = async (token, jobId, statusData) => {
  const response = await fetch(`${API_URL}/api/jobs/${jobId}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(statusData),
  });
  const data = await response.json();
  if (!response.ok) throw apiError(data, response.status);
  return data;
};

export const updateStatus = async (token, jobId, statusId, statusData) => {
  const response = await fetch(`${API_URL}/api/jobs/${jobId}/status/${statusId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(statusData),
  });
  const data = await response.json();
  if (!response.ok) throw apiError(data, response.status);
  return data;
};

export const deleteStatus = async (token, jobId, statusId) => {
  const response = await fetch(`${API_URL}/api/jobs/${jobId}/status/${statusId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw apiError(data, response.status);
  return data;
};
