import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { Card, Btn, Badge, Table, Modal, Input, Select, PageHeader, Spinner, StatCard } from '../components/UI';
import { Users, MessageSquare, Megaphone, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [users, setUsers]   = useState([]);
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState({ email:'', password:'', first_name:'', last_name:'', role:'user' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [u, s] = await Promise.all([adminAPI.getUsers(), adminAPI.systemStats()]);
      setUsers(u.data.data);
      setStats(s.data.data);
    } catch { toast.error('Data load nahi hua'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.email || !form.password || !form.first_name || !form.last_name) return toast.error('Sab fields required hain');
    setSaving(true);
    try {
      await adminAPI.createUser(form);
      toast.success('User create ho gaya!');
      setModal(false);
      setForm({ email:'', password:'', first_name:'', last_name:'', role:'user' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('User delete karein?')) return;
    try { await adminAPI.deleteUser(id); toast.success('Deleted!'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const rows = users.map(u => [
    <div><div style={{fontWeight:600}}>{u.first_name} {u.last_name}</div><div style={{fontSize:11,color:'#94a3b8'}}>{u.email}</div></div>,
    <Badge status={u.role}/>,
    u.is_active
      ? <span style={{color:'#22c55e',fontWeight:600,fontSize:12}}>● Active</span>
      : <span style={{color:'#ef4444',fontWeight:600,fontSize:12}}>● Inactive</span>,
    u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never',
    new Date(u.created_at).toLocaleDateString(),
    <Btn size="sm" variant="danger" onClick={()=>handleDelete(u.id)}><Trash2 size={12}/></Btn>
  ]);

  return (
    <div>
      <PageHeader title="Admin Panel" subtitle="System management aur user control"/>

      {stats && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,marginBottom:20}}>
          <StatCard label="Total Users"    value={stats.users?.total}     icon={Users}        color="#6366f1"/>
          <StatCard label="Active Users"   value={stats.users?.active}    icon={Users}        color="#22c55e"/>
          <StatCard label="Total Contacts" value={stats.contacts?.total}  icon={Users}        color="#f59e0b"/>
          <StatCard label="Total Messages" value={stats.messages?.total}  icon={MessageSquare} color="#3b82f6"/>
          <StatCard label="Campaigns"      value={stats.campaigns?.total} icon={Megaphone}    color="#8b5cf6"/>
        </div>
      )}

      <Card>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h3 style={{fontSize:14,fontWeight:700}}>User Management</h3>
          <Btn onClick={()=>setModal(true)}><Plus size={14}/>Add User</Btn>
        </div>
        {loading ? <Spinner/> : (
          <Table
            heads={['User','Role','Status','Last Login','Created','Action']}
            rows={rows}
            empty="Koi user nahi"
          />
        )}
      </Card>

      <Modal open={modal} onClose={()=>setModal(false)} title="Add New User">
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Input label="First Name *" value={form.first_name} onChange={e=>setForm(p=>({...p,first_name:e.target.value}))}/>
            <Input label="Last Name *"  value={form.last_name}  onChange={e=>setForm(p=>({...p,last_name:e.target.value}))}/>
          </div>
          <Input label="Email *" type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/>
          <Input label="Password *" type="password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))}/>
          <Select label="Role" value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))}>
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </Select>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <Btn variant="outline" onClick={()=>setModal(false)}>Cancel</Btn>
            <Btn loading={saving} onClick={handleCreate}>Create User</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
