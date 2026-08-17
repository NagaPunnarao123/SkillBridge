// Re-export offline standalone storage (Firebase disconnected)
export { uploadAvatar } from '../data/firebaseApi';

export const uploadFile = async (path, file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};
