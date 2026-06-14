import React from 'react';
import { Loader2 } from 'lucide-react';

// ── Button ────────────────────────────────────
export const Btn = ({ children, variant='primary', size='md', loading, disabled, style={}, ...props }) => {
  const base = {
    display:'inline-flex', alignItems:'center', gap:6, borderRadius:8,
    border:'none', cursor: (loading||disabled) ? 'not-allowed' : 'pointer',
    fontWeight:500, transition:'all .15s', opacity: (loading||disabled) ? .65 : 1,
  };
  const sizes = { sm:{padding:'6px 12px',fontSize:12}, md:{padding:'9px 16px',fontSize:13}, lg:{padding:'12px 20px',fontSize:14} };
  const variants = {
    primary:  {background:'#6366f1',color:'#fff'},
    danger:   {background:'#ef4444',color:'#fff'},
    success:  {background:'#22c55e',color:'#fff'},
    ghost:    {background:'transparent',color:'#6366f1',border:'1px solid #6366f1'},
    outline:  {background:'#fff',color:'#374151',border:'1px solid #e2e8f0'},
  };
  return (
    <button style={{...base,...sizes[size],...variants[variant],...style}} disabled={loading||disabled} {...props}>
      {loading && <Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/>}
      {children}
    </button>
  );
};

// ── Card ──────────────────────────────────────
export const Card = ({ children, style={} }) => (
  <div style={{background:'#fff',borderRadius:12,border:'1px solid #e2e8f0',padding:24,boxShadow:'0 1px 3px rgba(0,0,0,.06)',...style}}>
    {children}
  </div>
);

// ── Input ─────────────────────────────────────
export const Input = ({ label, error, style={}, ...props }) => (
  <div style={{display:'flex',flexDirection:'column',gap:4}}>
    {label && <label style={{fontSize:12,fontWeight:600,color:'#374151'}}>{label}</label>}
    <input
      style={{
        padding:'9px 12px', borderRadius:8, fontSize:13,
        border: error ? '1px solid #ef4444' : '1px solid #e2e8f0',
        outline:'none', background:'#fff', width:'100%',
        transition:'border .15s',
        ...style
      }}
      {...props}
    />
    {error && <span style={{fontSize:11,color:'#ef4444'}}>{error}</span>}
  </div>
);

// ── Select ────────────────────────────────────
export const Select = ({ label, error, children, style={}, ...props }) => (
  <div style={{display:'flex',flexDirection:'column',gap:4}}>
    {label && <label style={{fontSize:12,fontWeight:600,color:'#374151'}}>{label}</label>}
    <select style={{padding:'9px 12px',borderRadius:8,fontSize:13,border:'1px solid #e2e8f0',outline:'none',background:'#fff',width:'100%',...style}} {...props}>
      {children}
    </select>
    {error && <span style={{fontSize:11,color:'#ef4444'}}>{error}</span>}
  </div>
);

// ── Textarea ──────────────────────────────────
export const Textarea = ({ label, error, style={}, ...props }) => (
  <div style={{display:'flex',flexDirection:'column',gap:4}}>
    {label && <label style={{fontSize:12,fontWeight:600,color:'#374151'}}>{label}</label>}
    <textarea style={{padding:'9px 12px',borderRadius:8,fontSize:13,border:'1px solid #e2e8f0',outline:'none',background:'#fff',width:'100%',resize:'vertical',minHeight:80,...style}} {...props}/>
    {error && <span style={{fontSize:11,color:'#ef4444'}}>{error}</span>}
  </div>
);

// ── Badge ─────────────────────────────────────
const badgeColors = {
  delivered:'#dcfce7:#166534', sent:'#dbeafe:#1e40af', failed:'#fee2e2:#991b1b',
  queued:'#fef9c3:#854d0e', draft:'#f1f5f9:#475569', running:'#ede9fe:#5b21b6',
  completed:'#dcfce7:#166534', paused:'#ffedd5:#9a3412', cancelled:'#f1f5f9:#475569',
  scheduled:'#dbeafe:#1e40af', admin:'#ede9fe:#5b21b6', user:'#f1f5f9:#475569', manager:'#dbeafe:#1e40af',
};
export const Badge = ({ status }) => {
  const colors = (badgeColors[status] || '#f1f5f9:#475569').split(':');
  return (
    <span style={{background:colors[0],color:colors[1],padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:600,textTransform:'capitalize'}}>
      {status}
    </span>
  );
};

// ── Stat Card ─────────────────────────────────
export const StatCard = ({ label, value, icon: Icon, color='#6366f1', sub }) => (
  <Card style={{display:'flex',alignItems:'center',gap:16}}>
    <div style={{background:color+'18',borderRadius:12,padding:12,color}}>
      <Icon size={22}/>
    </div>
    <div>
      <div style={{fontSize:22,fontWeight:700,color:'#0f172a'}}>{value ?? '—'}</div>
      <div style={{fontSize:12,color:'#64748b'}}>{label}</div>
      {sub && <div style={{fontSize:11,color:'#94a3b8',marginTop:2}}>{sub}</div>}
    </div>
  </Card>
);

// ── Table ─────────────────────────────────────
export const Table = ({ heads=[], rows=[], empty='No data found' }) => (
  <div style={{overflowX:'auto'}}>
    <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
      <thead>
        <tr style={{background:'#f8fafc',borderBottom:'2px solid #e2e8f0'}}>
          {heads.map((h,i) => <th key={i} style={{padding:'10px 14px',textAlign:'left',fontWeight:600,color:'#475569',fontSize:11,textTransform:'uppercase',letterSpacing:.5,whiteSpace:'nowrap'}}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0
          ? <tr><td colSpan={heads.length} style={{padding:40,textAlign:'center',color:'#94a3b8'}}>{empty}</td></tr>
          : rows.map((row,i) => (
            <tr key={i} style={{borderBottom:'1px solid #f1f5f9',transition:'background .1s'}}
              onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
              onMouseLeave={e=>e.currentTarget.style.background=''}>
              {row.map((cell,j) => <td key={j} style={{padding:'12px 14px',color:'#374151'}}>{cell}</td>)}
            </tr>
          ))
        }
      </tbody>
    </table>
  </div>
);

// ── Modal ─────────────────────────────────────
export const Modal = ({ open, onClose, title, children, width=480 }) => {
  if (!open) return null;
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={onClose}>
      <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:width,maxHeight:'90vh',overflow:'auto',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:'20px 24px',borderBottom:'1px solid #e2e8f0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3 style={{fontSize:16,fontWeight:700}}>{title}</h3>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'#64748b',fontSize:20,lineHeight:1}}>×</button>
        </div>
        <div style={{padding:24}}>{children}</div>
      </div>
    </div>
  );
};

// ── Spinner ───────────────────────────────────
export const Spinner = ({ size=32 }) => (
  <div style={{display:'flex',justifyContent:'center',padding:40}}>
    <Loader2 size={size} style={{animation:'spin 1s linear infinite',color:'#6366f1'}}/>
    <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ── Page Header ───────────────────────────────
export const PageHeader = ({ title, subtitle, action }) => (
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
    <div>
      <h1 style={{fontSize:22,fontWeight:700,color:'#0f172a'}}>{title}</h1>
      {subtitle && <p style={{color:'#64748b',fontSize:13,marginTop:4}}>{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);
