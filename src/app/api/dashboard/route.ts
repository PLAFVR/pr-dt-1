import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    // 1. ภาพรวมสถิติ
    const summary = await executeQuery<any[]>(`
      SELECT 
        COUNT(*) as totalJobs,
        AVG(CAST(\`Median Salary (USD)\` AS DECIMAL(15,2))) as avgSalary,
        AVG(CAST(\`Automation Risk (%)\` AS DECIMAL(5,2))) as avgAutomationRisk,
        AVG(CAST(\`Remote Work Ratio (%)\` AS DECIMAL(5,2))) as avgRemoteWork
      FROM ai_job_trends_dataset
      WHERE \`Job Title\` NOT LIKE 'Job Title%'
    `);

    // 2. สถิติแบ่งตามระดับผลกระทบ AI
    const impactStats = await executeQuery<any[]>(`
      SELECT 
        \`AI Impact Level\` as category,
        COUNT(*) as count,
        AVG(CAST(\`Automation Risk (%)\` AS DECIMAL(5,2))) as avg_automation
      FROM ai_job_trends_dataset
      WHERE \`Job Title\` NOT LIKE 'Job Title%'
      GROUP BY \`AI Impact Level\`
      ORDER BY count DESC
    `);

    // 3. Top 10 อาชีพที่มีความเสี่ยงโดนแทนที่สูงสุด
    const topRiskJobs = await executeQuery<any[]>(`
      SELECT 
        \`Job Title\` as Job_Title,
        CAST(\`Automation Risk (%)\` AS DECIMAL(5,2)) as avg_automation,
        CAST(\`Median Salary (USD)\` AS DECIMAL(15,2)) as avg_salary
      FROM ai_job_trends_dataset
      WHERE \`Job Title\` NOT LIKE 'Job Title%'
      ORDER BY avg_automation DESC
      LIMIT 10
    `);

    // 4. รายการตัวอย่างอาชีพสำหรับแสดงในตาราง
    const recentJobs = await executeQuery<any[]>(`
      SELECT 
        \`Job Title\`,
        \`Required Education\`,
        CAST(\`Median Salary (USD)\` AS DECIMAL(15,2)) as \`Median Salary (USD)\`,
        CAST(\`Automation Risk (%)\` AS DECIMAL(5,2)) as \`Automation Risk (%)\`,
        \`AI Impact Level\`
      FROM ai_job_trends_dataset
      WHERE \`Job Title\` NOT LIKE 'Job Title%'
      LIMIT 10
    `);

    return NextResponse.json({
      summary: summary[0] || {},
      impactStats,
      topRiskJobs,
      recentJobs
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลได้', details: error.message },
      { status: 500 }
    );
  }
}