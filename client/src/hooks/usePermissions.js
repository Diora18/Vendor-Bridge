import { useAuth } from './useAuth';
import { canAccess } from '../utils/permissions';

export const usePermissions = () => {
  const { user } = useAuth();
  return { can: (roles) => canAccess(user, roles) };
};

