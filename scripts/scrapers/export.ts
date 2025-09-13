import { writeFileSync } from 'fs';
import { validateBatch, calculateQualityScore, generateQualityReport, OpportunityData } from './validators';

export async function exportToJSON(data: any[], filePath: string): Promise<void> {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    writeFileSync(filePath, jsonContent, 'utf-8');
    console.log(`✅ Exported ${data.length} items to ${filePath}`);
  } catch (error) {
    console.error(`❌ Error exporting to ${filePath}:`, error);
    throw error;
  }
}

export async function generateReport(opportunities: any[], filePath: string): Promise<void> {
  try {
    // Validate all opportunities
    const validation = validateBatch(opportunities);
    
    // Generate comprehensive report
    const report = generateValidationReport(opportunities, validation);
    
    writeFileSync(filePath, report, 'utf-8');
    console.log(`✅ Generated validation report: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error generating report:`, error);
    throw error;
  }
}

function generateValidationReport(
  originalData: any[], 
  validation: ReturnType<typeof validateBatch>
): string {
  const { valid, invalid, totalWarnings } = validation;
  const timestamp = new Date().toISOString();
  
  let report = `Dartmouth Opportunities Scraping Report
Generated: ${timestamp}
${'='.repeat(50)}

SUMMARY
-------
Total Opportunities Scraped: ${originalData.length}
Valid Opportunities: ${valid.length}
Invalid Opportunities: ${invalid.length}
Total Warnings: ${totalWarnings}
Success Rate: ${((valid.length / originalData.length) * 100).toFixed(1)}%

`;

  // Data Quality Analysis
  if (valid.length > 0) {
    const qualityReport = generateQualityReport(valid);
    report += qualityReport + '\n\n';
  }

  // Category breakdown
  if (valid.length > 0) {
    const categoryCount: Record<string, number> = {};
    valid.forEach(opp => {
      categoryCount[opp.category] = (categoryCount[opp.category] || 0) + 1;
    });
    
    report += `CATEGORY BREAKDOWN
-----------------
`;
    Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        report += `${category}: ${count}\n`;
      });
    report += '\n';
  }

  // Department breakdown
  if (valid.length > 0) {
    const deptCount: Record<string, number> = {};
    valid.forEach(opp => {
      deptCount[opp.department] = (deptCount[opp.department] || 0) + 1;
    });
    
    report += `DEPARTMENT BREAKDOWN
-------------------
`;
    Object.entries(deptCount)
      .sort(([,a], [,b]) => b - a)
      .forEach(([dept, count]) => {
        report += `${dept}: ${count}\n`;
      });
    report += '\n';
  }

  // Eligibility analysis
  if (valid.length > 0) {
    const paidCount = valid.filter(opp => opp.isPaid).length;
    const intlCount = valid.filter(opp => opp.internationalEligible).length;
    const firstYearCount = valid.filter(opp => opp.eligibleYears.includes('first-year')).length;
    
    report += `ACCESSIBILITY ANALYSIS
---------------------
Paid Opportunities: ${paidCount} (${((paidCount / valid.length) * 100).toFixed(1)}%)
International Eligible: ${intlCount} (${((intlCount / valid.length) * 100).toFixed(1)}%)
First-Year Friendly: ${firstYearCount} (${((firstYearCount / valid.length) * 100).toFixed(1)}%)

`;
  }

  // Validation errors
  if (invalid.length > 0) {
    report += `VALIDATION ERRORS
----------------
`;
    invalid.forEach((item, index) => {
      report += `Error ${index + 1}: ${item.data.title || 'Unknown Title'}\n`;
      item.error.issues.forEach(issue => {
        report += `  - ${issue.path.join('.')}: ${issue.message}\n`;
      });
      if (item.warnings.length > 0) {
        report += `  Warnings: ${item.warnings.join(', ')}\n`;
      }
      report += '\n';
    });
  }

  // Data completeness analysis
  if (valid.length > 0) {
    report += `DATA COMPLETENESS ANALYSIS
-------------------------
`;
    
    const fields = [
      { name: 'Contact Email', check: (opp: OpportunityData) => !!opp.contactEmail },
      { name: 'Contact Name', check: (opp: OpportunityData) => !!opp.contactName },
      { name: 'Application URL', check: (opp: OpportunityData) => !!opp.applicationUrl },
      { name: 'Estimated Hours', check: (opp: OpportunityData) => !!opp.estimatedHours },
      { name: 'Time Commitment', check: (opp: OpportunityData) => !!opp.timeCommitment },
      { name: 'GPA Requirement', check: (opp: OpportunityData) => opp.gpaRequirement !== undefined },
      { name: 'Eligible Majors', check: (opp: OpportunityData) => !!opp.eligibleMajors?.length },
      { name: 'Next Steps', check: (opp: OpportunityData) => opp.nextSteps.length > 0 },
      { name: 'Tags', check: (opp: OpportunityData) => opp.tags.length > 0 },
    ];
    
    fields.forEach(field => {
      const count = valid.filter(field.check).length;
      const percentage = ((count / valid.length) * 100).toFixed(1);
      report += `${field.name}: ${count}/${valid.length} (${percentage}%)\n`;
    });
    report += '\n';
  }

  // Sample valid entries
  if (valid.length > 0) {
    report += `SAMPLE VALID ENTRIES
-------------------
`;
    valid.slice(0, 3).forEach((opp, index) => {
      const score = calculateQualityScore(opp);
      report += `${index + 1}. ${opp.title}
   Department: ${opp.department}
   Category: ${opp.category}
   Paid: ${opp.isPaid ? 'Yes' : 'No'}
   International: ${opp.internationalEligible ? 'Yes' : 'No'}
   Quality Score: ${score}%
   URL: ${opp.officialUrl}

`;
    });
  }

  // Recommendations
  report += `RECOMMENDATIONS
--------------
`;

  if (invalid.length > 0) {
    report += `• Fix ${invalid.length} validation errors before importing\n`;
  }
  
  if (totalWarnings > 0) {
    report += `• Review ${totalWarnings} warnings to improve data quality\n`;
  }

  const lowContactInfo = valid.filter(opp => !opp.contactEmail && !opp.contactName).length;
  if (lowContactInfo > 0) {
    report += `• Add contact information for ${lowContactInfo} opportunities\n`;
  }

  const noNextSteps = valid.filter(opp => opp.nextSteps.length === 0).length;
  if (noNextSteps > 0) {
    report += `• Add next steps for ${noNextSteps} opportunities\n`;
  }

  const noTags = valid.filter(opp => opp.tags.length === 0).length;
  if (noTags > 0) {
    report += `• Add tags for ${noTags} opportunities to improve searchability\n`;
  }

  if (valid.length > 0) {
    const avgScore = valid.reduce((sum, opp) => sum + calculateQualityScore(opp), 0) / valid.length;
    if (avgScore < 70) {
      report += `• Average quality score is ${avgScore.toFixed(1)}% - consider enhancing data quality\n`;
    }
  }

  report += `\nNEXT STEPS
----------
1. Review validation errors and fix data issues
2. Check warnings and enhance data where possible
3. If satisfied with quality, use 'import-ready.json' for Convex import
4. Consider manual enhancement for low-quality entries
5. Set up periodic re-scraping to keep data fresh

END OF REPORT
`;

  return report;
}

// Convert scraped data to Convex-ready format
export function convertToConvexFormat(opportunities: OpportunityData[]): any[] {
  const now = Date.now();
  
  return opportunities.map(opp => ({
    // Basic info
    title: opp.title,
    description: opp.description,
    department: opp.department,
    category: opp.category,
    
    // Eligibility
    eligibleYears: opp.eligibleYears,
    eligibleMajors: opp.eligibleMajors || [],
    internationalEligible: opp.internationalEligible,
    gpaRequirement: opp.gpaRequirement,
    
    // Details
    isPaid: opp.isPaid,
    estimatedHours: opp.estimatedHours,
    timeCommitment: opp.timeCommitment,
    
    // Contact and links
    officialUrl: opp.officialUrl,
    applicationUrl: opp.applicationUrl,
    contactEmail: opp.contactEmail,
    contactName: opp.contactName,
    contactRole: opp.contactRole,
    
    // Next steps
    nextSteps: opp.nextSteps,
    
    // Tags
    tags: opp.tags,
    
    // Popularity metrics (initialize to 0)
    viewCount: 0,
    saveCount: 0,
    clickCount: 0,
    
    // Content management
    isActive: true,
    lastVerified: now,
    submittedBy: 'scraper',
    
    // Metadata
    createdAt: now,
    updatedAt: now,
  }));
}

// Export summary statistics
export function generateSummaryStats(opportunities: any[]): any {
  const validation = validateBatch(opportunities);
  const valid = validation.valid;
  
  if (valid.length === 0) {
    return {
      total: opportunities.length,
      valid: 0,
      invalid: validation.invalid.length,
      categories: {},
      departments: {},
      avgQualityScore: 0
    };
  }

  // Category stats
  const categories: Record<string, number> = {};
  valid.forEach(opp => {
    categories[opp.category] = (categories[opp.category] || 0) + 1;
  });

  // Department stats  
  const departments: Record<string, number> = {};
  valid.forEach(opp => {
    departments[opp.department] = (departments[opp.department] || 0) + 1;
  });

  // Quality score
  const avgQualityScore = valid.reduce((sum, opp) => sum + calculateQualityScore(opp), 0) / valid.length;

  return {
    total: opportunities.length,
    valid: valid.length,
    invalid: validation.invalid.length,
    successRate: (valid.length / opportunities.length) * 100,
    categories,
    departments,
    avgQualityScore: Math.round(avgQualityScore),
    paid: valid.filter(opp => opp.isPaid).length,
    internationalEligible: valid.filter(opp => opp.internationalEligible).length,
    firstYearFriendly: valid.filter(opp => opp.eligibleYears.includes('first-year')).length,
  };
}