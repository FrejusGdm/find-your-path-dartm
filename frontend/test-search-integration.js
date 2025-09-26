#!/usr/bin/env node

/**
 * Search Integration Test
 * Tests the complete flow: AI SDK + Tavily search integration
 * Replicates the exact scenario from the chat application
 */

import { streamText, stepCountIs, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { tavily } from '@tavily/core';
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../frontend/.env.local' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

console.log('🔗 Search Integration Test Starting...\n');

if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not configured');
    process.exit(1);
}

if (!TAVILY_API_KEY || TAVILY_API_KEY === 'tvly-YOUR_TAVILY_API_KEY_HERE') {
    console.error('❌ TAVILY_API_KEY not configured properly');
    process.exit(1);
}

console.log('✅ API Keys Status: Both configured');

// Initialize Tavily client
const tvly = tavily({ apiKey: TAVILY_API_KEY });

// Dartmouth domains for search filtering
const DARTMOUTH_DOMAINS = [
    'students.dartmouth.edu',
    'dartmouth.edu',
    'admissions.dartmouth.edu',
    'engineering.dartmouth.edu',
    'dali.dartmouth.edu',
    'dickey.dartmouth.edu',
    'rockefeller.dartmouth.edu',
    'hop.dartmouth.edu',
    'wisp.dartmouth.edu',
    'ugar.dartmouth.edu',
    'tucker.dartmouth.edu'
];

// Replicate the exact searchCurrentDartmouthInfo tool from the application
const searchCurrentDartmouthInfo = tool({
    description: 'Search for current information not found in the database, such as recent deadlines, new programs, or updated contact information. This searches official Dartmouth websites for the most current information.',
    inputSchema: z.object({
        query: z.string().describe('Search query for current Dartmouth information'),
        context: z.string().optional().describe('Additional context about what the user is looking for')
    }),
    execute: async ({ query, context }) => {
        const requestId = Math.random().toString(36).substring(2, 8);
        console.log(`🔍 [Tavily Tool ${requestId}] Starting execution with:`, { query, context });

        try {
            // Enhance query with Dartmouth context (exact replica from app)
            const enhancedQuery = `${query} site:dartmouth.edu OR site:students.dartmouth.edu`;

            console.log(`🔍 [Tavily Tool ${requestId}] Calling searchDartmouthInfo with: "${enhancedQuery}"`);

            const searchResponse = await tvly.search(enhancedQuery, {
                include_answer: true,
                max_results: 3,
                search_depth: 'advanced',
                include_raw_content: false,
                exclude_domains: ['reddit.com', 'facebook.com', 'instagram.com', 'twitter.com']
            });

            console.log(`🔍 [Tavily Tool ${requestId}] Search completed:`, {
                resultsCount: searchResponse.results?.length || 0,
                hasAnswer: !!searchResponse.answer,
                confidence: searchResponse.results?.length > 0 ? 0.8 : 0.5
            });

            // Process and score results based on domain authority (exact replica)
            const processedResults = searchResponse.results.map((result) => {
                let domain = '';
                try {
                    const url = new URL(result.url);
                    domain = url.hostname.toLowerCase();
                } catch (error) {
                    console.warn(`[Tavily Search] Invalid URL: ${result.url}`, error);
                    domain = result.url.replace(/^https?:\/\//, '').split('/')[0].toLowerCase();
                }

                const isDartmouthOfficial = DARTMOUTH_DOMAINS.some(dartmouthDomain =>
                    domain === dartmouthDomain || domain.endsWith('.' + dartmouthDomain)
                );

                let adjustedScore = result.score || 0;
                if (isDartmouthOfficial) {
                    adjustedScore *= 1.5; // 50% boost for official sources
                }

                return {
                    title: result.title,
                    url: result.url,
                    content: result.content,
                    score: Math.min(adjustedScore, 1.0),
                    published_date: result.published_date,
                    source_domain: domain,
                    is_official_dartmouth: isDartmouthOfficial
                };
            });

            // Sort by adjusted score
            processedResults.sort((a, b) => b.score - a.score);

            // Calculate confidence
            const officialResults = processedResults.filter(r => r.is_official_dartmouth);
            const confidence = officialResults.length > 0 ?
                Math.min(0.9, 0.6 + (officialResults.length * 0.1)) :
                Math.min(0.5, processedResults.length > 0 ? processedResults[0].score : 0);

            const toolResult = {
                results: processedResults.slice(0, 3),
                answer: searchResponse.answer,
                query: enhancedQuery,
                confidence
            };

            console.log(`🔍 [Tavily Tool ${requestId}] Returning tool result with ${toolResult.results.length} results`);

            return toolResult;
        } catch (error) {
            console.error(`🚨 [Tavily Tool ${requestId}] Error:`, error.message);
            throw new Error(`Search failed: ${error.message}`);
        }
    }
});

async function testBasicSearchIntegration() {
    console.log('\n📝 Test 1: Basic Search Integration');
    try {
        const result = streamText({
            model: openai('gpt-4-turbo'),
            system: `You are a helpful assistant for Dartmouth students. When you use the search tool, always provide a response based on the search results.

SEARCH RESULT HANDLING:
- IMPORTANT: After calling searchCurrentDartmouthInfo, you MUST generate a response using the search results
- Analyze the search results and provide helpful information
- Include relevant URLs and details from the search results`,
            messages: [{
                role: 'user',
                content: 'I need current information about CS research opportunities at Dartmouth'
            }],
            tools: { searchCurrentDartmouthInfo },
            stopWhen: stepCountIs(5),
        });

        let fullResponse = '';
        let toolCalls = [];
        let stepCount = 0;
        let finishReason = '';
        let toolResults = [];

        for await (const delta of result.fullStream) {
            if (delta.type === 'step-finish') {
                stepCount++;
                finishReason = delta.finishReason;
                console.log(`  Step ${stepCount} finished:`, delta.finishReason);
            }

            if (delta.type === 'tool-call') {
                toolCalls.push(delta);
                console.log(`  🔧 Tool Call: ${delta.toolName}(${JSON.stringify(delta.args).substring(0, 50)}...)`);
            }

            if (delta.type === 'tool-result') {
                toolResults.push(delta);
                const resultSize = JSON.stringify(delta.result).length;
                console.log(`  📥 Tool Result: ${resultSize} bytes`);
            }

            if (delta.type === 'text-delta') {
                fullResponse += delta.textDelta;
            }
        }

        console.log('✅ Basic Search Integration Result:');
        console.log('  - Steps executed:', stepCount);
        console.log('  - Tool calls made:', toolCalls.length);
        console.log('  - Tool results received:', toolResults.length);
        console.log('  - Final finish reason:', finishReason);
        console.log('  - Response length:', fullResponse.length);

        if (fullResponse.length > 0) {
            console.log('  - Response preview:', fullResponse.substring(0, 200) + '...');
        }

        const success = toolCalls.length > 0 && toolResults.length > 0 && fullResponse.length > 0 && finishReason === 'stop';

        return {
            stepCount,
            toolCalls: toolCalls.length,
            toolResults: toolResults.length,
            responseLength: fullResponse.length,
            finishReason,
            success
        };
    } catch (error) {
        console.error('❌ Basic search integration failed:', error.message);
        return null;
    }
}

async function testComplexSearchScenario() {
    console.log('\n📝 Test 2: Complex Search Scenario (Multiple Queries)');
    try {
        const result = streamText({
            model: openai('gpt-4-turbo'),
            system: `You are a helpful assistant for Dartmouth students. Use the search tool to find current information, then provide comprehensive responses.

IMPORTANT: After using any tool, you MUST generate a text response based on the tool results.`,
            messages: [{
                role: 'user',
                content: 'Can you find information about Dartmouth computer science internship deadlines and also research opportunities for undergraduates?'
            }],
            tools: { searchCurrentDartmouthInfo },
            stopWhen: stepCountIs(8), // Allow for multiple searches
        });

        let fullResponse = '';
        let toolCalls = [];
        let stepCount = 0;
        let finishReason = '';
        let hasMultipleSearches = false;
        let responseAfterLastTool = false;

        for await (const delta of result.fullStream) {
            if (delta.type === 'step-finish') {
                stepCount++;
                finishReason = delta.finishReason;
                console.log(`  Step ${stepCount} finished:`, delta.finishReason);
            }

            if (delta.type === 'tool-call') {
                toolCalls.push(delta);
                if (toolCalls.length > 1) hasMultipleSearches = true;
                console.log(`  🔧 Tool Call ${toolCalls.length}: ${delta.toolName}`);
                responseAfterLastTool = false; // Reset flag
            }

            if (delta.type === 'text-delta') {
                fullResponse += delta.textDelta;
                if (toolCalls.length > 0) responseAfterLastTool = true;
            }
        }

        console.log('✅ Complex Search Scenario Result:');
        console.log('  - Steps executed:', stepCount);
        console.log('  - Tool calls made:', toolCalls.length);
        console.log('  - Multiple searches performed:', hasMultipleSearches ? '✅' : '❌');
        console.log('  - Response after last tool:', responseAfterLastTool ? '✅' : '❌');
        console.log('  - Final finish reason:', finishReason);
        console.log('  - Response length:', fullResponse.length);

        const success = toolCalls.length >= 1 && responseAfterLastTool && fullResponse.length > 0 && finishReason === 'stop';

        return {
            stepCount,
            toolCalls: toolCalls.length,
            hasMultipleSearches,
            responseAfterLastTool,
            responseLength: fullResponse.length,
            finishReason,
            success
        };
    } catch (error) {
        console.error('❌ Complex search scenario failed:', error.message);
        return null;
    }
}

async function testExactApplicationScenario() {
    console.log('\n📝 Test 3: Exact Application Scenario Replication');
    try {
        // This replicates the exact scenario from the logs
        const result = streamText({
            model: openai('gpt-4-turbo'),
            system: `You are a friendly AI assistant helping Dartmouth students discover opportunities through personalized guidance.

Use casual but informative language. When you find information through search tools, always provide a helpful response that summarizes what you found and includes next steps or relevant details.

SEARCH RESULT HANDLING:
- IMPORTANT: After calling searchCurrentDartmouthInfo, you MUST generate a response using the search results
- Provide specific details from the search results
- Include URLs when available
- Offer actionable next steps`,
            messages: [{
                role: 'user',
                content: 'I need current information about: cs research opportunities'
            }],
            tools: { searchCurrentDartmouthInfo },
            stopWhen: stepCountIs(5),
        });

        let fullResponse = '';
        let toolExecutions = [];
        let stepCount = 0;
        let finishReason = '';
        let finalTextAfterTools = '';

        for await (const delta of result.fullStream) {
            if (delta.type === 'step-finish') {
                stepCount++;
                finishReason = delta.finishReason;
                console.log(`  Step ${stepCount} finished:`, delta.finishReason);

                if (delta.finishReason === 'tool-calls') {
                    console.log('  ⚠️  Step finished with tool-calls (this should continue)');
                }
            }

            if (delta.type === 'tool-call') {
                toolExecutions.push({ type: 'call', ...delta });
                console.log(`  🔧 Tool Call: ${delta.toolName}`);
            }

            if (delta.type === 'tool-result') {
                toolExecutions.push({ type: 'result', ...delta });
                const results = delta.result?.results || [];
                console.log(`  📥 Tool Result: ${results.length} search results`);
            }

            if (delta.type === 'text-delta') {
                fullResponse += delta.textDelta;
                if (toolExecutions.length > 0) {
                    finalTextAfterTools += delta.textDelta;
                }
            }
        }

        console.log('✅ Exact Application Scenario Result:');
        console.log('  - Steps executed:', stepCount);
        console.log('  - Tool executions:', toolExecutions.length);
        console.log('  - Final finish reason:', finishReason);
        console.log('  - Total response length:', fullResponse.length);
        console.log('  - Text after tools:', finalTextAfterTools.length);

        // This is the critical test: does it match the problematic behavior from logs?
        const hasToolCallsIssue = finishReason === 'tool-calls' && fullResponse.length === 0;
        const isFixed = finishReason === 'stop' && fullResponse.length > 0;

        console.log('  - Has tool-calls issue (like logs):', hasToolCallsIssue ? '❌ YES (problem)' : '✅ NO (good)');
        console.log('  - Is fixed (generates response):', isFixed ? '✅ YES (good)' : '❌ NO (problem)');

        if (isFixed) {
            console.log('  - Response preview:', fullResponse.substring(0, 150) + '...');
        }

        return {
            stepCount,
            toolExecutions: toolExecutions.length,
            finishReason,
            responseLength: fullResponse.length,
            textAfterTools: finalTextAfterTools.length,
            hasToolCallsIssue,
            isFixed,
            success: isFixed
        };
    } catch (error) {
        console.error('❌ Exact application scenario failed:', error.message);
        return null;
    }
}

async function runAllTests() {
    const results = {
        basic: await testBasicSearchIntegration(),
        complex: await testComplexSearchScenario(),
        exact: await testExactApplicationScenario()
    };

    console.log('\n📊 Search Integration Test Summary:');
    console.log('  - Basic Integration:', results.basic?.success ? '✅ PASS' : '❌ FAIL');
    console.log('  - Complex Scenario:', results.complex?.success ? '✅ PASS' : '❌ FAIL');
    console.log('  - Exact App Scenario:', results.exact?.success ? '✅ PASS' : '❌ FAIL');

    const passCount = [results.basic?.success, results.complex?.success, results.exact?.success].filter(Boolean).length;
    console.log(`\n🎯 Overall: ${passCount}/3 tests passed`);

    if (results.exact?.hasToolCallsIssue) {
        console.log('\n🔍 DIAGNOSIS: Tool-calls issue detected!');
        console.log('   This matches the problem seen in application logs.');
        console.log('   The AI is stopping after tool calls without generating responses.');
    } else if (results.exact?.isFixed) {
        console.log('\n🎉 SUCCESS: stopWhen: stepCountIs(5) fix is working!');
        console.log('   The AI is now generating responses after tool calls.');
    }

    if (passCount === 3) {
        console.log('\n🎉 All search integration tests PASSED! The fix should work in the application.');
    } else {
        console.log('\n⚠️  Some tests failed. Review the configuration or system prompt.');
    }

    return results;
}

// Run the tests
runAllTests().catch(console.error);