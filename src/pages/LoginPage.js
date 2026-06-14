import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
export default function LoginPage() {
  const [email, setEmail]     = useState('admin@smsmarketing.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const { login }             = useAuth();
  const navigate              = useNavigate();
  const handleLogin = async () => {
    if (!email || !password) { setError('Email aur password required hain'); return; }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#1e1b4b 0%,#3730a3 100%)'}}>
      <div style={{width:'100%',maxWidth:400,padding:16}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:40,marginBottom:8}}>📱</div>
          <h1 style={{color:'#fff',fontSize:26,fontWeight:800,margin:0}}>SMS Marketing</h1>
          <p style={{color:'#a5b4fc',fontSize:13,marginTop:4}}>Sign in to your account</p>
        </div>
        <div style={{background:'#fff',borderRadius:20,padding:32,boxShadow:'0 25px 60px rgba(0,0,0,.3)'}}>
          {error && <div style={{background:'#fef2f2',color:'#991b1b',padding:'10px 14px',borderRadius:8,marginBottom:16,fontSize:13}}>{error}</div>}
          <div style={{display:'flex',flexDirection:'column',gap:18}}>
            <div>
              <label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block'}}>Email Address</label>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid #e2e8f0',fontSize:14,outline:'none',marginTop:4,boxSizing:'border-box'}}
                placeholder="admin@smsmarketing.com"
              />
            </div>
            <div>
              <label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block'}}>Password</label>
              <input type="password" required value={password} onChange={e=>setPassword(e.target.value)}
                onKeyDown={e=>e.key==='Enter' && handleLogin()}
                style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid #e2e8f0',fontSize:14,outline:'none',marginTop:4,boxSizing:'border-box'}}
                placeholder="Enter password"
              />
            </div>
            <button onClick={handleLogin} disabled={loading} style={{
              background:'linear-gradient(135deg,#6366f1,#4f46e5)',color:'#fff',
              border:'none',borderRadius:10,padding:'12px',fontSize:14,fontWeight:600,
              cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,marginTop:4,
              boxShadow:'0 4px 12px rgba(99,102,241,.4)',width:'100%',
            }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </div>
          <div style={{marginTop:20,padding:12,background:'#f8fafc',borderRadius:8,fontSize:12,color:'#64748b'}}>
            <strong>Default credentials:</strong><br/>
            Email: admin@smsmarketing.com<br/>
            Password: Admin@123
          </div>
        </div>
      </div>
    </div>
  );
}