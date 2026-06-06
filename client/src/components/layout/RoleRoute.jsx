import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { canAccess } from '../../utils/permissions';

const RoleRoute = ({ roles }) => {
  const { user } = useAuth();
  return canAccess(user, roles) ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default RoleRoute;

