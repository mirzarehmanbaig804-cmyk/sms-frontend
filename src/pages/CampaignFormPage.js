import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { campaignsAPI, templatesAPI, contactsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiSave, FiArrowLeft, FiMessageSquare } from 'react-icons/fi';

const CampaignFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ name:'', message_text:'', template_id:'', scheduled_at:'', list_ids:[] });
  const [templates, setTemplates] = useState([]);
  const [lists, setLists]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    Promise.all([templatesAPI.getAll({ limit:100 }), contactsAPI.getLists()])
      .then(([t, l]) => { setTemplates(t.data.data); setLists(l.data.data); })
      .catch(() => {});

    if (isEdit) {
      campaignsAPI.getOne(id).then(r => {
        const c = r.data.data;
        setForm({ name: c.name, message_text: c.message_text, template_id: c.template_id||'', scheduled_at: c.scheduled_at ? c.scheduled_at.slice(0,16) : '', list_ids: c.list_ids||[] });
        setCharCount(c.message_text?.length || 0);
      }).catch(() => toast.error('Campaign load nahi hui'));
    }
  }, [id, isEdit]);

  const handleTemplateSelect = (tid) => {
    const t = templates.find(t => t.id === tid);
    setForm(f => ({ ...f, template_id: tid, message_text: t ? t.body : f.message_text }));
    setCharCount(t?.body?.length || 0);
  };

  const handleListToggle = (lid) => {
    setForm(f => ({
      ...f,
      list_ids: f.list_ids.includes(lid) ? f.list_ids.filter(x => x !== lid) : [...f.list_ids, lid]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim())        return toast.error('Campaign name required hai');
    if (!form.message_text.trim()) return toast.error('Message text required hai');
    if (form.list_ids.length === 0) return toast.error('Kam se kam ek contact list select karo');

    setLoading(true);
    try {
      const payload = { ...form, template_id: form.template_id || null, scheduled_at: form.scheduled_at || null };
      if (isEdit) {
        await campaignsAPI.update(id, payload);
        toast.success('Campaign update ho gayi!');
      } else {
        await campaignsAPI.create(payload);
        toast.success('Campaign create ho gayi!');
      }
      navigate('/campaigns');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error hua');
    } finally {
      setLoading(false);
    }
  };

  const segments = Math.ceil(charCount / 160) || 1;

  return (
    <div style={{ maxWidth:680 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/campaigns')}><FiArrowLeft size={14}/></button>
        <h1 style={{ fontSize:22, fontWeight:700 }}>{isEdit ? 'Edit Campaign' : 'New Campaign'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="card" style={{ marginBottom:16 }}>
          <h2 style={{ fontSize:15, fontWeight:600, marginBottom:16 }}>Campaign Details</h2>

          <div className="form-group">
            <label>Campaign Name *</label>
            <input className="form-control" placeholder="e.g. July Sale Blast" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Template (Optional)</label>
            <select className="form-control" value={form.template_id} onChange={e => handleTemplateSelect(e.target.value)}>
              <option value="">-- Template select karein --</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <label>Message *</label>
              <span style={{ fontSize:12, color: charCount > 160 ? '#f59e0b' : '#94a3b8' }}>
                {charCount} chars · {segments} segment{segments>1?'s':''}
              </span>
            </div>
            <textarea className="form-control" rows={5} placeholder="Apna SMS message yahan likhein...&#10;Use {{first_name}} for personalization"
              value={form.message_text}
              onChange={e => { setForm({...form, message_text: e.target.value}); setCharCount(e.target.value.length); }}
              style={{ resize:'vertical' }}
            />
            <small style={{ color:'#94a3b8', fontSize:12 }}>
              Personalization: {'{{first_name}}'}, {'{{last_name}}'}, {'{{company}}'}
            </small>
          </div>

          <div className="form-group" style={{ marginBottom:0 }}>
            <label>Schedule (Optional)</label>
            <input className="form-control" type="datetime-local" value={form.scheduled_at} onChange={e => setForm({...form, scheduled_at: e.target.value})} />
            <small style={{ color:'#94a3b8', fontSize:12 }}>Khali choddo draft mein save karne ke liye</small>
          </div>
        </div>

        {/* Contact Lists */}
        <div className="card" style={{ marginBottom:16 }}>
          <h2 style={{ fontSize:15, fontWeight:600, marginBottom:12 }}>
            Contact Lists * <span style={{ color:'#94a3b8', fontWeight:400 }}>({form.list_ids.length} selected)</span>
          </h2>
          {lists.length === 0 ? (
            <p style={{ color:'#94a3b8', fontSize:14 }}>Koi list nahi — pehle Contacts mein list banao</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {lists.map(l => (
                <label key={l.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', border:`1px solid ${form.list_ids.includes(l.id)?'#6366f1':'#e2e8f0'}`, borderRadius:8, cursor:'pointer', background: form.list_ids.includes(l.id)?'#ede9fe':'#fff', transition:'all .15s' }}>
                  <input type="checkbox" checked={form.list_ids.includes(l.id)} onChange={() => handleListToggle(l.id)} />
                  <div>
                    <div style={{ fontWeight:500, fontSize:14 }}>{l.name}</div>
                    <div style={{ fontSize:12, color:'#94a3b8' }}>{l.member_count||0} contacts</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/campaigns')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner"/> : <><FiSave size={15}/> {isEdit ? 'Update' : 'Save Campaign'}</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CampaignFormPage;
