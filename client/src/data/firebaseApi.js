// ── Standalone Offline Mock Database Layer (Dynamic User-Driven Data) ──

const INITIAL_USERS = [];
const INITIAL_PROJECTS = [];
const INITIAL_REVIEWS = [];

// Clear all user, client, student, and project data
if (typeof localStorage !== 'undefined') {
  try {
    if (localStorage.getItem('sb_mock_version') !== 'v5_all_cleared') {
      localStorage.removeItem('sb_mock_users');
      localStorage.removeItem('sb_mock_projects');
      localStorage.removeItem('sb_mock_applications');
      localStorage.removeItem('sb_mock_conversations');
      localStorage.removeItem('sb_mock_reviews');
      localStorage.removeItem('sb_mock_notifications');
      localStorage.removeItem('sb_mock_current_user');
      localStorage.setItem('sb_mock_version', 'v5_all_cleared');
    }
  } catch (e) {}
}

// Helper to get / set from localStorage
function getLocalStore(key, fallback) {
  try {
    const item = localStorage.getItem(`sb_mock_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setLocalStore(key, data) {
  try {
    localStorage.setItem(`sb_mock_${key}`, JSON.stringify(data));
  } catch (e) {}
}

let mockUsers = getLocalStore('users', INITIAL_USERS);
let mockProjects = getLocalStore('projects', INITIAL_PROJECTS);
let mockApplications = getLocalStore('applications', []);
let mockConversations = getLocalStore('conversations', []);
let mockReviews = getLocalStore('reviews', INITIAL_REVIEWS);
let mockNotifications = getLocalStore('notifications', []);

// ── Auth ──
export async function firebaseLogin(email, password) {
  mockUsers = getLocalStore('users', []);
  const found = mockUsers.find(u => u.email?.toLowerCase() === email?.toLowerCase());
  if (!found) {
    throw new Error('User not found. Please register a new account.');
  }
  setLocalStore('current_user', found);
  return found;
}

export async function firebaseRegister(formData) {
  mockUsers = getLocalStore('users', []);
  const uid = 'user_' + Date.now();
  const newUser = {
    uid: uid,
    id: uid,
    name: formData.name || 'Anonymous User',
    email: formData.email,
    role: formData.role || 'student',
    company: formData.company || '',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=6366f1&color=fff&size=150`,
    bio: formData.bio || '',
    location: formData.location || '',
    college: formData.college || '',
    graduationYear: formData.graduationYear || '',
    skills: Array.isArray(formData.skills) 
      ? formData.skills 
      : formData.skills 
        ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) 
        : [],
    github: formData.github || '',
    linkedin: formData.linkedin || '',
    portfolio: formData.portfolio || '',
    availability: 'available',
    rating: 5.0,
    completedProjects: 0,
    createdAt: new Date().toISOString(),
  };

  mockUsers.push(newUser);
  setLocalStore('users', mockUsers);
  setLocalStore('current_user', newUser);
  return newUser;
}

export async function firebaseLogout() {
  localStorage.removeItem('sb_mock_current_user');
}

// ── Users / Profiles ──
export async function getUserProfile(id) {
  mockUsers = getLocalStore('users', []);
  return mockUsers.find(u => u.uid === id || u.id === id) || null;
}

export async function updateUserProfile(id, data) {
  mockUsers = getLocalStore('users', []);
  const index = mockUsers.findIndex(u => u.uid === id || u.id === id);
  if (index !== -1) {
    mockUsers[index] = { ...mockUsers[index], ...data };
    setLocalStore('users', mockUsers);
    const curr = getLocalStore('current_user', null);
    if (curr && (curr.uid === id || curr.id === id)) {
      setLocalStore('current_user', mockUsers[index]);
    }
    return mockUsers[index];
  }
  return null;
}

export async function getUserReviews(userId) {
  mockReviews = getLocalStore('reviews', []);
  const userRev = mockReviews.filter(r => r.reviewee === userId);
  const hydrated = [];
  for (const r of userRev) {
    const reviewerData = await getUserProfile(r.reviewer);
    hydrated.push({ ...r, reviewerData });
  }
  return hydrated;
}

export async function getStudents(filters = {}) {
  mockUsers = getLocalStore('users', []);
  let students = mockUsers.filter(u => u.role === 'student');

  if (filters.search) {
    const qStr = filters.search.toLowerCase();
    students = students.filter(s => 
      s.name?.toLowerCase().includes(qStr) || 
      s.bio?.toLowerCase().includes(qStr) || 
      s.college?.toLowerCase().includes(qStr) ||
      s.skills?.some(sk => sk.toLowerCase().includes(qStr))
    );
  }
  if (filters.skill) {
    const sq = filters.skill.toLowerCase();
    students = students.filter(s => s.skills?.some(sk => sk.toLowerCase().includes(sq)));
  }
  if (filters.availability === 'true') {
    students = students.filter(s => s.availability === 'available');
  } else if (filters.availability === 'false') {
    students = students.filter(s => s.availability !== 'available');
  }

  students.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return students;
}

// ── Projects ──
async function hydrateProject(p) {
  if (!p) return null;
  const hydrated = { ...p };
  if (p.client) hydrated.clientData = await getUserProfile(p.client);
  if (p.hiredStudent) hydrated.hiredStudentData = await getUserProfile(p.hiredStudent);
  return hydrated;
}

export async function getProjects(filters = {}) {
  mockProjects = getLocalStore('projects', []);
  let list = [...mockProjects];

  if (filters.status) list = list.filter(p => p.status === filters.status);
  if (filters.category) list = list.filter(p => p.category === filters.category);

  if (filters.search) {
    const sq = filters.search.toLowerCase();
    list = list.filter(p => 
      p.title?.toLowerCase().includes(sq) || 
      p.description?.toLowerCase().includes(sq) ||
      p.techStack?.some(t => t.toLowerCase().includes(sq))
    );
  }

  const hydrated = [];
  for (const p of list) {
    hydrated.push(await hydrateProject(p));
  }
  hydrated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return hydrated;
}

export async function getProjectById(id) {
  mockProjects = getLocalStore('projects', []);
  const found = mockProjects.find(p => p.id === id);
  return found ? hydrateProject(found) : null;
}

export async function createProject(data, clientId) {
  mockProjects = getLocalStore('projects', []);
  const newProject = {
    ...data,
    id: 'proj_' + Date.now(),
    client: clientId,
    status: 'open',
    applicantCount: 0,
    createdAt: new Date().toISOString(),
    deadline: data.deadline || new Date(Date.now() + 30 * 86400000).toISOString(),
  };
  mockProjects.unshift(newProject);
  setLocalStore('projects', mockProjects);
  return hydrateProject(newProject);
}

export async function updateProject(id, data) {
  mockProjects = getLocalStore('projects', []);
  const idx = mockProjects.findIndex(p => p.id === id);
  if (idx !== -1) {
    mockProjects[idx] = { ...mockProjects[idx], ...data };
    setLocalStore('projects', mockProjects);
    return hydrateProject(mockProjects[idx]);
  }
  return null;
}

export async function getClientProjects(clientId) {
  mockProjects = getLocalStore('projects', []);
  const list = mockProjects.filter(p => p.client === clientId);
  const hydrated = [];
  for (const p of list) {
    hydrated.push(await hydrateProject(p));
  }
  return hydrated;
}

export async function deleteProject(projectId) {
  mockProjects = getLocalStore('projects', []);
  mockProjects = mockProjects.filter(p => p.id !== projectId);
  setLocalStore('projects', mockProjects);

  // Remove linked applications
  mockApplications = getLocalStore('applications', []);
  mockApplications = mockApplications.filter(a => a.project !== projectId);
  setLocalStore('applications', mockApplications);

  return true;
}

// ── Applications ──
export async function getStudentApplications(studentUid) {
  mockApplications = getLocalStore('applications', []);
  const apps = mockApplications.filter(a => a.student === studentUid);
  const result = [];
  for (const a of apps) {
    const p = await getProjectById(a.project);
    result.push({ ...a, projectData: p });
  }
  return result;
}

export async function applyToProject(projectId, studentUid, proposal, bidAmount) {
  mockApplications = getLocalStore('applications', []);
  const existing = mockApplications.find(a => a.project === projectId && a.student === studentUid);
  if (existing) throw new Error('You have already applied to this project.');

  const newApp = {
    id: 'app_' + Date.now(),
    project: projectId,
    student: studentUid,
    proposal,
    bidAmount: Number(bidAmount) || 0,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  mockApplications.push(newApp);
  setLocalStore('applications', mockApplications);

  // Increment applicant count on project
  mockProjects = getLocalStore('projects', []);
  const p = mockProjects.find(pr => pr.id === projectId);
  if (p) {
    p.applicantCount = (p.applicantCount || 0) + 1;
    setLocalStore('projects', mockProjects);

    // Create notification for the project's client
    const studentProfile = await getUserProfile(studentUid);
    await createNotification(p.client, 'new_application', {
      projectId: projectId,
      projectTitle: p.title,
      studentName: studentProfile?.name || 'A student',
      studentId: studentUid,
      applicationId: newApp.id,
    });
  }

  return newApp;
}

export async function createApplication(data) {
  return applyToProject(data.project, data.student, data.proposal, data.bidAmount);
}

export async function getProjectApplications(projectId) {
  mockApplications = getLocalStore('applications', []);
  const list = mockApplications.filter(a => a.project === projectId);
  const result = [];
  for (const a of list) {
    const studentData = await getUserProfile(a.student);
    result.push({ ...a, studentData });
  }
  return result;
}

export async function acceptApplication(appId, projectId, studentUid) {
  mockApplications = getLocalStore('applications', []);
  const appIdx = mockApplications.findIndex(a => a.id === appId);
  if (appIdx !== -1) {
    mockApplications[appIdx].status = 'accepted';
    // Reject all other applications for this project
    mockApplications.forEach((a, i) => {
      if (a.project === projectId && i !== appIdx && a.status === 'pending') {
        a.status = 'rejected';
      }
    });
    setLocalStore('applications', mockApplications);
  }
  
  const updatedProject = await updateProject(projectId, { status: 'in-progress', hiredStudent: studentUid });
  const projectTitle = updatedProject?.title || 'Project';
  const clientId = updatedProject?.client;

  // Auto-create conversation between client and student
  const conversation = await createConversation(clientId, studentUid, projectId);

  // Notify the student that their application was accepted
  const clientProfile = await getUserProfile(clientId);
  await createNotification(studentUid, 'application_accepted', {
    projectId: projectId,
    projectTitle: projectTitle,
    clientName: clientProfile?.name || 'The client',
    clientId: clientId,
    conversationId: conversation.id,
  });

  return { accepted: true, conversationId: conversation.id };
}

export async function rejectApplication(appId) {
  mockApplications = getLocalStore('applications', []);
  const appIdx = mockApplications.findIndex(a => a.id === appId);
  if (appIdx !== -1) {
    mockApplications[appIdx].status = 'rejected';
    setLocalStore('applications', mockApplications);
  }
  return true;
}

export async function deleteApplication(appId) {
  mockApplications = getLocalStore('applications', []);
  mockApplications = mockApplications.filter(a => a.id !== appId);
  setLocalStore('applications', mockApplications);
  return true;
}

// ── Conversations ──
export async function createConversation(userId1, userId2, projectId) {
  mockConversations = getLocalStore('conversations', []);
  // Check for existing conversation between these users for this project
  const existing = mockConversations.find(c => {
    const hasUsers = c.participantIds?.includes(userId1) && c.participantIds?.includes(userId2);
    if (projectId) return hasUsers && c.projectId === projectId;
    return hasUsers;
  });
  if (existing) return existing;

  // Hydrate participant data
  const user1 = await getUserProfile(userId1);
  const user2 = await getUserProfile(userId2);

  const newConv = {
    id: 'conv_' + Date.now(),
    participantIds: [userId1, userId2],
    participants: [
      { uid: userId1, name: user1?.name || 'User', avatar: user1?.avatar || '', role: user1?.role || '' },
      { uid: userId2, name: user2?.name || 'User', avatar: user2?.avatar || '', role: user2?.role || '' },
    ],
    projectId: projectId || null,
    messages: [],
    lastMessage: null,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  mockConversations.push(newConv);
  setLocalStore('conversations', mockConversations);
  return newConv;
}

// ── Messages ──
export async function getUserConversations(userId) {
  mockConversations = getLocalStore('conversations', []);
  return mockConversations.filter(c => c.participantIds?.includes(userId));
}

export function subscribeToMessages(conversationId, callback) {
  let lastJson = '';
  const check = () => {
    mockConversations = getLocalStore('conversations', []);
    const conv = mockConversations.find(c => c.id === conversationId);
    const msgs = conv?.messages || [];
    const json = JSON.stringify(msgs);
    if (json !== lastJson) {
      lastJson = json;
      callback(msgs);
    }
  };

  check();

  const interval = setInterval(check, 1000);
  const handleStorage = (e) => {
    if (e.key === 'sb_mock_conversations') {
      check();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }

  return () => {
    clearInterval(interval);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

export async function sendMessage(conversationId, senderId, text) {
  mockConversations = getLocalStore('conversations', []);
  let conv = mockConversations.find(c => c.id === conversationId);
  const msg = {
    id: 'msg_' + Date.now(),
    sender: senderId,
    content: text,
    createdAt: new Date().toISOString(),
  };

  if (!conv) {
    conv = { id: conversationId, participantIds: [senderId], messages: [] };
    mockConversations.push(conv);
  }

  conv.messages = conv.messages || [];
  conv.messages.push(msg);
  conv.lastMessage = { text, sender: senderId, createdAt: msg.createdAt };
  conv.updatedAt = msg.createdAt;

  setLocalStore('conversations', mockConversations);
  return msg;
}

// ── Avatar Upload Mock ──
export async function uploadAvatar(userId, file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

export async function getProjectReviews(projectId) {
  mockReviews = getLocalStore('reviews', []);
  const revs = mockReviews.filter(r => r.project === projectId);
  const hydrated = [];
  for (const r of revs) {
    const reviewerData = await getUserProfile(r.reviewer);
    hydrated.push({ ...r, reviewerData });
  }
  return hydrated;
}

// ── Notifications ──
export async function createNotification(recipientId, type, data = {}) {
  mockNotifications = getLocalStore('notifications', []);
  const notif = {
    id: 'notif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    recipient: recipientId,
    type,
    data,
    read: false,
    createdAt: new Date().toISOString(),
  };
  mockNotifications.unshift(notif);
  setLocalStore('notifications', mockNotifications);
  return notif;
}

export async function getUserNotifications(userId) {
  mockNotifications = getLocalStore('notifications', []);
  return mockNotifications
    .filter(n => n.recipient === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function markNotificationRead(notifId) {
  mockNotifications = getLocalStore('notifications', []);
  const n = mockNotifications.find(x => x.id === notifId);
  if (n) {
    n.read = true;
    setLocalStore('notifications', mockNotifications);
  }
  return true;
}

export async function markAllNotificationsRead(userId) {
  mockNotifications = getLocalStore('notifications', []);
  mockNotifications.forEach(n => {
    if (n.recipient === userId) n.read = true;
  });
  setLocalStore('notifications', mockNotifications);
  return true;
}

export async function getUnreadNotificationCount(userId) {
  mockNotifications = getLocalStore('notifications', []);
  return mockNotifications.filter(n => n.recipient === userId && !n.read).length;
}

export async function deleteUserAccount(userId) {
  // 1. Remove from mockUsers
  mockUsers = getLocalStore('users', []);
  mockUsers = mockUsers.filter(u => u.uid !== userId && u.id !== userId);
  setLocalStore('users', mockUsers);

  // 2. Remove applications submitted by user
  mockApplications = getLocalStore('applications', []);
  mockApplications = mockApplications.filter(a => a.student !== userId);
  setLocalStore('applications', mockApplications);

  // 3. Remove projects created by user (if client)
  mockProjects = getLocalStore('projects', []);
  mockProjects = mockProjects.filter(p => p.client !== userId);
  setLocalStore('projects', mockProjects);

  // 4. Remove conversations involving user
  mockConversations = getLocalStore('conversations', []);
  mockConversations = mockConversations.filter(c => !c.participantIds?.includes(userId));
  setLocalStore('conversations', mockConversations);

  // 5. Remove notifications
  mockNotifications = getLocalStore('notifications', []);
  mockNotifications = mockNotifications.filter(n => n.recipient !== userId);
  setLocalStore('notifications', mockNotifications);

  // 6. Clear current user session
  try {
    localStorage.removeItem('sb_mock_current_user');
  } catch (e) {}

  return true;
}

export async function resetAllData() {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('sb_mock_users');
      localStorage.removeItem('sb_mock_projects');
      localStorage.removeItem('sb_mock_applications');
      localStorage.removeItem('sb_mock_conversations');
      localStorage.removeItem('sb_mock_reviews');
      localStorage.removeItem('sb_mock_notifications');
      localStorage.removeItem('sb_mock_current_user');
      localStorage.setItem('sb_mock_version', 'v5_all_cleared');
    } catch (e) {}
  }
  mockUsers = [];
  mockProjects = [];
  mockApplications = [];
  mockConversations = [];
  mockReviews = [];
  mockNotifications = [];
  return true;
}

