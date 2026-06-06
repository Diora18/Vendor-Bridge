import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const fillDemo = (role) => {
    setForm({ email: `${role}@vendorbridge.local`, password: 'Password@123' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await signIn(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-brand">VendorBridge</div>
        <h1>Sign in</h1>
        <p>Access procurement workflows, approvals, purchase orders, and invoices.</p>
        <Input label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        <Input label="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        <Select label="Demo account" onChange={(event) => event.target.value && fillDemo(event.target.value)} defaultValue="">
          <option value="">Choose role shortcut</option>
          <option value={ROLES.ADMIN}>Admin</option>
          <option value={ROLES.PROCUREMENT_OFFICER}>Procurement Officer</option>
          <option value={ROLES.MANAGER}>Manager</option>
          <option value={ROLES.VENDOR}>Vendor</option>
        </Select>
        {error && <div className="error">{error}</div>}
        <Button type="submit">Sign in</Button>
        <div className="auth-links">
          <Link to="/signup">Create account</Link>
          <Link to="/forgot-password">Forgot password</Link>
        </div>
      </form>
    </main>
  );
};

export default LoginPage;

