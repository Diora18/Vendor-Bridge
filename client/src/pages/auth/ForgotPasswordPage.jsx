import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { forgotPassword } from '../../services/authService';

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = async (event) => {
		event.preventDefault();
		setMessage('');
		setError('');

		try {
			const data = await forgotPassword({ email });
			setMessage(data.message || 'If the account exists, a reset link will be sent.');
		} catch (err) {
			setError(err.response?.data?.message || 'Unable to request password reset');
		}
	};

	return (
		<main className="auth-page">
			<form className="auth-card" onSubmit={handleSubmit}>
				<div className="auth-brand">VendorBridge</div>
				<h1>Forgot password</h1>
				<p>Enter your email address and we will send password reset instructions.</p>
				<p style={{ fontSize: 14, color: '#65758b' }}>Requires SMTP settings in <code>server/.env</code>. In local dev without email configured, the reset link is printed in the server terminal.</p>
				<Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
				{error && <div className="error">{error}</div>}
				{message && <div className="success">{message}</div>}
				<Button type="submit">Send reset link</Button>
				<div className="auth-links">
					<Link to="/login">Back to sign in</Link>
					<Link to="/signup">Create account</Link>
				</div>
			</form>
		</main>
	);
};

export default ForgotPasswordPage;

