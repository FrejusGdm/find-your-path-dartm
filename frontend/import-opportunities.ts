#!/usr/bin/env tsx

import { api } from "./convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
function loadEnvVars() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    for (const line of envContent.split('\n')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    }
  } catch (error) {
    console.error('Could not load .env.local file:', error);
  }
}

async function importOpportunities() {
  // Load environment variables first
  loadEnvVars();
  
  console.log('🚀 Starting Convex import from frontend directory...');
  console.log('=' .repeat(50));

  // Use the Convex URL from environment (should be set in frontend)
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  
  if (!convexUrl) {
    console.error('❌ NEXT_PUBLIC_CONVEX_URL not found. Check your .env.local file in frontend/');
    console.error('Expected: NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud');
    return;
  }

  console.log(`✅ Using Convex URL: ${convexUrl}\n`);

  const client = new ConvexHttpClient(convexUrl);

  try {
    // Read the import-ready JSON file from scrapers directory
    const importPath = path.join(__dirname, '../scripts/scrapers/output', 'import-ready.json');
    
    if (!fs.existsSync(importPath)) {
      console.error(`❌ Import file not found: ${importPath}`);
      console.error('💡 Run "npm run scrape" in scripts/scrapers first');
      return;
    }

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
        const result = await client.mutation(api.opportunities.create, {
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
      console.log('💡 Check your Convex dashboard or run your app to see them.');
    }

  } catch (error) {
    console.error('💥 Import process failed:', error);
  }
}

// Run import if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importOpportunities().catch(console.error);
}

export { importOpportunities };