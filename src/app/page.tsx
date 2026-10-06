'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { Briefcase, DollarSign, Cpu, AlertTriangle, Loader2, Globe } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error('ไม่สามารถเชื่อมต่อ API ได้');
        const json = await res.json();
        if (json.error) throw new Error(json.details || json.error);
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-3" />
        <span className="text-lg font-medium">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-slate-950 text-red-400 p-6 text-center">
        <AlertTriangle className="h-12 w-12 mb-3 text-red-500" />
        <p className="text-xl font-semibold">เกิดข้อผิดพลาดในการดึงข้อมูล</p>
        <p className="text-sm text-slate-400 mt-2 max-w-md">{error}</p>
      </div>
    );
  }

  const summary = data.summary || {};
  const totalJobs = Number(summary.totalJobs || 0);
  const avgSalary = Number(summary.avgSalary || 0);
  const avgAutomation = Number(summary.avgAutomationRisk || 0);
  const avgRemote = Number(summary.avgRemoteWork || 0);

  // กรองข้อมูลไม่ให้ติดคำว่า 'Job Title' มาแสดงในกราฟหรือตาราง
  const topJobsList = (data.topRiskJobs || []).filter(
    (item: any) => (item['Job Title'] || item.Job_Title) !== 'Job Title'
  );
  
  const impactStatsList = (data.impactStats || []).filter(
    (item: any) => item.category !== 'AI Impact Level'
  );

  const recentJobsList = (data.recentJobs || []).filter(
    (item: any) => (item['Job Title'] || item.Job_Title) !== 'Job Title'
  );

  // Bar Chart Data
  const barChartData = {
    labels: topJobsList.map((item: any) => item['Job Title'] || item.Job_Title || 'ไม่ระบุ'),
    datasets: [
      {
        label: 'ความเสี่ยงโดน AI แทนที่ (%)',
        data: topJobsList.map((item: any) => 
          Number(item['Automation Risk (%)'] ?? item.avg_automation ?? 0)
        ),
        backgroundColor: 'rgba(239, 68, 68, 0.75)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  // Pie Chart Data
  const pieChartData = {
    labels: impactStatsList.map((item: any) => `ระดับ ${item.category || 'ไม่ระบุ'}`),
    datasets: [
      {
        data: impactStatsList.map((item: any) => item.count),
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'],
        borderWidth: 2,
        borderColor: '#0f172a',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Cpu className="text-blue-500 h-8 w-8" />
              รายงานวิเคราะห์ AI Job Trends Dashboard
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              ผลกระทบของระบบปัญญาประดิษฐ์ (AI) และระบบอัตโนมัติ ต่อตำแหน่งงานและฐานเงินเดือน
            </p>
          </div>
        </header>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
              <Briefcase className="h-7 w-7" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">จำนวนตัวอย่างอาชีพ</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {totalJobs.toLocaleString()} <span className="text-xs font-normal text-slate-400">รายการ</span>
              </h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <DollarSign className="h-7 w-7" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">เงินเดือนเฉลี่ย (USD)</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                ${avgSalary.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">ความเสี่ยงโดน AI แทนที่เฉลี่ย</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {avgAutomation.toFixed(1)}%
              </h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
              <Globe className="h-7 w-7" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">สัดส่วนการทำงาน Remote</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {avgRemote.toFixed(1)}%
              </h3>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">10 อาชีพที่มีความเสี่ยงโดน AI แทนที่สูงสุด (%)</h2>
            <div className="h-80 relative">
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { labels: { color: '#cbd5e1' } } },
                  scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { 
                      min: 0,
                      max: 100,
                      ticks: { 
                        color: '#94a3b8',
                        callback: (value) => `${value}%`
                      }, 
                      grid: { color: 'rgba(255,255,255,0.05)' } 
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">สัดส่วนระดับผลกระทบ (AI Impact Level)</h2>
            <div className="h-80 relative flex items-center justify-center">
              <Pie
                data={pieChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { 
                      position: 'bottom', 
                      labels: { color: '#cbd5e1', font: { size: 11 } } 
                    } 
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">รายการอาชีพตัวอย่างในฐานข้อมูล</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">ชื่ออาชีพ</th>
                  <th className="py-3 px-4">ระดับการศึกษา</th>
                  <th className="py-3 px-4">เงินเดือนเฉลี่ย ($)</th>
                  <th className="py-3 px-4">ความเสี่ยง (%)</th>
                  <th className="py-3 px-4 rounded-r-lg">ระดับผลกระทบ AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentJobsList.map((job: any, index: number) => {
                  const jobTitle = job['Job Title'] || job.Job_Title || 'ไม่ระบุ';
                  const education = job['Required Education'] || job.Education_Level || 'N/A';
                  const salary = Number(job['Median Salary (USD)'] || job.avg_salary || 0);
                  const riskPercent = Number(job['Automation Risk (%)'] || job.avg_automation || 0);
                  const impactLevel = job['AI Impact Level'] || job.category || 'Moderate';

                  return (
                    <tr key={index} className="hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-semibold text-white">{jobTitle}</td>
                      <td className="py-3.5 px-4 text-slate-300">{education}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400">
                        ${salary.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-amber-400">
                        {riskPercent.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                            impactLevel === 'High'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : impactLevel === 'Moderate'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {impactLevel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}