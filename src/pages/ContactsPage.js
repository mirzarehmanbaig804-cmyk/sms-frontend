import React, { useEffect, useState, useCallback, useRef } from 'react';
import { contactsAPI } from '../services/api';
import { Card, Btn, Badge, Table, Modal, Input, PageHeader, Spinner } from '../components/UI';
import { Plus, Upload, RefreshCw, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { phone:'', first_name:'', last_name:'', email:'', company:'' };

export default function ContactsPage() {
  const [contacts, setContacts]   = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [importModal, setImport]  = useState(false);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [csvText, setCsvText]     = useState('');
  const fileRef = useRef();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await contactsAPI.getAll({ search, page, limit:50 });
      setContacts(r.data.data);
      setPagination(r.data.pagination);
    } catch { toast.error('Contacts load nahi hue'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.phone) return toast.error('Phone required hai');
    setSaving(true);
    try {
      await contactsAPI.create(form);
      toast.success('Contact add ho gaya!');
      setModal(false); setForm(EMPTY); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleOptOut = async (id) => {
    try {
      await contactsAPI.optOut(id);
      toast.success('Contact opted out!');
      load();
    } catch { toast.error('Error'); }
  };

  const handleCSVImport = async () => {
    setSaving(true);
    try {
      const lines = csvText.trim().split('\n').filter(Boolean);
      const contacts = lines.map(line => {
        const [phone, first_name, last_name, email, company] = line.split(',').map(s=>s.trim().replace(/^"|"$/g,''));
        return { phone, first_name, last_name, email, company };
      }).filter(c => c.phone);

      if (!contacts.length) return toast.error('Valid contacts nahi mile CSV mein');
      const r = await contactsAPI.import({ contacts });
      toast.success(r.data.message);
      setImport(false); setCsvText(''); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Import failed'); }
    finally { setSaving(false); }
  };

  const handleFileRead = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText(ev.target.result);
    reader.readAsText(file);
  };

  const rows = contacts.map(c => [
    <div>
      <div style={{fontWeight:600}}>{c.first_name} {c.last_name}</div>
      <div style={{fontSize:11,color:'#94a3b8'}}>{c.email}</div>
    </div>,
    c.phone,
    c.company || '—',
    c.is_opted_out ? <Badge status="failed"/> : <Badge status="delivered"/>,
    new Date(c.created_at).toLocaleDateString(),
    !c.is_opted_out && (
      <Btn size="sm" variant="danger" onClick={()=>handleOptOut(c.id)}>
        <UserX size={12}/>Opt Out
      </Btn>
    )
  ]);

  return (
    <div>
      <PageHeader
        title="Contacts"
        subtitle={`${pagination.total || 0} total contacts`}
        action={
          <div style={{display:'flex',gap:8}}>
            <Btn variant="outline" size="sm" onClick={load}><RefreshCw size={14}/></Btn>
            <Btn variant="ghost" onClick={()=>setImport(true)}><Upload size={14}/>Import CSV</Btn>
            <Btn onClick={()=>{setForm(EMPTY);setModal(true)}}><Plus size={14}/>Add Contact</Btn>
          </div>
        }
      />

      <Card style={{marginBottom:16,padding:16}}>
        <input placeholder="Search by name, phone, email..."
          value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}
          style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'1px solid #e2e8f0',fontSize:13,outline:'none'}}/>
      </Card>

      <Card>
        {loading ? <Spinner/> : (
          <>
            <Table
              heads={['Name','Phone','Company','Status','Added','Action']}
              rows={rows}
              empty="Koi contact nahi — add karo ya CSV import karo"
            />
            {pagination.pages > 1 && (
              <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:16}}>
                {Array.from({length:pagination.pages},(_,i)=>i+1).map(p=>(
                  <button key={p} onClick={()=>setPage(p)}
                    style={{padding:'6px 12px',borderRadius:6,border:'1px solid #e2e8f0',background:p===page?'#6366f1':'#fff',color:p===page?'#fff':'#374151',cursor:'pointer',fontSize:13}}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </Card>

      {/* Add Contact Modal */}
      <Modal open={modal} onClose={()=>setModal(false)} title="Add Contact">
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Input label="Phone Number *" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="+923001234567"/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Input label="First Name" value={form.first_name} onChange={e=>setForm(p=>({...p,first_name:e.target.value}))}/>
            <Input label="Last Name"  value={form.last_name}  onChange={e=>setForm(p=>({...p,last_name:e.target.value}))}/>
          </div>
          <Input label="Email" type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/>
          <Input label="Company" value={form.company} onChange={e=>setForm(p=>({...p,company:e.target.value}))}/>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <Btn variant="outline" onClick={()=>setModal(false)}>Cancel</Btn>
            <Btn loading={saving} onClick={handleSave}>Add Contact</Btn>
          </div>
        </div>
      </Modal>

      {/* CSV Import Modal */}
      <Modal open={importModal} onClose={()=>setImport(false)} title="Import Contacts (CSV)" width={560}>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{background:'#f8fafc',border:'1px dashed #e2e8f0',borderRadius:10,padding:16,fontSize:12,color:'#64748b'}}>
            <strong>Format:</strong> phone, first_name, last_name, email, company<br/>
            <code style={{fontSize:11}}>+923001234567, Ali, Khan, ali@email.com, ABC Corp</code>
          </div>
          <input type="file" accept=".csv,.txt" ref={fileRef} onChange={handleFileRead} style={{display:'none'}}/>
          <Btn variant="outline" onClick={()=>fileRef.current.click()}><Upload size={14}/>Choose CSV File</Btn>
          <textarea value={csvText} onChange={e=>setCsvText(e.target.value)} rows={8}
            placeholder="Ya yahan paste karo CSV data..."
            style={{padding:'10px 12px',borderRadius:8,border:'1px solid #e2e8f0',fontSize:12,fontFamily:'monospace',resize:'vertical',outline:'none'}}/>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <Btn variant="outline" onClick={()=>setImport(false)}>Cancel</Btn>
            <Btn loading={saving} onClick={handleCSVImport}><Upload size={14}/>Import</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
