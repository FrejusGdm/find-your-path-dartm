#!/usr/bin/env node

/**
 * Test Runner Orchestration Script
 * Runs all search integration tests in sequence and provides comprehensive analysis
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const TESTS = [
    {
        name: 'Tavily Standalone',
        file: 'test-tavily-standalone.js',
        description: 'Tests Tavily API in isolation',
        critical: true
    },
    {
        name: 'AI SDK Tools',
        file: 'test-ai-sdk-tools.js',
        description: 'Tests AI SDK multi-step tool calling',
        critical: true
    },
    {
        name: 'Search Integration',
        file: 'test-search-integration.js',
        description: 'Tests complete search integration flow',
        critical: true
    }
];

console.log('🚀 Search Integration Test Suite Runner\n');
console.log('=' .repeat(60));

function runTest(test) {
    console.log(`\n📋 Running: ${test.name}`);
    console.log(`📝 Description: ${test.description}`);
    console.log(`📄 File: ${test.file}`);
    console.log('-'.repeat(40));

    const testPath = path.join(process.cwd(), test.file);

    if (!existsSync(testPath)) {
        console.error(`❌ Test file not found: ${test.file}`);
        return { success: false, error: 'File not found' };
    }

    try {
        const startTime = Date.now();
        const output = execSync(`node ${test.file}`, {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'pipe'],
            timeout: 120000 // 2 minutes timeout
        });
        const duration = Date.now() - startTime;

        console.log(output);
        console.log(`⏱️  Duration: ${duration}ms`);

        // Analyze output for success indicators
        const success = output.includes('PASSED') || (
            output.includes('✅') &&
            !output.includes('❌ FAIL') &&
            !output.includes('failed:')
        );

        return { success, output, duration };
    } catch (error) {
        console.error(`❌ Test failed with error:`);
        console.error(error.stdout || error.message);
        if (error.stderr) {
            console.error('STDERR:', error.stderr);
        }
        return { success: false, error: error.message, output: error.stdout };
    }
}

function analyzeResults(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE TEST ANALYSIS');
    console.log('='.repeat(60));

    const totalTests = results.length;
    const passedTests = results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;

    console.log(`\n📈 Overall Results:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests} ✅`);
    console.log(`   Failed: ${failedTests} ❌`);
    console.log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

    console.log(`\n📋 Individual Results:`);
    results.forEach((result, index) => {
        const test = TESTS[index];
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        const duration = result.duration ? `${result.duration}ms` : 'N/A';
        console.log(`   ${test.name}: ${status} (${duration})`);
    });

    // Specific analysis based on test outputs
    console.log(`\n🔍 Detailed Analysis:`);

    // Tavily API Analysis
    const tavilyResult = results[0];
    if (tavilyResult?.success) {
        console.log(`   ✅ Tavily API: Working correctly`);
    } else {
        console.log(`   ❌ Tavily API: Check API key and network connectivity`);
    }

    // AI SDK Analysis
    const aiSdkResult = results[1];
    if (aiSdkResult?.success) {
        console.log(`   ✅ AI SDK: stopWhen: stepCountIs(5) working correctly`);
    } else {
        console.log(`   ❌ AI SDK: Tool calling or multi-step behavior has issues`);
        if (aiSdkResult?.output?.includes('finishReason: "tool-calls"')) {
            console.log(`      → Problem: AI stopping at tool calls without response`);
        }
    }

    // Integration Analysis
    const integrationResult = results[2];
    if (integrationResult?.success) {
        console.log(`   ✅ Integration: Complete search flow working`);
    } else {
        console.log(`   ❌ Integration: Search integration has issues`);
        if (integrationResult?.output?.includes('tool-calls issue detected')) {
            console.log(`      → Problem: Matches application logs issue`);
        }
    }

    // Root Cause Analysis
    console.log(`\n🎯 Root Cause Analysis:`);

    if (passedTests === totalTests) {
        console.log(`   🎉 All systems working! The fix should resolve the application issue.`);
        console.log(`   📋 Next Step: Restart the application server to apply the fix.`);
    } else if (!tavilyResult?.success) {
        console.log(`   🔧 Primary Issue: Tavily API configuration`);
        console.log(`   💡 Solution: Check TAVILY_API_KEY in .env.local`);
    } else if (!aiSdkResult?.success) {
        console.log(`   🔧 Primary Issue: AI SDK tool calling behavior`);
        console.log(`   💡 Solution: Verify stopWhen: stepCountIs(5) implementation`);
    } else if (!integrationResult?.success) {
        console.log(`   🔧 Primary Issue: Search integration flow`);
        console.log(`   💡 Solution: Check system prompt and tool configuration`);
    }

    // Application Impact Assessment
    console.log(`\n📱 Application Impact:`);

    if (integrationResult?.output?.includes('isFixed: true')) {
        console.log(`   ✅ The application issue should be RESOLVED`);
        console.log(`   📋 Expected behavior: AI will generate responses after search`);
    } else if (integrationResult?.output?.includes('hasToolCallsIssue: true')) {
        console.log(`   ❌ The application issue PERSISTS in tests`);
        console.log(`   📋 Current behavior: AI stops at tool calls (finishReason: 'tool-calls')`);
    } else {
        console.log(`   ⚠️  Cannot determine application impact from test results`);
    }

    return {
        totalTests,
        passedTests,
        failedTests,
        successRate: Math.round((passedTests / totalTests) * 100),
        allPassed: passedTests === totalTests
    };
}

async function main() {
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    console.log(`📁 Working directory: ${process.cwd()}`);

    const results = [];

    for (const test of TESTS) {
        const result = runTest(test);
        results.push(result);

        // If critical test fails, note it but continue
        if (!result.success && test.critical) {
            console.log(`⚠️  Critical test failed, continuing with remaining tests...`);
        }
    }

    const analysis = analyzeResults(results);

    console.log(`\n📅 Completed at: ${new Date().toISOString()}`);
    console.log('='.repeat(60));

    // Exit with appropriate code
    process.exit(analysis.allPassed ? 0 : 1);
}

// Handle unexpected errors
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run the test suite
main();