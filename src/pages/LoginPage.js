import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm]       = useState({ email:'admin@smsmarketing.com', password:'' });
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inp = { width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid #e2e8f0',fontSize:14,outline:'none',marginTop:4 };
  const lbl = { fontSize:12,fontWeight:600,color:'#374151',display:'block' };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#1e1b4b 0%,#3730a3 100%)'}}>
      <div style={{width:'100%',maxWidth:400,padding:16}}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:40,marginBottom:8}}>📱</div>
          <h1 style={{color:'#fff',fontSize:26,fontWeight:800,margin:0}}>SMS Marketing</h1>
          <p style={{color:'#a5b4fc',fontSize:13,marginTop:4}}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div style={{background:'#fff',borderRadius:20,padding:32,boxShadow:'0 25px 60px rgba(0,0,0,.3)'}}>
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:18}}>
            <div>
              <label style={lbl}>Email Address</label>
              <input type="email" style={inp} required
                value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}
                placeholder="admin@smsmarketing.com"
              />
            </div>
            <div>
              <label style={lbl}>Password</label>
              <input type="password" style={inp} required
                value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))}
                placeholder="Enter password"
              />
            </div>
            <button type="submit" disabled={loading} style={{
              background:'linear-gradient(135deg,#6366f1,#4f46e5)',color:'#fff',
              border:'none',borderRadius:10,padding:'12px',fontSize:14,fontWeight:600,
              cursor:loading?'not-allowed':'pointer',opacity:loading?.7:1,marginTop:4,
              boxShadow:'0 4px 12px rgba(99,102,241,.4)',
            }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

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
