import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Megaphone, FileText,
  MessageSquare, BarChart2, Settings, LogOut,
  Menu, X, Shield, ChevronRight
} from 'lucide-react';

const navItems = [
  { to: '/',           label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/contacts',   label: 'Contacts',   icon: Users },
  { to: '/campaigns',  label: 'Campaigns',  icon: Megaphone },
  { to: '/templates',  label: 'Templates',  icon: FileText },
  { to: '/messages',   label: 'Messages',   icon: MessageSquare },
  { to: '/analytics',  label: 'Analytics',  icon: BarChart2 },
];

const s = {
  shell:   { display:'flex', minHeight:'100vh' },
  sidebar: (open) => ({
    width: open ? 240 : 0,
    minWidth: open ? 240 : 0,
    background:'#1e1b4b',
    display:'flex', flexDirection:'column',
    transition:'all .25s ease',
    overflow:'hidden',
    position:'fixed', top:0, left:0, bottom:0, zIndex:100,
  }),
  logo:  { padding:'24px 20px 16px', borderBottom:'1px solid rgba(255,255,255,.08)' },
  logoT: { color:'#fff', fontWeight:700, fontSize:18, whiteSpace:'nowrap' },
  logoS: { color:'#a5b4fc', fontSize:11, marginTop:2, whiteSpace:'nowrap' },
  nav:   { flex:1, padding:'12px 0', overflowY:'auto' },
  link:  (active) => ({
    display:'flex', alignItems:'center', gap:10, padding:'10px 20px',
    color: active ? '#fff' : '#a5b4fc',
    background: active ? 'rgba(99,102,241,.3)' : 'transparent',
    borderLeft: active ? '3px solid #6366f1' : '3px solid transparent',
    textDecoration:'none', fontSize:14, fontWeight: active ? 600 : 400,
    cursor:'pointer', whiteSpace:'nowrap', transition:'all .15s',
  }),
  section: { padding:'8px 20px 4px', color:'#6366f1', fontSize:10, fontWeight:700, letterSpacing:1, textTransform:'uppercase', whiteSpace:'nowrap' },
  footer: { padding:'16px 20px', borderTop:'1px solid rgba(255,255,255,.08)' },
  user:  { color:'#a5b4fc', fontSize:12, marginBottom:10, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  logout:{ display:'flex', alignItems:'center', gap:8, color:'#f87171', fontSize:13, cursor:'pointer', background:'none', border:'none', padding:0, whiteSpace:'nowrap' },
  main:  (open) => ({ flex:1, marginLeft: open ? 240 : 0, transition:'margin .25s ease', display:'flex', flexDirection:'column', minHeight:'100vh' }),
  topbar:{ background:'#fff', borderBottom:'1px solid var(--border)', padding:'12px 24px', display:'flex', alignItems:'center', gap:16, position:'sticky', top:0, zIndex:50 },
  menuBtn:{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', alignItems:'center', padding:4, borderRadius:6 },
  content:{ flex:1, padding:'24px' },
};

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={s.shell}>
      {/* Sidebar */}
      <aside style={s.sidebar(open)}>
        <div style={s.logo}>
          <div style={s.logoT}>📱 SMS Pro</div>
          <div style={s.logoS}>Marketing Platform</div>
        </div>

        <nav style={s.nav}>
          <div style={s.section}>Main</div>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to==='/'} style={({ isActive }) => s.link(isActive)}>
              <Icon size={16} />{label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div style={{...s.section, marginTop:12}}>Admin</div>
              <NavLink to="/admin" style={({ isActive }) => s.link(isActive)}>
                <Shield size={16} />Admin Panel
              </NavLink>
            </>
          )}

          <div style={{...s.section, marginTop:12}}>Account</div>
          <NavLink to="/settings" style={({ isActive }) => s.link(isActive)}>
            <Settings size={16} />Settings
          </NavLink>
        </nav>

        <div style={s.footer}>
          <div style={s.user}>{user?.first_name} {user?.last_name}<br/><span style={{opacity:.6}}>{user?.role}</span></div>
          <button style={s.logout} onClick={handleLogout}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div style={s.main(open)}>
        <div style={s.topbar}>
          <button style={s.menuBtn} onClick={() => setOpen(o => !o)}>
            {open ? <X size={20}/> : <Menu size={20}/>}
          </button>
          <span style={{color:'var(--text-muted)', fontSize:13}}>
            Welcome, <strong>{user?.first_name}</strong>
          </span>
        </div>
        <div style={s.content}>{children}</div>
      </div>
    </div>
  );
}
