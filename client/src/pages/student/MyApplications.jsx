import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStudentApplications, deleteApplication } from '../../data/firebaseApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  const fetchApplications = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const data = await getStudentApplications(user.uid);
      setApplications(data);
      applyFilter(filter, data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user]);

  useEffect(() => {
    applyFilter(filter, applications);
  }, [filter, applications]);

  const applyFilter = (currentFilter, allApps) => {
    if (currentFilter === 'All') {
      setFilteredApps(allApps);
    } else {
      setFilteredApps(allApps.filter(a => a.status.toLowerCase() === currentFilter.toLowerCase()));
    }
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    
    try {
      await deleteApplication(id);
      toast.success('Application withdrawn');
      fetchApplications();
    } catch (error) {
      console.error('Error withdrawing application:', error);
      toast.error('Failed to withdraw application');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e' };
      case 'rejected': return { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' };
      default: return { bg: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b' };
    }
  };

  return (
    <div className="page-wrapper" style={{ padding: '2rem' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '2rem' }}>My Applications</h1>

        <div className="filter-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
          {['All', 'Pending', 'Accepted', 'Rejected'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '0.5rem 1rem',
                background: 'none',
                border: 'none',
                borderBottom: filter === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                color: filter === tab ? 'var(--color-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: filter === tab ? 'bold' : 'normal'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading applications...</div>
        ) : filteredApps.length === 0 ? (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--surface-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '1rem' }}>No applications found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{filter === 'All' ? 'You haven\'t applied to any projects yet.' : `You have no ${filter.toLowerCase()} applications.`}</p>
            {filter === 'All' && (
              <Link to="/student/projects/browse" className="btn-primary" style={{ padding: '0.75rem 1.5rem', background: 'var(--color-primary)', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>Browse Projects</Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredApps.map(app => {
              const statusColors = getStatusColor(app.status);
              
              return (
                <div key={app.id} className="application-item card" style={{ background: 'var(--surface-color)', borderRadius: '8px', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    
                    <div style={{ flex: 1, minWidth: '250px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{app.projectData?.title || 'Project Removed'}</h2>
                        <span className="badge" style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', textTransform: 'uppercase', background: statusColors.bg, color: statusColors.text, fontWeight: 'bold' }}>
                          {app.status}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
                        Client: {app.projectData?.clientName || 'Unknown'} • Applied on {app.createdAt?.toDate ? app.createdAt.toDate().toLocaleDateString() : new Date(app.createdAt).toLocaleDateString()}
                      </p>
                      
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '4px', borderLeft: '3px solid var(--color-primary)' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Your Proposal:</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{app.proposal?.length > 200 ? app.proposal.substring(0, 200) + '...' : app.proposal}</p>
                      </div>
                    </div>

                    <div style={{ minWidth: '150px', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '4px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Your Bid</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-accent)' }}>₹{app.bidAmount}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>in {app.estimatedDays} days</div>
                      </div>

                      {app.status === 'pending' && (
                        <button 
                          onClick={() => handleWithdraw(app.id)}
                          style={{ padding: '0.5rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseOver={(e) => { e.target.style.color = '#ef4444'; e.target.style.borderColor = '#ef4444'; }}
                          onMouseOut={(e) => { e.target.style.color = 'var(--text-secondary)'; e.target.style.borderColor = 'var(--border-color)'; }}
                        >
                          Withdraw
                        </button>
                      )}
                      
                      {app.status === 'accepted' && (
                        <button 
                          onClick={() => navigate('/messages')}
                          style={{ padding: '0.75rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Message Client
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
