export default function Card({ children, className = '', title, subtitle }) {
  return (
    <div className={`card p-6 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4 border-b border-slate-100 pb-4">
          {title && <h2 className="text-lg font-semibold text-slate-800">{title}</h2>}
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
