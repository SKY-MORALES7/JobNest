// lib/constants.js
// Restored constants used across the frontend

export const API_ENDPOINTS = {
  UNREAD_COUNT: '/unread-count/',
  JOBS: '/jobs/',
  APPLICATIONS: '/applications/',
  // Chat endpoints (used by chat page)
  CHAT: (appId) => `/chat/${appId}/`,
  SEND_MESSAGE: (appId) => `/chat/${appId}/send/`,
  DELETE_MESSAGE: (messageId) => `/chat/message/${messageId}/delete/`,
  // Conversations / inbox
  JOBSEEKER_CONVERSATIONS: '/jobseeker-conversations/',
  EMPLOYER_CONVERSATIONS: '/employer-conversations/',
  MY_APPLICATIONS: '/my-applications/',
  UPDATE_PROFILE: '/api/user/update/',
  // Application-specific
  UPDATE_STATUS: (appId) => `/applications/${appId}/status/`,
};

export const STORAGE_KEYS = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  ROLE: 'role',
  USERNAME: 'username',
  FULL_NAME: 'full_name',
  EMAIL: 'email',
};

export const ROLES = {
  EMPLOYER: 'employer',
  // Some files use `JOB_SEEKER` while others use `JOBSEEKER` — provide both
  JOB_SEEKER: 'job_seeker',
  JOBSEEKER: 'job_seeker',
  APPLICANT: 'applicant',
};

export const APP_STATUSES = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};
