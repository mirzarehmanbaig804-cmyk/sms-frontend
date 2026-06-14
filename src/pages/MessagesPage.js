import React, { useEffect, useState, useCallback } from 'react';
import { messagesAPI } from '../services/api';
import { Card, Badge, Table, PageHeader, Spinner, StatCard } from '../components/UI';
import { MessageSquare, CheckCircle, XCircle, Clock, DollarSign, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [stats, setStats]       = useState(null);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('');
  const [page, setPage]         = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit:50 };
      if (search) params.search = search;
      if (status) params.status = status;
      const [m, s] = await Promise.all([messagesAPI.getAll(params), messagesAPI.getStats()]);
      setMessages(m.data.data);
      setPagination(m.data.pagination);
      setStats(s.data.data);
    } catch { toast.error('Messages load nahi hue'); }
    finally { setLoading(false); }
  }, [search, status, page]);

  useEffect(() => { load(); }, [load]);

  const rows = messages.map(m => [
    m.to_number,
    <div style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:12}}>{m.message_text}</div>,
    <Badge status={m.status}/>,
    m.campaign_name || '—',
    m.direction === 'inbound'
      ? <span style={{fontSize:11,color:'#3b82f6',fontWeight:600}}>↙ Inbound</span>
      : <span style={{fontSize:11,color:'#6366f1',fontWeight:600}}>↗ Outbound</span>,
    m.cost ? `$${parseFloat(m.cost).toFixed(4)}` : '—',
    new Date(m.created_at).toLocaleString(),
  ]);

  return (
    <div>
      <PageHeader
        title="Messages"
        subtitle="All sent and received SMS messages"
        action={
          <button onClick={load} style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:8,padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:13}}>
            <RefreshCw size={14}/>Refresh
          </button>
        }
      />

      {/* Stats */}
      {stats && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:20}}>
          <StatCard label="Total"     value={parseInt(stats.total).toLocaleString()}     icon={MessageSquare} color="#6366f1"/>
          <StatCard label="Delivered" value={parseInt(stats.delivered).toLocaleString()} icon={CheckCircle}   color="#22c55e"/>
          <StatCard label="Failed"    value={parseInt(stats.failed).toLocaleString()}    icon={XCircle}       color="#ef4444"/>
          <StatCard label="Queued"    value={parseInt(stats.queued).toLocaleString()}    icon={Clock}         color="#f59e0b"/>
          <StatCard label="Cost"      value={`$${parseFloat(stats.total_cost).toFixed(2)}`} icon={DollarSign} color="#06b6d4"/>
        </div>
      )}

      {/* Filters */}
      <Card style={{marginBottom:16,padding:16}}>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <input placeholder="Search phone ya message..." value={search}
            onChange={e=>{setSearch(e.target.value);setPage(1)}}
            style={{flex:1,minWidth:200,padding:'8px 12px',borderRadius:8,border:'1px solid #e2e8f0',fontSize:13,outline:'none'}}/>
          <select value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}}
            style={{padding:'8px 12px',borderRadius:8,border:'1px solid #e2e8f0',fontSize:13,outline:'none'}}>
            <option value="">All Status</option>
            {['queued','sent','delivered','failed','undelivered'].map(s=>(
              <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        {loading ? <Spinner/> : (
          <>
            <Table
              heads={['To','Message','Status','Campaign','Direction','Cost','Time']}
              rows={rows}
              empty="Koi message nahi mila"
            />
            {pagination.pages > 1 && (
              <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:16}}>
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                  style={{padding:'6px 12px',borderRadius:6,border:'1px solid #e2e8f0',background:'#fff',cursor:page===1?'not-allowed':'pointer',fontSize:13}}>← Prev</button>
                <span style={{padding:'6px 12px',fontSize:13,color:'#64748b'}}>Page {page} of {pagination.pages}</span>
                <button onClick={()=>setPage(p=>Math.min(pagination.pages,p+1))} disabled={page===pagination.pages}
                  style={{padding:'6px 12px',borderRadius:6,border:'1px solid #e2e8f0',background:'#fff',cursor:page===pagination.pages?'not-allowed':'pointer',fontSize:13}}>Next →</button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
