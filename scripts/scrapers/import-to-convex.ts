#!/usr/bin/env tsx

import { ConvexHttpClient } from "convex/browser";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// You'll need to get this from your Convex dashboard
const CONVEX_URL = process.env.CONVEX_URL || "https://your-deployment.convex.cloud";

async function importOpportunities() {
  console.log('🚀 Starting Convex import process...');
  console.log('=' .repeat(50));

  // Initialize Convex client
  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    // Read the import-ready JSON file
    const importPath = path.join(__dirname, 'output', 'import-ready.json');
    const opportunities = JSON.parse(fs.readFileSync(importPath, 'utf8'));
    
    console.log(`📥 Found ${opportunities.length} opportunities to import\n`);

    let successful = 0;
    let failed = 0;

    // Import each opportunity using the create mutation
    for (let i = 0; i < opportunities.length; i++) {
      const opp = opportunities[i];
      
      try {
        console.log(`⏳ Importing ${i + 1}/${opportunities.length}: ${opp.title}`);
        
        // Use the create mutation from your Convex schema
        const result = await client.mutation("opportunities:create", {
          title: opp.title,
          description: opp.description,
          department: opp.department,
          category: opp.category,
          eligibleYears: opp.eligibleYears,
          eligibleMajors: opp.eligibleMajors,
          internationalEligible: opp.internationalEligible,
          gpaRequirement: opp.gpaRequirement,
          isPaid: opp.isPaid,
          estimatedHours: opp.estimatedHours,
          timeCommitment: opp.timeCommitment,
          officialUrl: opp.officialUrl,
          applicationUrl: opp.applicationUrl,
          contactEmail: opp.contactEmail,
          contactName: opp.contactName,
          contactRole: opp.contactRole,
          nextSteps: opp.nextSteps,
          tags: opp.tags,
        });

        console.log(`✅ Successfully imported: ${opp.title}`);
        successful++;

      } catch (error) {
        console.error(`❌ Failed to import: ${opp.title}`);
        console.error(`   Error: ${error}`);
        failed++;
      }

      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n' + '=' .repeat(50));
    console.log('📊 Import Summary:');
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((successful / opportunities.length) * 100).toFixed(1)}%`);

    if (successful > 0) {
      console.log('\n🎉 Import completed! Your opportunities are now in Convex.');
      console.log('💡 You can view them in your Convex dashboard or through your app.');
    }

  } catch (error) {
    console.error('💥 Import process failed:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Check that CONVEX_URL is set correctly');
    console.error('2. Ensure your Convex deployment is running');
    console.error('3. Verify import-ready.json exists and is valid');
  }
}

// Helper function to set up environment
function setupEnvironment() {
  console.log('🔧 Environment Setup:');
  
  if (!process.env.CONVEX_URL) {
    console.log('⚠️  CONVEX_URL not found in environment variables');
    console.log('   You can set it with: export CONVEX_URL="https://your-deployment.convex.cloud"');
    console.log('   Or get it from your Convex dashboard\n');
  } else {
    console.log(`✅ CONVEX_URL: ${process.env.CONVEX_URL}\n`);
  }
}

// Run import if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupEnvironment();
  importOpportunities().catch(console.error);
}

export { importOpportunities };