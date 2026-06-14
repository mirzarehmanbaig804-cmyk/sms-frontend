import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import { Card, PageHeader, Spinner } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1','#22c55e','#ef4444','#f59e0b','#3b82f6'];

export default function AnalyticsPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.dashboard()
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Analytics load nahi hua'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner/>;
  if (!data)   return <p style={{color:'#94a3b8'}}>Data nahi mila</p>;

  const { messages, daily_stats, top_campaigns } = data;

  const pieData = [
    { name:'Delivered', value: parseInt(messages.delivered) },
    { name:'Sent',      value: parseInt(messages.sent) },
    { name:'Failed',    value: parseInt(messages.failed) },
    { name:'Queued',    value: parseInt(messages.queued) },
  ].filter(d => d.value > 0);

  const barData = daily_stats.map(d => ({
    date     : new Date(d.date).toLocaleDateString('en',{month:'short',day:'numeric'}),
    Delivered: parseInt(d.delivered),
    Failed   : parseInt(d.failed),
  }));

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Detailed performance metrics"/>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        {/* Bar Chart */}
        <Card>
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:16}}>Daily Performance (7 Days)</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="date" tick={{fontSize:11}}/>
                <YAxis tick={{fontSize:11}}/>
                <Tooltip contentStyle={{borderRadius:8,fontSize:12}}/>
                <Legend/>
                <Bar dataKey="Delivered" fill="#6366f1" radius={[4,4,0,0]}/>
                <Bar dataKey="Failed"    fill="#ef4444" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{height:250,display:'flex',alignItems:'center',justifyContent:'center',color:'#94a3b8'}}>No data yet</div>}
        </Card>

        {/* Pie Chart */}
        <Card>
          <h3 style={{fontSize:14,fontWeight:700,marginBottom:16}}>Message Status Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>
                  {pieData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip contentStyle={{borderRadius:8,fontSize:12}}/>
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{height:250,display:'flex',alignItems:'center',justifyContent:'center',color:'#94a3b8'}}>No messages yet</div>}
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <h3 style={{fontSize:14,fontWeight:700,marginBottom:16}}>Overall Summary</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12}}>
          {[
            {label:'Total Sent',   value:parseInt(messages.total).toLocaleString(),   color:'#6366f1'},
            {label:'Delivered',    value:parseInt(messages.delivered).toLocaleString(), color:'#22c55e'},
            {label:'Failed',       value:parseInt(messages.failed).toLocaleString(),   color:'#ef4444'},
            {label:'Total Cost',   value:`$${parseFloat(messages.total_cost).toFixed(2)}`, color:'#06b6d4'},
            {label:'Delivery Rate',value: messages.total > 0 ? `${((messages.delivered/messages.total)*100).toFixed(1)}%` : '0%', color:'#8b5cf6'},
          ].map(({label,value,color})=>(
            <div key={label} style={{background:'#f8fafc',borderRadius:10,padding:16,textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:800,color}}>{value}</div>
              <div style={{fontSize:11,color:'#64748b',marginTop:4}}>{label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
