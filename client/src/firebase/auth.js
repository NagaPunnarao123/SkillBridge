// Re-export offline standalone auth (Firebase disconnected)
import { firebaseLogin, firebaseRegister, firebaseLogout } from '../data/firebaseApi';

export const registerUser = async (email, password, displayName, role = 'student') => {
  return firebaseRegister({ name: displayName, email, password, role });
};

export const loginUser = async (email, password) => {
  return firebaseLogin(email, password);
};

export const logoutUser = async () => {
  return firebaseLogout();
};

export const onAuthChange = (callback) => {
  const stored = localStorage.getItem('sb_mock_current_user');
  callback(stored ? JSON.parse(stored) : null);
  return () => {};
};
