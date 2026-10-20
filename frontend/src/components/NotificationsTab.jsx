import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Truck, 
  HeartHandshake, 
  Utensils, 
  Star, 
  Clock, 
  Check, 
  Trash2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function NotificationsTab({ userRole = 'donor', userId = 1, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/notifications?role=${userRole}&user_id=${userId}`);
      if (Array.isArray(res.data)) {
        setNotifications(res.data);
        const unread = res.data.filter(n => !n.is_read).length;
        if (onUnreadCountChange) onUnreadCountChange(unread);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Immediately mark notifications read when viewing this tab so badge clears instantly
    const markAsRead = async () => {
      try {
        await axios.put('http://127.0.0.1:5000/api/notifications/mark-read', {
          user_id: userId,
          role: userRole
        });
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        if (onUnreadCountChange) onUnreadCountChange(0);
      } catch (_) {}
    };

    markAsRead();
    const markTimer = setTimeout(markAsRead, 600);

    // Poll every 8 seconds for real-time updates
    const interval = setInterval(fetchNotifications, 8000);
    return () => {
      clearTimeout(markTimer);
      clearInterval(interval);
    };
  }, [userRole, userId]);

  const handleMarkAllRead = async () => {
    try {
      await axios.put('http://127.0.0.1:5000/api/notifications/mark-read', {
        user_id: userId,
        role: userRole
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      if (onUnreadCountChange) onUnreadCountChange(0);
      toast.success("All notifications marked as read!");
    } catch (err) {
      toast.error("Failed to mark notifications as read.");
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await axios.put('http://127.0.0.1:5000/api/notifications/mark-read', { id });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      const remainingUnread = notifications.filter(n => n.id !== id && !n.is_read).length;
      if (onUnreadCountChange) onUnreadCountChange(remainingUnread);
    } catch (_) {}
  };

  const getIcon = (type) => {
    switch (type) {
      case 'claim':
        return <HeartHandshake size={20} className="text-emerald-600" />;
      case 'pickup':
        return <Truck size={20} className="text-amber-600" />;
      case 'delivery':
        return <CheckCircle2 size={20} className="text-blue-600" />;
      case 'donation':
        return <Utensils size={20} className="text-purple-600" />;
      case 'rating':
        return <Star size={20} className="text-yellow-500 fill-yellow-400" />;
      default:
        return <Bell size={20} className="text-emerald-600" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'claim': return '#059669';
      case 'pickup': return '#D97706';
      case 'delivery': return '#2563EB';
      case 'donation': return '#7C3AED';
      case 'rating': return '#EAB308';
      default: return '#10B981';
    }
  };

  const filteredNotifs = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ display: 'inline-flex', padding: '0.45rem', borderRadius: '12px', background: '#ECFDF5', color: '#059669' }}>
              <Bell size={22} />
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-dark)', margin: 0 }}>
              Live Notifications & Alerts
            </h2>
            {unreadCount > 0 && (
              <span style={{ background: '#EF4444', color: 'white', fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                {unreadCount} New
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
            Real-time updates on food claims, delivery handshakes, and donor ratings.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={fetchNotifications}
            title="Refresh notifications"
            style={{
              background: '#F1F5F9',
              border: 'none',
              padding: '0.55rem 0.85rem',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'background 0.2s'
            }}
          >
            <RefreshCw size={15} /> Refresh
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                padding: '0.55rem 1rem',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: 800,
                color: '#047857',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Check size={16} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '0.4rem 0.9rem',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: 800,
            border: 'none',
            background: filter === 'all' ? '#059669' : '#F1F5F9',
            color: filter === 'all' ? 'white' : '#64748B',
            cursor: 'pointer'
          }}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          style={{
            padding: '0.4rem 0.9rem',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: 800,
            border: 'none',
            background: filter === 'unread' ? '#059669' : '#F1F5F9',
            color: filter === 'unread' ? 'white' : '#64748B',
            cursor: 'pointer'
          }}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading live updates...
          </div>
        ) : filteredNotifs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#F8FAFC', borderRadius: '18px', border: '1px dashed #CBD5E1' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', background: '#F1F5F9', borderRadius: '50%', marginBottom: '0.75rem', color: '#94A3B8' }}>
              <Bell size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '380px', margin: '0.5rem auto 0' }}>
              When an NGO claims food, a volunteer initiates transport, or a delivery OTP is verified, you will be updated instantly here.
            </p>
          </div>
        ) : (
          filteredNotifs.map((item) => {
            const borderColor = getBorderColor(item.type);
            return (
              <div
                key={item.id}
                onClick={() => !item.is_read && handleMarkSingleRead(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.1rem 1.25rem',
                  borderRadius: '16px',
                  background: item.is_read ? '#FFFFFF' : '#F0FDF4',
                  border: item.is_read ? '1px solid #E2E8F0' : '1px solid #BBF7D0',
                  borderLeft: `5px solid ${borderColor}`,
                  boxShadow: item.is_read ? 'none' : '0 2px 8px rgba(16, 185, 129, 0.08)',
                  cursor: item.is_read ? 'default' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  padding: '0.6rem',
                  borderRadius: '12px',
                  background: item.is_read ? '#F8FAFC' : '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  flexShrink: 0
                }}>
                  {getIcon(item.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: item.is_read ? 'var(--text-dark)' : '#065F46' }}>
                      {item.title}
                    </h4>
                    <span style={{ fontSize: '0.74rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}>
                      <Clock size={12} /> {item.created_at || 'Just now'}
                    </span>
                  </div>

                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.87rem', color: item.is_read ? '#64748B' : '#1E293B', lineHeight: 1.5 }}>
                    {item.message}
                  </p>
                </div>

                {!item.is_read && (
                  <span
                    title="Unread"
                    style={{
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      background: '#10B981',
                      flexShrink: 0,
                      marginTop: '0.4rem'
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
