import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import { roleLabels } from '../../utils/constants';
import { listNotifications } from '../../services/notificationService';

const Topbar = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;

    const loadUnread = async () => {
      try {
        const data = await listNotifications();
        if (active) setUnreadCount(data.unreadCount || 0);
      } catch {
        if (active) setUnreadCount(0);
      }
    };

    loadUnread();
    const interval = setInterval(loadUnread, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user]);

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div>
        <strong>{user?.name || 'Team Member'}</strong>
        <span>{roleLabels[user?.role] || 'User'}</span>
      </div>
      <div className="actions">
        <Link to="/notifications" className="notification-bell">
          Notifications
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </Link>
        <Button variant="secondary" onClick={handleSignOut}>Sign out</Button>
      </div>
    </header>
  );
};

export default Topbar;
