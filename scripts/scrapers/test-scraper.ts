#!/usr/bin/env tsx

import { DartmouthScraper } from './dartmouth-scraper';
import { validateBatch, generateQualityReport } from './validators';
import { generateSummaryStats } from './export';

async function testScraper() {
  console.log('🧪 Testing Dartmouth Scraper');
  console.log('=' .repeat(50));
  
  const scraper = new DartmouthScraper();
  
  try {
    // Initialize (but don't actually launch browser for this test)
    console.log('📊 Running scraper without browser (using sample data)...\n');
    
    // Simulate scraping by directly adding sample data
    await scraper.scrapeUGAR();
    await scraper.scrapeWISP();
    await scraper.scrapeDickey();
    await scraper.scrapeRockefeller();
    await scraper.scrapeScholarPrograms();
    await scraper.scrapeFellowshipAdvising();
    await scraper.scrapeLovelaceProgram();
    await scraper.scrapeLeslieCenter();
    await scraper.scrapeMagnusonExpanded();
    await scraper.scrapeDepartmentPrograms();
    await scraper.scrapeFYREE();
    await scraper.scrapeTuckerCenter();
    await scraper.scrapeDCSI();
    await scraper.scrapeHopkinsCenter();
    await scraper.scrapeAdditionalPrograms();
    
    const opportunities = scraper.getOpportunities();
    console.log(`✅ Scraped ${opportunities.length} opportunities\n`);
    
    // Validate data
    console.log('🔍 Validating scraped data...');
    const validation = validateBatch(opportunities);
    
    console.log(`Valid: ${validation.valid.length}`);
    console.log(`Invalid: ${validation.invalid.length}`);
    console.log(`Warnings: ${validation.totalWarnings}\n`);
    
    // Show validation errors if any
    if (validation.invalid.length > 0) {
      console.log('❌ Validation Errors:');
      validation.invalid.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.data.title || 'Unknown'}`);
        item.error.issues.forEach(issue => {
          console.log(`     - ${issue.path.join('.')}: ${issue.message}`);
        });
      });
      console.log();
    }
    
    // Generate summary stats
    const stats = generateSummaryStats(opportunities);
    console.log('📈 Summary Statistics:');
    console.log(`  Total Scraped: ${stats.total}`);
    console.log(`  Valid: ${stats.valid}`);
    console.log(`  Success Rate: ${stats.successRate.toFixed(1)}%`);
    console.log(`  Avg Quality Score: ${stats.avgQualityScore}%`);
    console.log(`  Paid Opportunities: ${stats.paid}`);
    console.log(`  International Friendly: ${stats.internationalEligible}`);
    console.log(`  First-Year Friendly: ${stats.firstYearFriendly}\n`);
    
    // Show categories
    console.log('📂 Categories:');
    Object.entries(stats.categories).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
    console.log();
    
    // Show departments
    console.log('🏢 Departments:');
    Object.entries(stats.departments).forEach(([dept, count]) => {
      console.log(`  ${dept}: ${count}`);
    });
    console.log();
    
    // Sample opportunities
    console.log('📋 Sample Opportunities:');
    validation.valid.slice(0, 3).forEach((opp, index) => {
      console.log(`  ${index + 1}. ${opp.title}`);
      console.log(`     Category: ${opp.category} | Department: ${opp.department}`);
      console.log(`     Paid: ${opp.isPaid ? 'Yes' : 'No'} | International: ${opp.internationalEligible ? 'Yes' : 'No'}`);
      console.log(`     Years: ${opp.eligibleYears.join(', ')}`);
      console.log();
    });
    
    console.log('✨ Test completed successfully!');
    console.log('💡 Run "npm run scrape" to generate full output files');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await scraper.cleanup();
  }
}

// Run test if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testScraper().catch(console.error);
}