import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Server, 
  Library, 
  Activity, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  History,
  Zap
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Legend
} from 'recharts';
import { MOCK_STATS, MOCK_LEDGER, MOCK_DISTRIBUTION } from '../data';
import { StatCard } from '../components/Cards';

const COLORS = ['#A78BFA', '#F472B6', '#60A5FA', '#34D399', '#FBBF24'];

export default function Statistics() {
  return (
    <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto space-y-12">
      <header className="space-y-4">
        <h1 className="text-5xl font-black uppercase tracking-tighter">Bot Statistics</h1>
        <p className="text-text-secondary font-bold uppercase tracking-widest">Real-time insights into the Nazuna ecosystem</p>
      </header>

      {/* Global Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={<Users />} label="Total Users" value={MOCK_STATS.totalUsers.toLocaleString()} color="bg-accent-purple" />
        <StatCard icon={<Server />} label="Total Servers" value={MOCK_STATS.totalServers.toLocaleString()} color="bg-accent-pink" />
        <StatCard icon={<Library />} label="Total Characters" value={MOCK_STATS.totalCharacters.toLocaleString()} color="bg-accent-blue" />
        <StatCard icon={<Zap />} label="Total Spins" value={MOCK_STATS.totalSpins.toLocaleString()} color="bg-accent-yellow" />
        <StatCard icon={<Activity />} label="Characters Obtained" value={MOCK_STATS.totalObtained.toLocaleString()} color="bg-accent-cyan" />
        <StatCard icon={<TrendingUp />} label="Total Works" value={MOCK_STATS.totalWorks.toLocaleString()} color="bg-accent-purple" />
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Distribution Charts */}
        <div className="space-y-8">
          <div className="neobrutal-card p-6 space-y-6">
            <div className="flex items-center gap-2">
              <PieChartIcon className="text-accent-purple" size={24} />
              <h2 className="text-2xl font-black uppercase tracking-tighter">Gender Distribution</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_DISTRIBUTION.gender}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="#000"
                    strokeWidth={2}
                  >
                    {MOCK_DISTRIBUTION.gender.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#151619', border: '2px solid #000', borderRadius: '0' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="neobrutal-card p-6 space-y-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-accent-pink" size={24} />
              <h2 className="text-2xl font-black uppercase tracking-tighter">Role Distribution</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_DISTRIBUTION.role}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.1)'}}
                    contentStyle={{ backgroundColor: '#151619', border: '2px solid #000', borderRadius: '0' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" fill="#F472B6" stroke="#000" strokeWidth={2} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity Ledger */}
        <div className="neobrutal-card p-6 space-y-6">
          <div className="flex items-center gap-2">
            <History className="text-accent-blue" size={24} />
            <h2 className="text-2xl font-black uppercase tracking-tighter">Global Ledger</h2>
          </div>
          <div className="space-y-4">
            {MOCK_LEDGER.map((log, index) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-l-4 border-accent-purple pl-4 py-2 bg-bg-secondary/50 border-2 border-black shadow-[4px_4px_0px_0px_#000]"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-bold text-sm">
                      <span className="text-accent-purple">@{log.username}</span>
                      {' '}performed{' '}
                      <span className="uppercase text-[10px] font-black tracking-tighter bg-black text-white px-1">
                        {log.action.replace('_', ' ')}
                      </span>
                    </p>
                    <p className="text-xs font-medium text-text-secondary">
                      Character: <span className="text-white">{log.character}</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter text-text-secondary">
                    {log.time}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          <button className="w-full py-3 border-2 border-black font-black uppercase tracking-tighter hover:bg-accent-purple hover:text-black transition-all">
            VIEW FULL LEDGER
          </button>
        </div>
      </div>
    </main>
  );
}
