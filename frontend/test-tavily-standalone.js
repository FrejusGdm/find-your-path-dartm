#!/usr/bin/env node

/**
 * Tavily Search API Standalone Test
 * Tests Tavily API integration in isolation
 */

import { tavily } from '@tavily/core';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../frontend/.env.local' });

const API_KEY = process.env.TAVILY_API_KEY;

console.log('🔍 Tavily Standalone Test Starting...\n');

if (!API_KEY || API_KEY === 'tvly-YOUR_TAVILY_API_KEY_HERE') {
    console.error('❌ TAVILY_API_KEY not configured properly');
    console.log('Current API_KEY:', API_KEY ? 'Set but possibly default' : 'Not set');
    process.exit(1);
}

console.log('✅ API Key Status:', API_KEY ? 'Configured' : 'Missing');

// Initialize Tavily client
const tvly = tavily({ apiKey: API_KEY });

async function testBasicSearch() {
    console.log('\n📝 Test 1: Basic Search Query');
    try {
        const response = await tvly.search('Dartmouth CS research opportunities');

        console.log('✅ Search Response:');
        console.log('  - Results count:', response.results?.length || 0);
        console.log('  - Has answer:', !!response.answer);
        console.log('  - Response time:', response.responseTime || 'N/A');

        if (response.results?.length > 0) {
            console.log('  - First result:');
            console.log('    * Title:', response.results[0].title?.substring(0, 60) + '...');
            console.log('    * URL:', response.results[0].url);
            console.log('    * Score:', response.results[0].score);
        }

        return response;
    } catch (error) {
        console.error('❌ Basic search failed:', error.message);
        return null;
    }
}

async function testAdvancedSearch() {
    console.log('\n📝 Test 2: Advanced Search with Options');
    try {
        const response = await tvly.search('cs research opportunities site:dartmouth.edu', {
            include_answer: true,
            max_results: 3,
            search_depth: 'advanced',
            include_raw_content: false,
            exclude_domains: ['reddit.com', 'facebook.com']
        });

        console.log('✅ Advanced Search Response:');
        console.log('  - Results count:', response.results?.length || 0);
        console.log('  - Query processed:', response.query);
        console.log('  - Answer provided:', response.answer ? 'Yes' : 'No');

        if (response.answer) {
            console.log('  - Answer preview:', response.answer.substring(0, 100) + '...');
        }

        return response;
    } catch (error) {
        console.error('❌ Advanced search failed:', error.message);
        return null;
    }
}

async function testDartmouthSpecificSearch() {
    console.log('\n📝 Test 3: Dartmouth-Specific Domain Search');
    try {
        const query = 'computer science research opportunities site:dartmouth.edu OR site:students.dartmouth.edu';
        const response = await tvly.search(query, {
            include_answer: true,
            max_results: 5,
            search_depth: 'basic'
        });

        console.log('✅ Dartmouth Search Response:');
        console.log('  - Query:', query);
        console.log('  - Results count:', response.results?.length || 0);

        if (response.results?.length > 0) {
            console.log('  - Domains found:');
            response.results.forEach((result, i) => {
                try {
                    const url = new URL(result.url);
                    console.log(`    ${i + 1}. ${url.hostname} (Score: ${result.score})`);
                } catch (e) {
                    console.log(`    ${i + 1}. Invalid URL: ${result.url}`);
                }
            });
        }

        return response;
    } catch (error) {
        console.error('❌ Dartmouth search failed:', error.message);
        return null;
    }
}

async function runAllTests() {
    const results = {
        basic: await testBasicSearch(),
        advanced: await testAdvancedSearch(),
        dartmouth: await testDartmouthSpecificSearch()
    };

    console.log('\n📊 Test Summary:');
    console.log('  - Basic Search:', results.basic ? '✅ PASS' : '❌ FAIL');
    console.log('  - Advanced Search:', results.advanced ? '✅ PASS' : '❌ FAIL');
    console.log('  - Dartmouth Search:', results.dartmouth ? '✅ PASS' : '❌ FAIL');

    const passCount = Object.values(results).filter(Boolean).length;
    console.log(`\n🎯 Overall: ${passCount}/3 tests passed`);

    if (passCount === 3) {
        console.log('🎉 All Tavily tests PASSED! API integration is working correctly.');
    } else {
        console.log('⚠️  Some Tavily tests failed. Check API key and network connectivity.');
    }

    return results;
}

// Run the tests
runAllTests().catch(console.error);