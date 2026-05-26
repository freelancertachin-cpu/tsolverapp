import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart2, 
  TrendingUp, 
  Target, 
  Clock, 
  AlertTriangle,
  Zap,
  Activity,
  ChevronRight
} from 'lucide-react';
import { storage, UserProfile } from '../lib/storage';
import { localEngine } from '../lib/localEngine';
import Plotly from 'plotly.js-dist-min';

export const QuizAnalytics: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const data = await localEngine.analyzeQuizPerformance(user.id);
      setAnalytics(data);
      setLoading(false);
      
      if (data && data.history.length > 0) {
        setTimeout(() => {
          renderCharts(data);
        }, 100);
      }
    };
    fetchAnalytics();
  }, [user.id]);

  const renderCharts = (data: any) => {
    // Progress Chart
    const progressTrace = {
      x: data.history.map((_: any, i: number) => i + 1),
      y: data.history.map((h: any) => h.accuracy),
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#ffffff', width: 3 },
      marker: { color: '#ffffff', size: 8 },
      fill: 'tozeroy',
      fillcolor: 'rgba(255,255,255,0.05)',
      name: 'Accuracy'
    };

    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: 'rgba(255,255,255,0.4)', family: 'Inter', size: 10 },
      margin: { t: 20, r: 20, b: 40, l: 40 },
      xaxis: { showgrid: false, zeroline: false },
      yaxis: { gridcolor: 'rgba(255,255,255,0.05)', showgrid: true, zeroline: false },
      showlegend: false
    };

    Plotly.newPlot('progress-chart', [progressTrace as any], layout as any, { responsive: true, displayModeBar: false });

    // Heatmap Chart
    if (data.heatmap) {
       const dates = Object.keys(data.heatmap);
       const counts = Object.values(data.heatmap);
       const heatmapTrace = {
          x: dates,
          y: counts,
          type: 'bar',
          marker: { color: 'rgba(255,255,255,0.4)', line: { width: 0 } },
          name: 'Activity'
       };
       Plotly.newPlot('heatmap-chart', [heatmapTrace as any], { ...layout, margin: { t: 5, r: 5, b: 20, l: 30 } } as any, { responsive: true, displayModeBar: false });
    }
  };

  if (loading) return null;

  if (!analytics) {
    return (
      <div className="cyber-panel p-12 text-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-white/5 border border-white/10 mx-auto flex items-center justify-center">
           <Activity className="h-8 w-8 text-white/20" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold">No Data Available</h3>
          <p className="text-white/40 text-sm">Complete your first quiz to see detailed analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-10">
      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard 
          icon={<Target className="text-white" />} 
          label="Overall Accuracy" 
          value={`${analytics.overallAccuracy.toFixed(1)}%`}
          subValue="Across all subjects"
        />
        <AnalyticsCard 
          icon={<TrendingUp className="text-white" />} 
          label="Total Quizzes" 
          value={analytics.totalAttempts}
          subValue="Completed attempts"
        />
        <AnalyticsCard 
          icon={<Zap className="text-white" />} 
          label="Strongest Topic" 
          value={analytics.strongSubjects[0] || 'N/A'}
          subValue="Highest accuracy"
        />
        <AnalyticsCard 
          icon={<AlertTriangle className="text-white" />} 
          label="Weakest Topic" 
          value={analytics.weakSubjects[0] || 'N/A'}
          subValue="Needs improvement"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 cyber-panel p-8 space-y-6">
           <div className="flex items-center justify-between">
              <div className="space-y-1">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Performance Trend</h3>
                 <p className="text-xl font-black italic uppercase">Accuracy Over Time</p>
              </div>
              <BarChart2 className="h-5 w-5 text-white/40" />
           </div>
           <div id="progress-chart" className="h-[300px] w-full" />
        </div>

        <div className="cyber-panel p-8 space-y-6">
           <div className="space-y-1">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Study Heatmap</h3>
              <p className="text-xl font-black italic uppercase">Daily Activity</p>
           </div>
           <div id="heatmap-chart" className="h-[120px] w-full" />
           <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[10px] font-bold text-white/40 uppercase leading-relaxed text-center">
                 Consistency is key. You are active on <span className="text-white">4 out of 7</span> days this week.
              </p>
           </div>
        </div>

        <div className="cyber-panel p-8 space-y-8">
           <div className="space-y-1">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Smart Insights</h3>
              <p className="text-xl font-black italic uppercase">Revision Plan</p>
           </div>
           
           <div className="space-y-4">
              <InsightItem 
                title={`Revise ${analytics.weakSubjects[0] || 'Basics'}`} 
                desc="Your score in this area is 15% below average."
                type="warning"
              />
              <InsightItem 
                title="Improve Answer Speed" 
                desc={`You are 20% slower on ${analytics.slowSubjects[0] || 'Mathematics'}.`}
                type="info"
              />
              <InsightItem 
                title="Consistency Peak" 
                desc="You've completed 3 quizzes today. Keep it up!"
                type="success"
              />
           </div>

           <button className="w-full h-14 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-between px-6 transition-all group">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/60 group-hover:text-white">Generate Full Report</span>
              <ChevronRight size={16} className="text-white/20 group-hover:text-white" />
           </button>
        </div>
      </div>
    </div>
  );
};

function AnalyticsCard({ icon, label, value, subValue }: any) {
  return (
    <div className="cyber-panel p-6 space-y-4 hover:border-white/20 transition-all group">
      <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{label}</p>
        <p className="text-3xl font-black tracking-tighter italic">{value}</p>
        <p className="text-[10px] font-bold text-white/10">{subValue}</p>
      </div>
    </div>
  );
}

function InsightItem({ title, desc, type }: any) {
  const colors = {
    warning: "border-white/10 text-white/80",
    info: "border-white/10 text-white/80",
    success: "border-white/20 text-white"
  };

  return (
    <div className={`p-5 rounded-2xl border bg-white/[0.02] space-y-2 ${colors[type as keyof typeof colors]}`}>
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${type === 'warning' ? 'bg-white/40' : type === 'info' ? 'bg-white/20' : 'bg-white'}`} />
        <p className="text-xs font-black uppercase tracking-widest">{title}</p>
      </div>
      <p className="text-[10px] font-bold opacity-40 leading-relaxed">{desc}</p>
    </div>
  );
}
