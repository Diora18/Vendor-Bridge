import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';

const SignupPage = () => {
	const navigate = useNavigate();
	const { signUp } = useAuth();
	const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
	const [error, setError] = useState('');

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError('');

		if (form.password !== form.confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		try {
			await signUp({ name: form.name, email: form.email, password: form.password });
			navigate('/dashboard');
		} catch (err) {
			setError(err.response?.data?.message || 'Signup failed');
		}
	};

	return (
		<main className="auth-page">
			<form className="auth-card" onSubmit={handleSubmit}>
				<div className="auth-brand">VendorBridge</div>
				<h1>Create account</h1>
				<p>Register a new procurement user account to access VendorBridge.</p>
				<Input label="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
				<Input label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
				<Input label="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength={6} required />
				<Input label="Confirm password" type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} minLength={6} required />
				{error && <div className="error">{error}</div>}
				<Button type="submit">Create account</Button>
				<div className="auth-links">
					<Link to="/login">Back to sign in</Link>
					<Link to="/forgot-password">Forgot password</Link>
				</div>
			</form>
		</main>
	);
};

export default SignupPage;

