import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { resetPassword } from '../../services/authService';

const ResetPasswordPage = () => {
	const { token } = useParams();
	const navigate = useNavigate();
	const [form, setForm] = useState({ password: '', confirmPassword: '' });
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = async (event) => {
		event.preventDefault();
		setMessage('');
		setError('');

		if (form.password !== form.confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		try {
			const data = await resetPassword({ token, password: form.password });
			setMessage(data.message || 'Password has been reset. You can now sign in again.');
			setTimeout(() => navigate('/login'), 1500);
		} catch (err) {
			setError(err.response?.data?.message || 'Unable to reset password');
		}
	};

	return (
		<main className="auth-page">
			<form className="auth-card" onSubmit={handleSubmit}>
				<div className="auth-brand">VendorBridge</div>
				<h1>Reset password</h1>
				<p>Create a new password for your account.</p>
				<Input label="New password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength={6} required />
				<Input label="Confirm new password" type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} minLength={6} required />
				{error && <div className="error">{error}</div>}
				{message && <div className="success">{message}</div>}
				<Button type="submit">Reset password</Button>
				<div className="auth-links">
					<Link to="/login">Back to sign in</Link>
					<Link to="/forgot-password">Resend reset link</Link>
				</div>
			</form>
		</main>
	);
};

export default ResetPasswordPage;

