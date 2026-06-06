import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { canAccess, navigationItems } from '../../utils/permissions';

const Sidebar = () => {
  const { user } = useAuth();
  const items = navigationItems.filter((item) => canAccess(user, item.roles));

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">VB</span>
        <div>
          <strong>VendorBridge</strong>
          <small>Procurement ERP</small>
        </div>
      </div>
      <nav>
        {items.map((item) => (
          <NavLink key={item.path} to={item.path}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

