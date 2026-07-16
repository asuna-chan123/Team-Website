import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:5000';

const normalizeUser = (payload = {}) => ({
  id: payload.id || payload._id || '',
  fullName: payload.username || payload.fullName || '',
  email: payload.email || '',
  phone: payload.phone || '',
  address: payload.address || '',
  avatar: payload.avatar || '',
  purchaseHistory: Array.isArray(payload.purchaseHistory) ? payload.purchaseHistory : [],
});

export default function LoginForm({ onSignInSuccess }) {
  const [view, setView] = useState('signin');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rememberedLogin');
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm((prev) => ({ ...prev, email: parsed.email || '', password: parsed.password || '' }));
        setRememberMe(true);
      }
    } catch (error) {
      console.warn('Unable to read rememberedLogin', error);
    }
  }, []);

  const handleChange = (field, value) => {
    if (field === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 11);
    }

    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '', form: '' }));
    setSuccessMessage('');
  };

  const validateSignIn = () => {
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = 'Email or phone number is required.';
    } else if (!form.email.includes('@')) {
      if (!/^\d+$/.test(form.email)) {
        newErrors.email = 'Enter a valid email or phone number.';
      } else if (form.email.length < 9 || form.email.length > 11) {
        newErrors.email = 'Phone number must be 9 to 11 digits.';
      }
    }

    if (!form.password) {
      newErrors.password = 'Password is required.';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!form.email.includes('@')) {
      newErrors.email = 'Email must include @.';
    }
    if (!form.password) newErrors.password = 'Password is required.';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Confirm password is required.';
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^\d+$/.test(form.phone)) {
      newErrors.phone = 'Phone number must contain only digits.';
    } else if (form.phone.length < 9 || form.phone.length > 11) {
      newErrors.phone = 'Phone number must be 9 to 11 digits.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (view === 'signin') {
      if (!validateSignIn()) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setErrors({ form: data.error || 'Unable to sign in.' });
          return;
        }

        if (rememberMe) {
          localStorage.setItem('rememberedLogin', JSON.stringify({ email: form.email, password: form.password }));
        } else {
          localStorage.removeItem('rememberedLogin');
        }

        setSuccessMessage('Signed in successfully.');
        setErrors({});
        if (onSignInSuccess) onSignInSuccess(normalizeUser(data.user));
      } catch (error) {
        setErrors({ form: 'Unable to connect to server. Please start the backend first.' });
      }

      return;
    }

    if (!validateRegister()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.fullName,
          email: form.email,
          password: form.password,
          phone: form.phone,
          address: form.address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ form: data.error || 'Unable to register.' });
        return;
      }

      if (rememberMe) {
        localStorage.setItem('rememberedLogin', JSON.stringify({ email: form.email, password: form.password }));
      }

      setSuccessMessage('Registration successful. Please sign in.');
      setErrors({});
      setView('signin');
      setForm((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (error) {
      setErrors({ form: 'Unable to connect to server. Please start the backend first.' });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#1e1e24] p-4">
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 flex flex-col items-center font-sans shadow-xl">
        <div className="mb-10 mt-4">
          <svg width="70" height="70" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="20" r="10" stroke="black" strokeWidth="2.5" />
            <path d="M12 50C12 40.0589 20.0589 32 30 32H34C43.9411 32 52 40.0589 52 50" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <div className="text-center mb-3">
            <p className="text-xs uppercase tracking-[0.4em] text-gray-500">{view === 'register' ? 'Register' : 'Sign In'}</p>
            <h2 className="mt-2 text-3xl font-bold text-[#111111]">{view === 'register' ? 'Create Account' : 'Sign In'}</h2>
          </div>

          {view === 'register' && (
            <div className="w-full">
              <input
                type="text"
                placeholder="Full name"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full px-5 py-4 border border-gray-600 rounded-2xl text-[15px] focus:outline-none focus:border-black transition-colors placeholder-gray-500"
              />
              {errors.fullName && <p className="mt-2 text-sm text-red-500">{errors.fullName}</p>}
            </div>
          )}

          <div className="w-full">
            <input
              type="text"
              placeholder={view === 'register' ? 'Email' : 'Email or phone number'}
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-5 py-4 border border-gray-600 rounded-2xl text-[15px] focus:outline-none focus:border-black transition-colors placeholder-gray-500"
            />
            {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email}</p>}
          </div>

          {view === 'register' && (
            <div className="w-full">
              <input
                type="text"
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-5 py-4 border border-gray-600 rounded-2xl text-[15px] focus:outline-none focus:border-black transition-colors placeholder-gray-500"
              />
              {errors.phone && <p className="mt-2 text-sm text-red-500">{errors.phone}</p>}
            </div>
          )}

          {view === 'register' && (
            <div className="w-full">
              <input
                type="text"
                placeholder="Address (optional)"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-5 py-4 border border-gray-600 rounded-2xl text-[15px] focus:outline-none focus:border-black transition-colors placeholder-gray-500"
              />
            </div>
          )}

          <div className="w-full relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full px-5 py-4 border border-gray-600 rounded-2xl text-[15px] pr-12 focus:outline-none focus:border-black transition-colors placeholder-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black transition-colors"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 1-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              )}
            </button>
            {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password}</p>}
          </div>

          {view === 'register' && (
            <div className="w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className="w-full px-5 py-4 border border-gray-600 rounded-2xl text-[15px] focus:outline-none focus:border-black transition-colors placeholder-gray-500"
              />
              {errors.confirmPassword && <p className="mt-2 text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>
          )}

          <div className="flex items-center gap-3">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-400 text-black focus:ring-black"
            />
            <label htmlFor="remember-me" className="text-sm text-gray-700">
              Remember me
            </label>
          </div>

          {successMessage && <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{successMessage}</div>}
          {errors.form && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{errors.form}</div>}

          <div className="w-full flex justify-center mt-4">
            <button
              type="submit"
              className="w-[65%] bg-[#333333] hover:bg-black text-white font-bold py-3.5 px-6 rounded-2xl text-xl transition-all tracking-wide"
            >
              {view === 'register' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

          <div className="text-sm text-center text-gray-800">
            {view === 'register' ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              type="button"
              onClick={() => {
                setView(view === 'register' ? 'signin' : 'register');
                setErrors({});
                setSuccessMessage('');
              }}
              className="font-bold hover:underline"
            >
              {view === 'register' ? 'Sign In' : 'Register now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
