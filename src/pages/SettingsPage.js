import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, Btn, Input, PageHeader } from '../components/UI';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ current_password:'', new_password:'', confirm:'' });
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm) return toast.error('Naye passwords match nahi kar rahe');
    if (form.new_password.length < 8) return toast.error('Password kam se kam 8 characters ka hona chahiye');
    setSaving(true);
    try {
      await authAPI.changePassword({ current_password: form.current_password, new_password: form.new_password });
      toast.success('Password change ho gaya!');
      setForm({ current_password:'', new_password:'', confirm:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Account aur security settings"/>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,maxWidth:800}}>
        {/* Profile Info */}
        <Card>
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:16}}>Profile Information</h3>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {[
              {label:'Name',  value:`${user?.first_name} ${user?.last_name}`},
              {label:'Email', value:user?.email},
              {label:'Role',  value:user?.role?.toUpperCase()},
            ].map(({label,value})=>(
              <div key={label} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #f1f5f9'}}>
                <span style={{fontSize:12,color:'#64748b',fontWeight:600}}>{label}</span>
                <span style={{fontSize:13,fontWeight:500}}>{value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Change Password */}
        <Card>
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:16}}>Change Password</h3>
          <form onSubmit={handleChangePassword} style={{display:'flex',flexDirection:'column',gap:12}}>
            <Input label="Current Password" type="password" value={form.current_password}
              onChange={e=>setForm(p=>({...p,current_password:e.target.value}))} required/>
            <Input label="New Password" type="password" value={form.new_password}
              onChange={e=>setForm(p=>({...p,new_password:e.target.value}))} required/>
            <Input label="Confirm New Password" type="password" value={form.confirm}
              onChange={e=>setForm(p=>({...p,confirm:e.target.value}))} required/>
            <Btn type="submit" loading={saving} style={{marginTop:4}}>Update Password</Btn>
          </form>
        </Card>
      </div>

      {/* API Reference */}
      <Card style={{marginTop:16,maxWidth:800}}>
        <h3 style={{fontSize:14,fontWeight:700,marginBottom:16}}>API Reference</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {[
            'POST /api/auth/login',
            'GET  /api/contacts',
            'POST /api/contacts/import',
            'GET  /api/campaigns',
            'POST /api/campaigns/:id/launch',
            'GET  /api/templates',
            'GET  /api/messages',
            'GET  /api/analytics/dashboard',
          ].map(ep=>(
            <code key={ep} style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:6,padding:'6px 10px',fontSize:11,color:'#374151',display:'block'}}>
              {ep}
            </code>
          ))}
        </div>
      </Card>
    </div>
  );
}
