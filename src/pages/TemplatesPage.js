import React, { useEffect, useState, useCallback } from 'react';
import { templatesAPI } from '../services/api';
import { Card, Btn, Table, Modal, Input, Select, Textarea, PageHeader, Spinner } from '../components/UI';
import { Plus, Trash2, Eye, RefreshCw, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { name:'', body:'', category:'general' };
const CATS  = ['general','promotional','transactional','otp','reminder','greeting'];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [previewModal, setPreview]= useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await templatesAPI.getAll();
      setTemplates(r.data.data);
    } catch { toast.error('Templates load nahi hue'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit   = (t)  => { setForm({name:t.name,body:t.body,category:t.category}); setEditId(t.id); setModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.body) return toast.error('Name aur body required hain');
    setSaving(true);
    try {
      if (editId) await templatesAPI.update(editId, form);
      else        await templatesAPI.create(form);
      toast.success(editId ? 'Template update ho gaya!' : 'Template create ho gaya!');
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Template delete karein?')) return;
    try { await templatesAPI.delete(id); toast.success('Deleted!'); load(); }
    catch { toast.error('Delete nahi hua'); }
  };

  // Extract variables from body
  const vars = [...new Set((form.body.match(/\{\{(\w+)\}\}/g)||[]).map(v=>v.replace(/[{}]/g,'')))];

  const rows = templates.map(t => [
    <div>
      <div style={{fontWeight:600,color:'#0f172a'}}>{t.name}</div>
      <div style={{fontSize:11,color:'#94a3b8',marginTop:2}}>
        {t.variables?.length > 0 && t.variables.map(v=>(
          <span key={v} style={{background:'#ede9fe',color:'#5b21b6',padding:'1px 6px',borderRadius:10,fontSize:10,marginRight:4}}>{`{{${v}}}`}</span>
        ))}
      </div>
    </div>,
    <span style={{background:'#dbeafe',color:'#1e40af',padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:600}}>{t.category}</span>,
    <div style={{maxWidth:280,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:12,color:'#64748b'}}>{t.body}</div>,
    new Date(t.created_at).toLocaleDateString(),
    <div style={{display:'flex',gap:6}}>
      <Btn size="sm" variant="outline" onClick={()=>setPreview(t)}><Eye size={12}/>Preview</Btn>
      <Btn size="sm" variant="ghost"   onClick={()=>openEdit(t)}><Edit2 size={12}/></Btn>
      <Btn size="sm" variant="danger"  onClick={()=>handleDelete(t.id)}><Trash2 size={12}/></Btn>
    </div>
  ]);

  return (
    <div>
      <PageHeader
        title="Templates"
        subtitle="Reusable message templates with {{variable}} support"
        action={
          <div style={{display:'flex',gap:8}}>
            <Btn variant="outline" size="sm" onClick={load}><RefreshCw size={14}/></Btn>
            <Btn onClick={openCreate}><Plus size={14}/>New Template</Btn>
          </div>
        }
      />

      <Card>
        {loading ? <Spinner/> : (
          <Table
            heads={['Name','Category','Preview','Created','Actions']}
            rows={rows}
            empty="Koi template nahi — create karo!"
          />
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal open={modal} onClose={()=>setModal(false)} title={editId ? 'Edit Template' : 'New Template'} width={540}>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Input label="Template Name *" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Welcome Message"/>
          <Select label="Category" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
            {CATS.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
          </Select>
          <Textarea label="Message Body *" value={form.body} rows={5}
            onChange={e=>setForm(p=>({...p,body:e.target.value}))}
            placeholder="Hello {{first_name}}, welcome to our service!"/>
          <div style={{fontSize:11,color:'#64748b'}}>{form.body.length}/160 chars</div>

          {vars.length > 0 && (
            <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:8,padding:10}}>
              <div style={{fontSize:11,fontWeight:600,color:'#166534',marginBottom:4}}>Variables detected:</div>
              <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                {vars.map(v=><span key={v} style={{background:'#dcfce7',color:'#166534',padding:'2px 8px',borderRadius:10,fontSize:11}}>{`{{${v}}}`}</span>)}
              </div>
            </div>
          )}

          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <Btn variant="outline" onClick={()=>setModal(false)}>Cancel</Btn>
            <Btn loading={saving} onClick={handleSave}>{editId?'Update':'Create'} Template</Btn>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal open={!!previewModal} onClose={()=>setPreview(null)} title={`Preview: ${previewModal?.name}`}>
        {previewModal && (
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div style={{background:'#1e1b4b',borderRadius:12,padding:20,color:'#fff',fontFamily:'monospace',fontSize:13,lineHeight:1.6}}>
              {previewModal.body}
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <span style={{fontSize:12,color:'#64748b'}}>Category:</span>
              <span style={{background:'#dbeafe',color:'#1e40af',padding:'1px 8px',borderRadius:10,fontSize:11}}>{previewModal.category}</span>
            </div>
            {previewModal.variables?.length > 0 && (
              <div>
                <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Variables:</div>
                <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                  {previewModal.variables.map(v=>(
                    <span key={v} style={{background:'#ede9fe',color:'#5b21b6',padding:'2px 8px',borderRadius:10,fontSize:11}}>{`{{${v}}}`}</span>
                  ))}
                </div>
              </div>
            )}
            <Btn variant="outline" onClick={()=>setPreview(null)}>Close</Btn>
          </div>
        )}
      </Modal>
    </div>
  );
}
