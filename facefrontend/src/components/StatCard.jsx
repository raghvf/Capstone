export default function StatCard({ title, value, subtitle, color = 'blue', icon: Icon }) {
  const styles = {
    blue: {
      card: 'from-blue-500/10 to-blue-600/5 border-blue-200/60',
      icon: 'bg-blue-500 text-white',
      value: 'text-blue-700',
    },
    green: {
      card: 'from-emerald-500/10 to-emerald-600/5 border-emerald-200/60',
      icon: 'bg-emerald-500 text-white',
      value: 'text-emerald-700',
    },
    violet: {
      card: 'from-violet-500/10 to-violet-600/5 border-violet-200/60',
      icon: 'bg-violet-500 text-white',
      value: 'text-violet-700',
    },
    amber: {
      card: 'from-amber-500/10 to-amber-600/5 border-amber-200/60',
      icon: 'bg-amber-500 text-white',
      value: 'text-amber-700',
    },
  };
  const s = styles[color] || styles.blue;

  return (
    <div className={`card-hover relative overflow-hidden border bg-gradient-to-br p-5 ${s.card}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className={`mt-2 text-3xl font-bold tracking-tight ${s.value}`}>{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-sm ${s.icon}`}>
            <Icon className="text-lg" />
          </div>
        )}
      </div>
    </div>
  );
}
