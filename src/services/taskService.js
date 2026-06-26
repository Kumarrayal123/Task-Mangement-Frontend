import axios from 'axios';

const API_BASE_URL = 'http://62.72.29.27:5001/api/tasks';

// Create Task
export const createTask = async (taskData, voiceNoteFile) => {
  const formData = new FormData();
  
  const objectIdFields = ['department', 'createdBy', 'projectId'];

  Object.keys(taskData).forEach(key => {
    const value = taskData[key];
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (objectIdFields.includes(key)) {
        if (value && value !== '') {
          formData.append(key, value);
        }
      } else if (value !== '') {
        formData.append(key, value);
      }
    }
  });

  if (voiceNoteFile) {
    formData.append('voiceNote', voiceNoteFile);
  }

  console.log('FormData entries:', Array.from(formData.entries()));

  try {
    const response = await axios.post(`${API_BASE_URL}/createtask`, formData);
    return response.data;
  } catch (error) {
    console.error('Create task error:', error.response?.data);
    throw error;
  }
};

// Get All Tasks with filters
export const getAllTasks = async (filters = {}) => {
  const response = await axios.get(`${API_BASE_URL}/getalltasks`, { params: filters });
  return response.data;
};

// Get Task by ID
export const getTaskById = async (taskId) => {
  const response = await axios.get(`${API_BASE_URL}/singletask/${taskId}`);
  return response.data;
};

// Update Task
export const updateTask = async (taskId, taskData, voiceNoteFile) => {
  const formData = new FormData();
  
  Object.keys(taskData).forEach(key => {
    const value = taskData[key];
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== '') {
        formData.append(key, value);
      }
    }
  });

  if (voiceNoteFile) {
    formData.append('voiceNote', voiceNoteFile);
  }

  console.log('Update FormData entries:', Array.from(formData.entries()));

  const response = await axios.put(`${API_BASE_URL}/updatetask/${taskId}`, formData);
  return response.data;
};

// Delete Task
export const deleteTask = async (taskId) => {
  const response = await axios.delete(`${API_BASE_URL}/deletetask/${taskId}`);
  return response.data;
};

// Bulk Update Status
export const bulkUpdateStatus = async (taskIds, status) => {
  const response = await axios.patch(`${API_BASE_URL}/bulk-status`, { taskIds, status });
  return response.data;
};

// Get Department Tasks
export const getDepartmentTasks = async (departmentId) => {
  const response = await axios.get(`${API_BASE_URL}/department/${departmentId}`);
  return response.data;
};

// Get Task Statistics - FIXED
export const getTaskStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stats`);
    console.log('Stats API Response:', response.data);
    
    // Extract stats from the response
    if (response.data && response.data.stats) {
      return response.data.stats;
    }
    
    // If stats is directly in response
    if (response.data && response.data.total !== undefined) {
      return response.data;
    }
    
    // Fallback
    return response.data || { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0, rejected: 0 };
  } catch (error) {
    console.error('Error fetching task stats:', error);
    return {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
      rejected: 0
    };
  }
};

// Get Overdue Tasks
export const getOverdueTasks = async () => {
  const response = await axios.get(`${API_BASE_URL}/overdue`);
  return response.data;
};

// Get My Assigned Tasks
export const getMyAssignedTasks = async (employeeId) => {
  const response = await axios.get(`${API_BASE_URL}/my-assigned-tasks/${employeeId}`);
  return response.data;
};

// Get My Created Tasks
export const getMyCreatedTasks = async (employeeId) => {
  const response = await axios.get(`${API_BASE_URL}/my-created-tasks/${employeeId}`);
  return response.data;
};

// Update Task by Employee
export const updateTaskByEmployee = async (taskId, employeeId, updateData, attachments) => {
  const formData = new FormData();
  
  Object.keys(updateData).forEach(key => {
    const value = updateData[key];
    if (value !== null && value !== undefined) {
      if (key === 'expenses' && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== '') {
        formData.append(key, value);
      }
    }
  });

  if (attachments && attachments.length > 0) {
    attachments.forEach(file => {
      formData.append('attachments', file);
    });
  }

  const response = await axios.put(
    `${API_BASE_URL}/employee/update-task/${taskId}/${employeeId}`,
    formData
  );
  return response.data;
};

// Report Task Issue
export const reportTaskIssue = async (taskId, employeeId, issueData) => {
  const response = await axios.post(
    `${API_BASE_URL}/report-issue/${taskId}/${employeeId}`,
    issueData
  );
  return response.data;
};

// Get All Reported Issues
export const getAllReportedIssues = async () => {
  const response = await axios.get(`${API_BASE_URL}/reported-issues`);
  return response.data;
};

// Get My Reported Issues
export const getMyReportedIssues = async (employeeId) => {
  const response = await axios.get(`${API_BASE_URL}/reported-issues/${employeeId}`);
  return response.data;
};

// Get Task Issues (NEW FUNCTION)
export const getTaskIssues = async (taskId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${taskId}/issues`);
    return response.data;
  } catch (error) {
    console.error('Error fetching task issues:', error);
    throw error;
  }
};

// Update Reported Issue (Admin)
export const updateReportedIssue = async (taskId, issueId, updateData) => {
  const response = await axios.put(
    `${API_BASE_URL}/reported-issue/${taskId}/${issueId}`,
    updateData
  );
  return response.data;
};

// Delete Reported Issue (Admin)
export const deleteReportedIssue = async (taskId, issueId) => {
  const response = await axios.delete(
    `${API_BASE_URL}/reported-issue/${taskId}/${issueId}`
  );
  return response.data;
};