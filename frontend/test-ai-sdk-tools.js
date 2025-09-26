#!/usr/bin/env node

/**
 * AI SDK v5 Tool Calling Test
 * Tests streamText with stopWhen: stepCountIs(5) to verify multi-step tool calling
 */

import { streamText, stepCountIs, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../frontend/.env.local' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('🤖 AI SDK Tool Calling Test Starting...\n');

if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not configured');
    process.exit(1);
}

console.log('✅ OpenAI API Key Status: Configured');

// Mock tools to test multi-step behavior
const testTools = {
    getWeather: tool({
        description: 'Get the current weather for a location',
        inputSchema: z.object({
            location: z.string().describe('The location to get weather for'),
        }),
        execute: async ({ location }) => {
            console.log(`🔧 Tool Executed: getWeather("${location}")`);
            const temp = Math.round(Math.random() * (30 - 10) + 10);
            return `The weather in ${location} is ${temp}°C and sunny`;
        },
    }),

    searchInfo: tool({
        description: 'Search for information on a topic',
        inputSchema: z.object({
            query: z.string().describe('What to search for'),
        }),
        execute: async ({ query }) => {
            console.log(`🔧 Tool Executed: searchInfo("${query}")`);
            return `Here is information about ${query}: This is a mock result for testing purposes. The search found relevant information and returned it successfully.`;
        },
    }),

    calculateValue: tool({
        description: 'Calculate a mathematical expression',
        inputSchema: z.object({
            expression: z.string().describe('Mathematical expression to calculate'),
        }),
        execute: async ({ expression }) => {
            console.log(`🔧 Tool Executed: calculateValue("${expression}")`);
            // Simple mock calculation
            if (expression.includes('+')) {
                const parts = expression.split('+');
                const result = parts.reduce((sum, part) => sum + parseInt(part.trim()), 0);
                return `The result of ${expression} is ${result}`;
            }
            return `The result of ${expression} is 42 (mock calculation)`;
        },
    }),
};

async function testBasicToolCall() {
    console.log('\n📝 Test 1: Basic Single Tool Call');
    try {
        const result = streamText({
            model: openai('gpt-4-turbo'),
            system: 'You are a helpful assistant. Use tools when needed and provide complete responses.',
            messages: [{ role: 'user', content: 'What is the weather like in New York?' }],
            tools: testTools,
            stopWhen: stepCountIs(1), // Single step to test basic tool calling
        });

        let fullResponse = '';
        let toolCalls = [];
        let stepCount = 0;

        for await (const delta of result.fullStream) {
            if (delta.type === 'step-finish') {
                stepCount++;
                console.log(`  Step ${stepCount} finished:`, delta.finishReason);
            }

            if (delta.type === 'tool-call') {
                toolCalls.push(delta);
                console.log(`  Tool Call: ${delta.toolName}(${JSON.stringify(delta.args)})`);
            }

            if (delta.type === 'text-delta') {
                fullResponse += delta.textDelta;
            }
        }

        console.log('✅ Basic Tool Call Result:');
        console.log('  - Steps executed:', stepCount);
        console.log('  - Tool calls made:', toolCalls.length);
        console.log('  - Response length:', fullResponse.length);
        console.log('  - Response preview:', fullResponse.substring(0, 100) + '...');

        return { stepCount, toolCalls: toolCalls.length, responseLength: fullResponse.length };
    } catch (error) {
        console.error('❌ Basic tool call failed:', error.message);
        return null;
    }
}

async function testMultiStepToolCall() {
    console.log('\n📝 Test 2: Multi-Step Tool Calling (stopWhen: stepCountIs(5))');
    try {
        const result = streamText({
            model: openai('gpt-4-turbo'),
            system: 'You are a helpful assistant. Use tools to gather information, then provide a comprehensive response based on the tool results.',
            messages: [{
                role: 'user',
                content: 'Search for information about climate change, then tell me about the weather patterns it affects, and calculate 2+3+5 for me as well.'
            }],
            tools: testTools,
            stopWhen: stepCountIs(5), // Multi-step to test our fix
        });

        let fullResponse = '';
        let toolCalls = [];
        let stepCount = 0;
        let finishReason = '';

        for await (const delta of result.fullStream) {
            if (delta.type === 'step-finish') {
                stepCount++;
                finishReason = delta.finishReason;
                console.log(`  Step ${stepCount} finished:`, delta.finishReason);
            }

            if (delta.type === 'tool-call') {
                toolCalls.push(delta);
                console.log(`  Tool Call: ${delta.toolName}(${JSON.stringify(delta.args)})`);
            }

            if (delta.type === 'text-delta') {
                fullResponse += delta.textDelta;
            }
        }

        console.log('✅ Multi-Step Tool Call Result:');
        console.log('  - Steps executed:', stepCount);
        console.log('  - Tool calls made:', toolCalls.length);
        console.log('  - Final finish reason:', finishReason);
        console.log('  - Response length:', fullResponse.length);
        console.log('  - Response preview:', fullResponse.substring(0, 200) + '...');

        const success = fullResponse.length > 0 && finishReason !== 'tool-calls';
        return {
            stepCount,
            toolCalls: toolCalls.length,
            responseLength: fullResponse.length,
            finishReason,
            success
        };
    } catch (error) {
        console.error('❌ Multi-step tool call failed:', error.message);
        return null;
    }
}

async function testStopWhenBehavior() {
    console.log('\n📝 Test 3: Verify stopWhen: stepCountIs(5) Behavior');
    try {
        const result = streamText({
            model: openai('gpt-4-turbo'),
            system: 'You are a helpful assistant. After using tools, always provide a final response explaining what you learned.',
            messages: [{
                role: 'user',
                content: 'Please search for "Dartmouth research opportunities" and then give me a summary.'
            }],
            tools: testTools,
            stopWhen: stepCountIs(5),
        });

        let fullResponse = '';
        let stepCount = 0;
        let finishReason = '';
        let hasToolCall = false;
        let hasTextAfterTool = false;
        let lastStepType = '';

        for await (const delta of result.fullStream) {
            if (delta.type === 'step-finish') {
                stepCount++;
                finishReason = delta.finishReason;
                lastStepType = 'step-finish';
                console.log(`  Step ${stepCount} finished:`, delta.finishReason);
            }

            if (delta.type === 'tool-call') {
                hasToolCall = true;
                console.log(`  Tool Call: ${delta.toolName}`);
            }

            if (delta.type === 'text-delta') {
                if (hasToolCall) hasTextAfterTool = true;
                fullResponse += delta.textDelta;
                lastStepType = 'text-delta';
            }
        }

        const behaviorCorrect = hasToolCall && hasTextAfterTool && finishReason === 'stop';

        console.log('✅ stopWhen Behavior Analysis:');
        console.log('  - Had tool call:', hasToolCall ? '✅' : '❌');
        console.log('  - Generated text after tool:', hasTextAfterTool ? '✅' : '❌');
        console.log('  - Finish reason:', finishReason);
        console.log('  - Behavior correct:', behaviorCorrect ? '✅' : '❌');
        console.log('  - Last step type:', lastStepType);

        return {
            stepCount,
            hasToolCall,
            hasTextAfterTool,
            finishReason,
            behaviorCorrect,
            responseLength: fullResponse.length
        };
    } catch (error) {
        console.error('❌ stopWhen behavior test failed:', error.message);
        return null;
    }
}

async function runAllTests() {
    const results = {
        basic: await testBasicToolCall(),
        multiStep: await testMultiStepToolCall(),
        stopWhen: await testStopWhenBehavior()
    };

    console.log('\n📊 AI SDK Test Summary:');
    console.log('  - Basic Tool Call:', results.basic ? '✅ PASS' : '❌ FAIL');
    console.log('  - Multi-Step Tool Call:', results.multiStep?.success ? '✅ PASS' : '❌ FAIL');
    console.log('  - stopWhen Behavior:', results.stopWhen?.behaviorCorrect ? '✅ PASS' : '❌ FAIL');

    const passCount = [results.basic, results.multiStep?.success, results.stopWhen?.behaviorCorrect].filter(Boolean).length;
    console.log(`\n🎯 Overall: ${passCount}/3 tests passed`);

    if (passCount === 3) {
        console.log('🎉 All AI SDK tests PASSED! stopWhen: stepCountIs(5) is working correctly.');
    } else {
        console.log('⚠️  Some AI SDK tests failed. The stopWhen configuration may need adjustment.');

        if (results.multiStep && !results.multiStep.success) {
            console.log(`   Multi-step issue: finishReason="${results.multiStep.finishReason}", responseLength=${results.multiStep.responseLength}`);
        }
    }

    return results;
}

// Run the tests
runAllTests().catch(console.error);