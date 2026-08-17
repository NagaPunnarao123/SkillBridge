import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile, uploadAvatar, deleteUserAccount } from '../../data/firebaseApi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const EditProfile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    college: '',
    graduationYear: '',
    skills: [],
    github: '',
    linkedin: '',
    portfolio: '',
    availability: 'available'
  });
  
  const [skillInput, setSkillInput] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Generate years 2020-2030
  const years = Array.from({length: 11}, (_, i) => 2020 + i);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) return;
      try {
        const userData = await getUserProfile(user.uid);
        
        if (userData) {
          setFormData({
            name: userData.name || '',
            bio: userData.bio || '',
            location: userData.location || '',
            college: userData.college || '',
            graduationYear: userData.graduationYear || '',
            skills: userData.skills || [],
            github: userData.github || '',
            linkedin: userData.linkedin || '',
            portfolio: userData.portfolio || '',
            availability: userData.availability || 'available'
          });
          
          if (userData.avatar) {
            setAvatarPreview(userData.avatar);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      '⚠️ WARNING: Deleting your account will permanently erase your profile, submitted proposals, active chats, and all stored data from SkillBridge.\n\nType DELETE to confirm account deletion:'
    );

    if (confirmation !== 'DELETE') {
      if (confirmation !== null) {
        toast.error('Confirmation text did not match. Account deletion cancelled.');
      }
      return;
    }

    try {
      setSaving(true);
      await deleteUserAccount(user.uid);
      toast.success('Your profile and account data have been permanently deleted.');
      logout();
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete account.');
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSkillInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (newSkill && !formData.skills.includes(newSkill)) {
        setFormData({
          ...formData,
          skills: [...formData.skills, newSkill]
        });
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    setSaving(true);
    
    try {
      let newAvatarUrl = null;
      if (avatarFile) {
        newAvatarUrl = await uploadAvatar(user.uid, avatarFile);
      }
      
      const updateData = { ...formData };
      if (newAvatarUrl) {
        updateData.avatar = newAvatarUrl;
      }
      
      const updatedProfile = await updateUserProfile(user.uid, updateData);
      
      if (updateUser && updatedProfile) {
        updateUser(updatedProfile);
      }
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading profile...</div>;
  }

  return (
    <div className="page-wrapper" style={{ padding: '2rem' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '2rem' }}>Edit Profile</h1>
        
        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Info */}
          <div className="card" style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Basic Information</h2>
            
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', alignItems: 'center' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-primary)', overflow: 'hidden', border: '2px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center' }}>No Avatar</span>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Profile Picture</h3>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Click on the image area to upload a new avatar. Max size 2MB.</p>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Full Name *</label>
              <input type="text" className="form-input" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} required />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Professional Bio</label>
              <textarea className="form-input" name="bio" value={formData.bio} onChange={handleChange} rows="3" placeholder="Tell clients about yourself, your experience, and what you're passionate about..." style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}></textarea>
            </div>
            
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Location</label>
              <input type="text" className="form-input" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Bangalore, India" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
            </div>
          </div>

          {/* Section 2: Student Info */}
          <div className="card" style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Education</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>College / University</label>
                <input type="text" className="form-input" name="college" value={formData.college} onChange={handleChange} placeholder="e.g. IIT Delhi" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Graduation Year</label>
                <select className="form-input" name="graduationYear" value={formData.graduationYear} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                  <option value="">Select Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Skills */}
          <div className="card" style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Skills</h2>
            
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Your Top Skills (Type and press Enter)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {formData.skills.map(skill => (
                  <span key={skill} className="skill-pill" style={{ background: 'rgba(6, 182, 212, 0.2)', color: 'var(--color-accent)', padding: '0.25rem 0.75rem', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', fontSize: '0.875rem' }}>
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} style={{ background: 'none', border: 'none', color: 'inherit', marginLeft: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>&times;</button>
                  </span>
                ))}
              </div>
              <input 
                type="text" 
                className="form-input" 
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillInputKeyDown}
                placeholder="e.g. React, Node.js, Python, Figma"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Section 4: Links */}
          <div className="card" style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Portfolio & Links</h2>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>GitHub URL</label>
                <input type="url" className="form-input" name="github" value={formData.github} onChange={handleChange} placeholder="https://github.com/username" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>LinkedIn URL</label>
                <input type="url" className="form-input" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/username" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Personal Portfolio Website</label>
                <input type="url" className="form-input" name="portfolio" value={formData.portfolio} onChange={handleChange} placeholder="https://mywebsite.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
              </div>
            </div>
          </div>

          {/* Section 5: Availability */}
          <div className="card" style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Availability</h2>
            
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Current Status</label>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="availability" value="available" checked={formData.availability === 'available'} onChange={handleChange} /> 
                  <span style={{ color: '#22c55e' }}>Available for Work</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="availability" value="busy" checked={formData.availability === 'busy'} onChange={handleChange} /> 
                  <span style={{ color: '#f59e0b' }}>Currently Busy</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="availability" value="unavailable" checked={formData.availability === 'unavailable'} onChange={handleChange} /> 
                  <span style={{ color: '#ef4444' }}>Not Looking for Work</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 6: Danger Zone */}
          <div className="card" style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <h2 style={{ marginBottom: '0.75rem', fontSize: '1.25rem', color: '#ef4444', borderBottom: '1px solid rgba(239, 68, 68, 0.2)', paddingBottom: '0.5rem' }}>
              🚨 Danger Zone — Delete Profile & Account Data
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.6' }}>
              Permanently remove your student developer profile, application history, stored messages, and all personal records from SkillBridge. This operation is permanent and cannot be reversed.
            </p>
            <button
              type="button"
              onClick={handleDeleteAccount}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
            >
              Delete My Profile & All Data
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" onClick={() => window.history.back()} className="btn-secondary" style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '0.75rem 2rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
