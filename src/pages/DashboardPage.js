import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import { Card, StatCard, Spinner, PageHeader } from '../components/UI';
import { Users, Megaphone, MessageSquare, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.dashboard()
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Dashboard data load nahi hua'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data)   return <p style={{color:'#94a3b8'}}>Data nahi mila</p>;

  const { messages, campaigns, contacts, daily_stats, top_campaigns } = data;
  const deliveryRate = messages.total > 0
    ? ((messages.delivered / messages.total) * 100).toFixed(1)
    : 0;

  const chartData = daily_stats.map(d => ({
    date     : new Date(d.date).toLocaleDateString('en',{month:'short',day:'numeric'}),
    Delivered: parseInt(d.delivered),
    Failed   : parseInt(d.failed),
    Total    : parseInt(d.total),
  }));

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your SMS marketing activity" />

      {/* Stat Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:24}}>
        <StatCard label="Total Messages"  value={parseInt(messages.total).toLocaleString()} icon={MessageSquare} color="#6366f1"/>
        <StatCard label="Delivered"       value={parseInt(messages.delivered).toLocaleString()} icon={CheckCircle} color="#22c55e"/>
        <StatCard label="Delivery Rate"   value={`${deliveryRate}%`} icon={TrendingUp} color="#3b82f6"/>
        <StatCard label="Total Contacts"  value={parseInt(contacts.total).toLocaleString()} icon={Users} color="#f59e0b"/>
        <StatCard label="Campaigns"       value={parseInt(campaigns.total).toLocaleString()} icon={Megaphone} color="#8b5cf6"/>
        <StatCard label="Total Cost"      value={`$${parseFloat(messages.total_cost).toFixed(2)}`} icon={DollarSign} color="#06b6d4"/>
      </div>

      {/* Charts */}
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:24}}>
        <Card>
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:16,color:'#0f172a'}}>Messages — Last 7 Days</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="date" tick={{fontSize:11}} />
                <YAxis tick={{fontSize:11}} />
                <Tooltip contentStyle={{borderRadius:8,fontSize:12}}/>
                <Area type="monotone" dataKey="Delivered" stroke="#6366f1" fill="url(#gD)" strokeWidth={2}/>
                <Area type="monotone" dataKey="Failed"    stroke="#ef4444" fill="none" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{height:220,display:'flex',alignItems:'center',justifyContent:'center',color:'#94a3b8'}}>
              Abhi koi data nahi — campaign launch karo!
            </div>
          )}
        </Card>

        {/* Quick Stats */}
        <Card>
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:16}}>Campaign Status</h3>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {[
              {label:'Running',   val:campaigns.running,   color:'#8b5cf6'},
              {label:'Completed', val:campaigns.completed, color:'#22c55e'},
              {label:'Draft',     val:campaigns.draft,     color:'#94a3b8'},
            ].map(({label,val,color}) => (
              <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',background:'#f8fafc',borderRadius:8}}>
                <span style={{fontSize:13,color:'#374151'}}>{label}</span>
                <span style={{fontWeight:700,color,fontSize:18}}>{val || 0}</span>
              </div>
            ))}
            <div style={{padding:'10px 12px',background:'#fef9c3',borderRadius:8,display:'flex',justifyContent:'space-between'}}>
              <span style={{fontSize:13,color:'#92400e'}}>Opted Out</span>
              <span style={{fontWeight:700,color:'#b45309'}}>{contacts.opted_out || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Campaigns */}
      {top_campaigns?.length > 0 && (
        <Card>
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:16}}>Top Campaigns</h3>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead>
                <tr style={{borderBottom:'2px solid #f1f5f9'}}>
                  {['Campaign','Status','Delivered','Sent','Failed','Cost'].map(h => (
                    <th key={h} style={{padding:'8px 12px',textAlign:'left',fontWeight:600,color:'#64748b',fontSize:11,textTransform:'uppercase'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {top_campaigns.map(c => (
                  <tr key={c.id} style={{borderBottom:'1px solid #f8fafc'}}>
                    <td style={{padding:'10px 12px',fontWeight:500}}>{c.name}</td>
                    <td style={{padding:'10px 12px'}}>
                      <span style={{background:'#ede9fe',color:'#5b21b6',padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:600,textTransform:'capitalize'}}>{c.status}</span>
                    </td>
                    <td style={{padding:'10px 12px',color:'#22c55e',fontWeight:600}}>{c.delivered_count}</td>
                    <td style={{padding:'10px 12px'}}>{c.sent_count}</td>
                    <td style={{padding:'10px 12px',color:'#ef4444'}}>{c.failed_count}</td>
                    <td style={{padding:'10px 12px',color:'#64748b'}}>${parseFloat(c.cost||0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
