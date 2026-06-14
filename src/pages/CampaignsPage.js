import React, { useEffect, useState, useCallback } from 'react';
import { campaignsAPI, templatesAPI, contactsAPI } from '../services/api';
import { Card, Btn, Badge, Table, Modal, Input, Select, Textarea, PageHeader, Spinner } from '../components/UI';
import { Plus, Play, Pause, Trash2, Eye, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { name:'', message_text:'', template_id:'', scheduled_at:'', list_ids:[] };

export default function CampaignsPage() {
  const [campaigns, setCampaigns]     = useState([]);
  const [templates, setTemplates]     = useState([]);
  const [lists, setLists]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState(false);
  const [form, setForm]               = useState(EMPTY);
  const [saving, setSaving]           = useState(false);
  const [actionLoading, setAction]    = useState(null);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatus]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const [c, t, l] = await Promise.all([
        campaignsAPI.getAll(params),
        templatesAPI.getAll(),
        contactsAPI.getLists(),
      ]);
      setCampaigns(c.data.data);
      setTemplates(t.data.data);
      setLists(l.data.data);
    } catch { toast.error('Data load nahi hua'); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY); setModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.message_text) return toast.error('Name aur message required hain');
    setSaving(true);
    try {
      await campaignsAPI.create(form);
      toast.success('Campaign create ho gayi!');
      setModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleAction = async (id, action) => {
    setAction(id + action);
    try {
      if (action === 'launch') await campaignsAPI.launch(id);
      else if (action === 'pause') await campaignsAPI.pause(id);
      else if (action === 'delete') { await campaignsAPI.delete(id); }
      toast.success(`Campaign ${action} ho gayi!`);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setAction(null); }
  };

  const toggleList = (id) => setForm(p => ({
    ...p,
    list_ids: p.list_ids.includes(id) ? p.list_ids.filter(x=>x!==id) : [...p.list_ids, id]
  }));

  // Template select karein toh message auto-fill
  const handleTemplateSelect = (tid) => {
    const t = templates.find(t => t.id === tid);
    setForm(p => ({ ...p, template_id: tid, message_text: t ? t.body : p.message_text }));
  };

  const rows = campaigns.map(c => [
    <strong style={{color:'#0f172a'}}>{c.name}</strong>,
    <Badge status={c.status}/>,
    c.total_contacts || 0,
    <span style={{color:'#22c55e',fontWeight:600}}>{c.delivered_count || 0}</span>,
    <span style={{color:'#ef4444'}}>{c.failed_count || 0}</span>,
    `$${parseFloat(c.cost||0).toFixed(2)}`,
    new Date(c.created_at).toLocaleDateString(),
    <div style={{display:'flex',gap:6}}>
      {c.status === 'draft' || c.status === 'scheduled' ? (
        <Btn size="sm" variant="success" loading={actionLoading===c.id+'launch'} onClick={()=>handleAction(c.id,'launch')}>
          <Play size={12}/>Launch
        </Btn>
      ) : c.status === 'running' ? (
        <Btn size="sm" variant="outline" loading={actionLoading===c.id+'pause'} onClick={()=>handleAction(c.id,'pause')}>
          <Pause size={12}/>Pause
        </Btn>
      ) : null}
      {['draft','cancelled'].includes(c.status) && (
        <Btn size="sm" variant="danger" loading={actionLoading===c.id+'delete'} onClick={()=>handleAction(c.id,'delete')}>
          <Trash2 size={12}/>
        </Btn>
      )}
    </div>
  ]);

  return (
    <div>
      <PageHeader
        title="Campaigns"
        subtitle="Create aur manage karo apne SMS campaigns"
        action={
          <div style={{display:'flex',gap:8}}>
            <Btn variant="outline" size="sm" onClick={load}><RefreshCw size={14}/></Btn>
            <Btn onClick={openCreate}><Plus size={14}/>New Campaign</Btn>
          </div>
        }
      />

      {/* Filters */}
      <Card style={{marginBottom:16,padding:16}}>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <input placeholder="Search campaigns..." value={search} onChange={e=>setSearch(e.target.value)}
            style={{padding:'8px 12px',borderRadius:8,border:'1px solid #e2e8f0',fontSize:13,flex:1,minWidth:200,outline:'none'}}/>
          <select value={statusFilter} onChange={e=>setStatus(e.target.value)}
            style={{padding:'8px 12px',borderRadius:8,border:'1px solid #e2e8f0',fontSize:13,outline:'none'}}>
            <option value="">All Status</option>
            {['draft','scheduled','running','paused','completed','cancelled'].map(s=>(
              <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        {loading ? <Spinner/> : (
          <Table
            heads={['Name','Status','Contacts','Delivered','Failed','Cost','Created','Actions']}
            rows={rows}
            empty="Koi campaign nahi — pehli campaign banao!"
          />
        )}
      </Card>

      {/* Create Modal */}
      <Modal open={modal} onClose={()=>setModal(false)} title="New Campaign" width={560}>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <Input label="Campaign Name *" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Eid Sale 2024"/>

          <Select label="Use Template (optional)" value={form.template_id} onChange={e=>handleTemplateSelect(e.target.value)}>
            <option value="">— Select Template —</option>
            {templates.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>

          <Textarea label="Message Text *" value={form.message_text} rows={4}
            onChange={e=>setForm(p=>({...p,message_text:e.target.value}))}
            placeholder="Aapka message... {{first_name}} variables use kar sakte hain"/>
          <div style={{fontSize:11,color:'#94a3b8',marginTop:-12}}>
            {form.message_text.length}/160 chars • {Math.ceil((form.message_text.length||1)/160)} segment(s)
          </div>

          {/* Contact Lists */}
          {lists.length > 0 && (
            <div>
              <label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:8}}>Contact Lists</label>
              <div style={{display:'flex',flexDirection:'column',gap:6,maxHeight:150,overflowY:'auto',border:'1px solid #e2e8f0',borderRadius:8,padding:10}}>
                {lists.map(l=>(
                  <label key={l.id} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13}}>
                    <input type="checkbox" checked={form.list_ids.includes(l.id)} onChange={()=>toggleList(l.id)}/>
                    {l.name} <span style={{color:'#94a3b8',fontSize:11}}>({l.member_count} contacts)</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <Input label="Schedule (optional)" type="datetime-local" value={form.scheduled_at}
            onChange={e=>setForm(p=>({...p,scheduled_at:e.target.value}))}/>

          <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:8}}>
            <Btn variant="outline" onClick={()=>setModal(false)}>Cancel</Btn>
            <Btn loading={saving} onClick={handleSave}>Create Campaign</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
