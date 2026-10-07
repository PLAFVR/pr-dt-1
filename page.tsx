'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Briefcase, DollarSign, Cpu, AlertTriangle, Loader2, Globe, TrendingUp, Award } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardData {
  summary: {
    totalJobs?: number | string;
    avgSalary?: number | string;
    avgAutomationRisk?: number | string;
    avgRemoteWork?: number | string;
  };
  topRiskJobs: Array<{ jobTitle: string; automationRisk: number; salary: number }>;
  impactStats: Array<{ category: string; count: number }>;
  industrySalaries: Array<{ industry: string; avgSalary: number }>;
  jobGrowthByIndustry: Array<{ industry: string; openings2024: number; openings2030: number }>;
  riskByExperience: Array<{ expYears: number; avgRisk: number; avgSalary: number }>;
  recentJobs: Array<{
    jobTitle: string;
    education: string;
    salary: number;
    automationRisk: number;
    impactLevel: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
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
        setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
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

  const totalJobs = Number(data.summary?.totalJobs || 0);
  const avgSalary = Number(data.summary?.avgSalary || 0);
  const avgAutomation = Number(data.summary?.avgAutomationRisk || 0);
  const avgRemote = Number(data.summary?.avgRemoteWork || 0);

  // 1. Chart Data: Top 10 Risk Jobs (Vertical Bar)
  const topRiskBarData = {
    labels: (data.topRiskJobs || []).map((item) => item.jobTitle),
    datasets: [
      {
        label: 'ความเสี่ยงโดน AI แทนที่ (%)',
        data: (data.topRiskJobs || []).map((item) => Number(item.automationRisk || 0)),
        backgroundColor: 'rgba(239, 68, 68, 0.75)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  // 2. Chart Data: Impact Level Distribution (Doughnut)
  const impactDoughnutData = {
    labels: (data.impactStats || []).map((item) => `ระดับ ${item.category}`),
    datasets: [
      {
        data: (data.impactStats || []).map((item) => item.count),
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'],
        borderWidth: 2,
        borderColor: '#0f172a',
      },
    ],
  };

  // 3. Chart Data: Avg Salary by Industry (Horizontal Bar)
  const industrySalaryData = {
    labels: (data.industrySalaries || []).map((item) => item.industry),
    datasets: [
      {
        label: 'เงินเดือนเฉลี่ย ($)',
        data: (data.industrySalaries || []).map((item) => Number(item.avgSalary || 0)),
        backgroundColor: 'rgba(16, 185, 129, 0.75)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  // 4. Chart Data: Job Openings Growth 2024 vs 2030 (Grouped Bar)
  const growthChartData = {
    labels: (data.jobGrowthByIndustry || []).map((item) => item.industry),
    datasets: [
      {
        label: 'ตำแหน่งงาน ปี 2024',
        data: (data.jobGrowthByIndustry || []).map((item) => Number(item.openings2024 || 0)),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 4,
      },
      {
        label: 'ประมาณการ ปี 2030',
        data: (data.jobGrowthByIndustry || []).map((item) => Number(item.openings2030 || 0)),
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  // 5. Chart Data: AI Risk vs Experience Years (Line Chart)
  const experienceRiskData = {
    labels: (data.riskByExperience || []).map((item) => `${item.expYears} ปี`),
    datasets: [
      {
        label: 'ความเสี่ยง AI เฉลี่ย (%)',
        data: (data.riskByExperience || []).map((item) => Number(item.avgRisk || 0)),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        tension: 0.3,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: '#f59e0b',
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

        {/* Charts Grid - Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart 1: Top 10 Risk Jobs */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">1. Top 10 อาชีพที่มีความเสี่ยงโดน AI แทนที่สูงสุด (%)</h2>
            <div className="h-80 relative">
              <Bar
                data={topRiskBarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { labels: { color: '#cbd5e1' } } },
                  scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { 
                      min: 0, 
                      max: 100, 
                      ticks: { color: '#94a3b8', callback: (v) => `${v}%` }, 
                      grid: { color: 'rgba(255,255,255,0.05)' } 
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Chart 2: AI Impact Level */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">2. สัดส่วนระดับผลกระทบ AI</h2>
            <div className="h-80 relative flex items-center justify-center">
              <Doughnut
                data={impactDoughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { position: 'bottom', labels: { color: '#cbd5e1', font: { size: 11 } } } 
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Charts Grid - Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 3: Avg Salary by Industry */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-400" />
              3. เงินเดือนเฉลี่ยจำแนกตามอุตสาหกรรม (USD)
            </h2>
            <div className="h-80 relative">
              <Bar
                data={industrySalaryData}
                options={{
                  indexAxis: 'y', // Horizontal Bar
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                  },
                }}
              />
            </div>
          </div>

          {/* Chart 4: Job Growth Comparison */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              4. เปรียบเทียบการเติบโตของตำแหน่งงาน (2024 vs 2030)
            </h2>
            <div className="h-80 relative">
              <Bar
                data={growthChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { labels: { color: '#cbd5e1' } } },
                  scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Charts Grid - Row 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            5. แนวโน้มความเสี่ยงโดน AI แทนที่ ตามจำนวนปีประสบการณ์ทำงาน (Experience Required)
          </h2>
          <div className="h-72 relative">
            <Line
              data={experienceRiskData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#cbd5e1' } } },
                scales: {
                  x: { title: { display: true, text: 'อายุงานที่ต้องการ (ปี)', color: '#64748b' }, ticks: { color: '#94a3b8' } },
                  y: { 
                    min: 0, 
                    max: 100, 
                    ticks: { color: '#94a3b8', callback: (v) => `${v}%` }, 
                    grid: { color: 'rgba(255,255,255,0.05)' } 
                  },
                },
              }}
            />
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
                {(data.recentJobs || []).map((job) => {
                  const jobTitle = job.jobTitle || 'ไม่ระบุ';
                  const education = job.education || 'N/A';
                  const salary = Number(job.salary || 0);
                  const riskPercent = Number(job.automationRisk || 0);
                  const impactLevel = job.impactLevel || 'Moderate';

                  return (
                    <tr key={jobTitle} className="hover:bg-slate-800/30">
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