import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    // 1. ภาพรวมสถิติ KPI
    const summary = await executeQuery<any[]>(`
      SELECT 
        COUNT(*) as totalJobs,
        AVG(CAST(\`Median Salary (USD)\` AS DECIMAL(15,2))) as avgSalary,
        AVG(CAST(\`Automation Risk (%)\` AS DECIMAL(5,2))) as avgAutomationRisk,
        AVG(CAST(\`Remote Work Ratio (%)\` AS DECIMAL(5,2))) as avgRemoteWork
      FROM ai_job_trends_dataset
      WHERE \`Job Title\` NOT LIKE 'Job Title%'
    `);

    // 2. [Graph 1] Top 10 อาชีพเสี่ยงสูงสุด
    const topRiskJobs = await executeQuery<any[]>(`
      SELECT 
        \`Job Title\` as jobTitle,
        CAST(\`Automation Risk (%)\` AS DECIMAL(5,2)) as automationRisk,
        CAST(\`Median Salary (USD)\` AS DECIMAL(15,2)) as salary
      FROM ai_job_trends_dataset
      WHERE \`Job Title\` NOT LIKE 'Job Title%'
      ORDER BY automationRisk DESC
      LIMIT 10
    `);

    // 3. [Graph 2] สถิติตาม AI Impact Level
    const impactStats = await executeQuery<any[]>(`
      SELECT 
        \`AI Impact Level\` as category,
        COUNT(*) as count
      FROM ai_job_trends_dataset
      WHERE \`Job Title\` NOT LIKE 'Job Title%'
      GROUP BY \`AI Impact Level\`
      ORDER BY count DESC
    `);

    // 4. [Graph 3] เงินเดือนเฉลี่ยแยกตามอุตสาหกรรม (Top 8 Industry)
    const industrySalaries = await executeQuery<any[]>(`
      SELECT 
        \`Industry\` as industry,
        AVG(CAST(\`Median Salary (USD)\` AS DECIMAL(15,2))) as avgSalary
      FROM ai_job_trends_dataset
      WHERE \`Job Title\` NOT LIKE 'Job Title%'
      GROUP BY \`Industry\`
      ORDER BY avgSalary DESC
      LIMIT 8
    `);

    // 5. [Graph 4] เปรียบเทียบ Job Openings (2024 vs 2030) ตาม Industry
    const jobGrowthByIndustry = await executeQuery<any[]>(`
      SELECT 
        \`Industry\` as industry,
        SUM(CAST(\`Job Openings (2024)\` AS UNSIGNED)) as openings2024,
        SUM(CAST(\`Projected Openings (2030)\` AS UNSIGNED)) as openings2030
      FROM ai_job_trends_dataset
      WHERE \`Job Title\` NOT LIKE 'Job Title%'
      GROUP BY \`Industry\`
      ORDER BY openings2024 DESC
      LIMIT 6
    `);

    // 6. [Graph 5] ความเสี่ยง AI ตามระดับประสบการณ์ (Experience Required)
    const riskByExperience = await executeQuery<any[]>(`
      SELECT 
        \`Experience Required (Years)\` as expYears,
        AVG(CAST(\`Automation Risk (%)\` AS DECIMAL(5,2))) as avgRisk,
        AVG(CAST(\`Median Salary (USD)\` AS DECIMAL(15,2))) as avgSalary
      FROM ai_job_trends_dataset
      WHERE \`Job Title\` NOT LIKE 'Job Title%'
      GROUP BY \`Experience Required (Years)\`
      ORDER BY CAST(\`Experience Required (Years)\` AS UNSIGNED) ASC
    `);

    // 7. ตารางข้อมูลตัวอย่าง
    const recentJobs = await executeQuery<any[]>(`
      SELECT 
        \`Job Title\` as jobTitle,
        \`Required Education\` as education,
        CAST(\`Median Salary (USD)\` AS DECIMAL(15,2)) as salary,
        CAST(\`Automation Risk (%)\` AS DECIMAL(5,2)) as automationRisk,
        \`AI Impact Level\` as impactLevel
      FROM ai_job_trends_dataset
      WHERE \`Job Title\` NOT LIKE 'Job Title%'
      LIMIT 10
    `);

    return NextResponse.json({
      summary: summary[0] || {},
      topRiskJobs,
      impactStats,
      industrySalaries,
      jobGrowthByIndustry,
      riskByExperience,
      recentJobs
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลได้', details: error.message },
      { status: 500 }
    );
  }
}