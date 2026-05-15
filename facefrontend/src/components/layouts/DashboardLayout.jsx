import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaHome, FaUsers, FaChalkboardTeacher, FaBuilding, FaClipboardList,
  FaBell, FaBook, FaCalendar, FaSignOutAlt, FaUserGraduate, FaCamera,
} from 'react-icons/fa';

const NAV = {
  admin: [
    { to: '/admin', label: 'Overview', icon: FaHome },
    { to: '/admin/students', label: 'Students', icon: FaUserGraduate },
    { to: '/admin/teachers', label: 'Teachers', icon: FaChalkboardTeacher },
    { to: '/admin/departments', label: 'Departments', icon: FaBuilding },
    { to: '/admin/classes', label: 'Classes', icon: FaBook },
    { to: '/admin/schedules', label: 'Schedules', icon: FaCalendar },
    { to: '/admin/attendance', label: 'Attendance', icon: FaClipboardList },
    { to: '/admin/recognition', label: 'Recognition Logs', icon: FaCamera },
    { to: '/Addstudent', label: 'Enroll Student', icon: FaUsers },
    { to: '/Enrolled', label: 'Enrolled List', icon: FaUsers },
    { to: '/Period', label: 'Period Attendance', icon: FaClipboardList },
  ],
  teacher: [
    { to: '/teacher', label: 'Dashboard', icon: FaHome },
    { to: '/teacher/classes', label: 'My Classes', icon: FaBook },
    { to: '/teacher/attendance', label: 'Take Attendance', icon: FaCamera },
    { to: '/teacher/reports', label: 'Reports', icon: FaClipboardList },
    { to: '/teacher/assignments', label: 'Assignments', icon: FaBook },
    { to: '/teacher/announcements', label: 'Announcements', icon: FaBell },
  ],
  student: [
    { to: '/student', label: 'Dashboard', icon: FaHome },
    { to: '/student/attendance', label: 'My Attendance', icon: FaClipboardList },
    { to: '/student/schedule', label: 'Schedule', icon: FaCalendar },
    { to: '/student/assignments', label: 'Assignments', icon: FaBook },
    { to: '/student/announcements', label: 'Announcements', icon: FaBell },
    { to: '/student/profile', label: 'Profile', icon: FaUsers },
  ],
};

const ROLE_THEME = {
  admin: {
    gradient: 'from-blue-600 via-blue-700 to-indigo-800',
    accent: 'bg-blue-500',
    activeNav: 'bg-blue-500/20 text-white ring-1 ring-blue-400/30',
  },
  teacher: {
    gradient: 'from-emerald-600 via-emerald-700 to-teal-800',
    accent: 'bg-emerald-500',
    activeNav: 'bg-emerald-500/20 text-white ring-1 ring-emerald-400/30',
  },
  student: {
    gradient: 'from-violet-600 via-violet-700 to-purple-800',
    accent: 'bg-violet-500',
    activeNav: 'bg-violet-500/20 text-white ring-1 ring-violet-400/30',
  },
};

export default function DashboardLayout({ children, role }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = NAV[role] || [];
  const theme = ROLE_THEME[role] || ROLE_THEME.admin;

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="flex min-h-screen bg-slate-100/80">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-800/50 bg-slate-900 shadow-2xl">
        <div className={`bg-gradient-to-br ${theme.gradient} px-5 py-6`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.accent} text-lg font-bold text-white shadow-lg`}>
              SC
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">Smart Campus</p>
              <h1 className="truncate text-base font-bold capitalize text-white">{role} Panel</h1>
            </div>
          </div>
          <p className="mt-3 truncate rounded-lg bg-black/20 px-3 py-1.5 text-xs text-white/80">
            {user?.email || user?.username}
          </p>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  active
                    ? theme.activeNav
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`shrink-0 text-base ${active ? 'opacity-100' : 'opacity-70'}`} />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </aside>

      <main className="ml-64 min-h-screen flex-1">
        <div className="border-b border-slate-200/80 bg-white/80 px-6 py-4 backdrop-blur-md lg:px-8">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
