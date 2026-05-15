import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaGraduationCap, FaUserShield, FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import { useAuth } from './context/AuthContext';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@demo.com', icon: FaUserShield, color: 'hover:border-blue-300 hover:bg-blue-50 text-blue-700' },
  { label: 'Teacher', email: 'teacher@demo.com', icon: FaChalkboardTeacher, color: 'hover:border-emerald-300 hover:bg-emerald-50 text-emerald-700' },
  { label: 'Student', email: 'student@demo.com', icon: FaUserGraduate, color: 'hover:border-violet-300 hover:bg-violet-50 text-violet-700' },
];

export default function Signin() {
  const [authMode, setAuthMode] = useState('login');
  const [role, setRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', retype: '' });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (authMode === 'signup' && form.password !== form.retype) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      if (authMode === 'login') {
        const data = await login(form.email, form.password);
        toast.success('Welcome back!');
        navigate(`/${data.user.role}`);
      } else {
        const data = await register({
          username: form.username,
          email: form.email,
          password: form.password,
          role,
          profile: { name: form.username },
        });
        toast.success('Account created!');
        navigate(`/${data.user.role}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed';
      toast.error(msg);
      if (!err.response) toast.error('Backend not reachable — start server on port 5001');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email) => {
    setAuthMode('login');
    setForm((f) => ({ ...f, email, password: 'demo123' }));
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        <div className="relative z-10 flex flex-1 flex-col justify-center p-12 text-white">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <FaGraduationCap className="text-3xl text-blue-300" />
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Smart Campus
            <span className="mt-2 block text-2xl font-normal text-blue-200">Management Platform</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-300">
            AI-powered face recognition attendance, role-based dashboards, and complete campus administration.
          </p>
          <ul className="mt-10 space-y-3 text-sm text-slate-400">
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> LBPH face recognition</li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Period-wise attendance</li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Admin · Teacher · Student panels</li>
          </ul>
        </div>
        <p className="relative z-10 p-12 text-xs text-slate-500">TechBeedi College · Capstone ETP</p>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-col justify-center bg-white px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2 text-brand-600">
              <FaGraduationCap className="text-2xl" />
              <span className="font-bold">Smart Campus</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            {authMode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {authMode === 'login' ? 'Sign in to your dashboard' : 'Register for campus access'}
          </p>

          <div className="mt-6 flex rounded-xl bg-slate-100 p-1">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setAuthMode(m)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
                  authMode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {authMode === 'signup' && (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">Role</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field">
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">Username</label>
                  <input className="input-field" placeholder="Your name" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
                </div>
              </>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Email</label>
              <input type="email" className="input-field" placeholder="you@college.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Password</label>
              <input type="password" className="input-field" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
            {authMode === 'signup' && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Confirm password</label>
                <input type="password" className="input-field" placeholder="••••••••" value={form.retype} onChange={(e) => setForm({ ...form, retype: e.target.value })} required />
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Please wait…' : authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Quick demo · password: demo123</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map(({ label, email, icon: Icon, color }) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => fillDemo(email)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-3 text-xs font-medium transition ${color}`}
                >
                  <Icon className="text-base" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link to="/" className="font-medium text-brand-600 hover:text-brand-700 hover:underline">
              → Public attendance kiosk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
