import { z } from 'zod';

// Zod schema for opportunity validation (matches Convex schema)
export const OpportunitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  department: z.string().min(1, "Department is required"),
  category: z.enum(["research", "internship", "grant", "program", "fellowship", "other"]),
  
  // Eligibility
  eligibleYears: z.array(z.string()).min(1, "At least one eligible year required"),
  eligibleMajors: z.array(z.string()).optional(),
  internationalEligible: z.boolean(),
  gpaRequirement: z.number().min(0).max(4).optional(),
  
  // Details
  isPaid: z.boolean(),
  estimatedHours: z.string().optional(),
  timeCommitment: z.string().optional(),
  
  // Contact and links
  officialUrl: z.string().url("Invalid URL format"),
  applicationUrl: z.string().url("Invalid URL format").optional(),
  contactEmail: z.string().email("Invalid email format").optional(),
  contactName: z.string().optional(),
  contactRole: z.string().optional(),
  
  // Next steps
  nextSteps: z.array(z.string()),
  
  // Tags
  tags: z.array(z.string()),
  
  // Metadata (scraping specific)
  sourceUrl: z.string().url("Invalid source URL").optional(),
  scrapedAt: z.number().optional(),
});

export type OpportunityData = z.infer<typeof OpportunitySchema>;

export interface ValidationResult {
  success: boolean;
  data?: OpportunityData;
  error?: z.ZodError;
  warnings: string[];
}

export function validateOpportunity(opportunity: any): ValidationResult {
  const warnings: string[] = [];
  
  try {
    // Clean and preprocess data
    const cleanedOpportunity = cleanOpportunityData(opportunity, warnings);
    
    // Validate with Zod schema
    const result = OpportunitySchema.parse(cleanedOpportunity);
    
    // Additional quality checks
    performQualityChecks(result, warnings);
    
    return {
      success: true,
      data: result,
      warnings
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error as z.ZodError,
        warnings
      };
    }
    
    throw error; // Re-throw non-Zod errors
  }
}

function cleanOpportunityData(opportunity: any, warnings: string[]): any {
  const cleaned = { ...opportunity };
  
  // Clean title
  if (cleaned.title) {
    cleaned.title = cleaned.title.trim().replace(/\s+/g, ' ');
  }
  
  // Clean description
  if (cleaned.description) {
    cleaned.description = cleaned.description.trim().replace(/\s+/g, ' ');
    // Remove excessive whitespace and normalize
    cleaned.description = cleaned.description.replace(/\n\s*\n/g, '\n\n');
  }
  
  // Clean department
  if (cleaned.department) {
    cleaned.department = cleaned.department.trim();
  }
  
  // Normalize category
  if (cleaned.category) {
    const categoryLower = cleaned.category.toLowerCase();
    const categoryMap: Record<string, string> = {
      'research': 'research',
      'internship': 'internship',
      'grant': 'grant',
      'program': 'program',
      'programme': 'program',
      'fellowship': 'fellowship',
      'scholarship': 'grant',
      'assistantship': 'research',
      'opportunity': 'other'
    };
    
    cleaned.category = categoryMap[categoryLower] || 'other';
    if (cleaned.category === 'other') {
      warnings.push(`Category '${opportunity.category}' mapped to 'other'`);
    }
  }
  
  // Normalize eligible years
  if (cleaned.eligibleYears) {
    const validYears = ["first-year", "sophomore", "junior", "senior", "graduate", "other"];
    cleaned.eligibleYears = cleaned.eligibleYears
      .map((year: string) => {
        const yearLower = year.toLowerCase().trim();
        const yearMap: Record<string, string> = {
          '1st year': 'first-year',
          'first year': 'first-year',
          'freshman': 'first-year',
          '1': 'first-year',
          '2nd year': 'sophomore',
          '2': 'sophomore',
          '3rd year': 'junior',
          '3': 'junior',
          '4th year': 'senior',
          '4': 'senior',
          'grad': 'graduate',
          'graduate student': 'graduate',
          'all years': 'other'
        };
        
        return yearMap[yearLower] || (validYears.includes(yearLower) ? yearLower : 'other');
      })
      .filter((year: string, index: number, arr: string[]) => arr.indexOf(year) === index); // Remove duplicates
  }
  
  // Clean contact email
  if (cleaned.contactEmail) {
    cleaned.contactEmail = cleaned.contactEmail.trim().toLowerCase();
  }
  
  // Clean URLs
  ['officialUrl', 'applicationUrl', 'sourceUrl'].forEach(urlField => {
    if (cleaned[urlField] && typeof cleaned[urlField] === 'string') {
      let url = cleaned[urlField].trim();
      // Add https if missing
      if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
        warnings.push(`Added https:// to ${urlField}`);
      }
      cleaned[urlField] = url;
    }
  });
  
  // Clean and validate next steps
  if (cleaned.nextSteps && Array.isArray(cleaned.nextSteps)) {
    cleaned.nextSteps = cleaned.nextSteps
      .filter((step: any) => typeof step === 'string' && step.trim().length > 0)
      .map((step: string) => step.trim())
      .slice(0, 10); // Limit to 10 steps
  } else {
    cleaned.nextSteps = [];
  }
  
  // Clean and validate tags
  if (cleaned.tags && Array.isArray(cleaned.tags)) {
    cleaned.tags = cleaned.tags
      .filter((tag: any) => typeof tag === 'string' && tag.trim().length > 0)
      .map((tag: string) => tag.trim().toLowerCase().replace(/\s+/g, '-'))
      .filter((tag: string, index: number, arr: string[]) => arr.indexOf(tag) === index) // Remove duplicates
      .slice(0, 20); // Limit to 20 tags
  } else {
    cleaned.tags = [];
  }
  
  // Default boolean values
  if (typeof cleaned.internationalEligible !== 'boolean') {
    cleaned.internationalEligible = true; // Default to inclusive
    warnings.push('International eligibility defaulted to true');
  }
  
  if (typeof cleaned.isPaid !== 'boolean') {
    cleaned.isPaid = false; // Default to unpaid
    warnings.push('Payment status defaulted to false');
  }
  
  return cleaned;
}

function performQualityChecks(opportunity: OpportunityData, warnings: string[]): void {
  // Check description length
  if (opportunity.description.length < 50) {
    warnings.push('Description is quite short (less than 50 characters)');
  }
  
  if (opportunity.description.length > 1000) {
    warnings.push('Description is very long (over 1000 characters)');
  }
  
  // Check for next steps
  if (opportunity.nextSteps.length === 0) {
    warnings.push('No next steps provided');
  }
  
  // Check for contact information
  if (!opportunity.contactEmail && !opportunity.contactName) {
    warnings.push('No contact information provided');
  }
  
  // Check for tags
  if (opportunity.tags.length === 0) {
    warnings.push('No tags provided - consider adding relevant tags');
  }
  
  // Check URL accessibility (basic check)
  if (!opportunity.officialUrl.includes('dartmouth.edu')) {
    warnings.push('Official URL is not a Dartmouth domain');
  }
  
  // Check for application URL when paid
  if (opportunity.isPaid && !opportunity.applicationUrl) {
    warnings.push('Paid opportunity without application URL');
  }
  
  // Check eligibility years
  const validYears = ["first-year", "sophomore", "junior", "senior", "graduate", "other"];
  const invalidYears = opportunity.eligibleYears.filter(year => !validYears.includes(year));
  if (invalidYears.length > 0) {
    warnings.push(`Invalid eligible years: ${invalidYears.join(', ')}`);
  }
}

export function validateBatch(opportunities: any[]): {
  valid: OpportunityData[];
  invalid: Array<{ data: any; error: z.ZodError; warnings: string[] }>;
  totalWarnings: number;
} {
  const valid: OpportunityData[] = [];
  const invalid: Array<{ data: any; error: z.ZodError; warnings: string[] }> = [];
  let totalWarnings = 0;
  
  opportunities.forEach((opp, index) => {
    const result = validateOpportunity(opp);
    totalWarnings += result.warnings.length;
    
    if (result.success && result.data) {
      valid.push(result.data);
    } else if (result.error) {
      invalid.push({
        data: opp,
        error: result.error,
        warnings: result.warnings
      });
    }
  });
  
  return { valid, invalid, totalWarnings };
}

// Quality score calculation
export function calculateQualityScore(opportunity: OpportunityData): number {
  let score = 0;
  let maxScore = 0;
  
  // Title quality (10 points)
  maxScore += 10;
  if (opportunity.title.length > 10) score += 5;
  if (opportunity.title.length > 20) score += 5;
  
  // Description quality (20 points)
  maxScore += 20;
  if (opportunity.description.length > 100) score += 10;
  if (opportunity.description.length > 300) score += 10;
  
  // Contact info (15 points)
  maxScore += 15;
  if (opportunity.contactEmail) score += 10;
  if (opportunity.contactName) score += 5;
  
  // Application details (15 points)
  maxScore += 15;
  if (opportunity.applicationUrl) score += 10;
  if (opportunity.estimatedHours) score += 3;
  if (opportunity.timeCommitment) score += 2;
  
  // Next steps (20 points)
  maxScore += 20;
  score += Math.min(opportunity.nextSteps.length * 5, 20);
  
  // Tags (10 points)
  maxScore += 10;
  score += Math.min(opportunity.tags.length * 2, 10);
  
  // Additional details (10 points)
  maxScore += 10;
  if (opportunity.gpaRequirement !== undefined) score += 3;
  if (opportunity.eligibleMajors && opportunity.eligibleMajors.length > 0) score += 3;
  if (opportunity.eligibleYears.length > 1) score += 2;
  if (opportunity.internationalEligible) score += 2;
  
  return Math.round((score / maxScore) * 100);
}

export function generateQualityReport(opportunities: OpportunityData[]): string {
  const scores = opportunities.map(opp => ({
    title: opp.title,
    score: calculateQualityScore(opp)
  }));
  
  const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
  const highQuality = scores.filter(s => s.score >= 80).length;
  const mediumQuality = scores.filter(s => s.score >= 60 && s.score < 80).length;
  const lowQuality = scores.filter(s => s.score < 60).length;
  
  return `
Quality Report
==============

Total Opportunities: ${opportunities.length}
Average Quality Score: ${avgScore.toFixed(1)}%

Quality Distribution:
- High Quality (80%+): ${highQuality}
- Medium Quality (60-79%): ${mediumQuality}  
- Low Quality (<60%): ${lowQuality}

Lowest Quality Opportunities:
${scores
  .sort((a, b) => a.score - b.score)
  .slice(0, 5)
  .map(s => `- ${s.title}: ${s.score}%`)
  .join('\n')}
`;
}