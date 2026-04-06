/**
 * Family Memoir App — End-to-End Webhook Test
 *
 * Simulates a Twilio WhatsApp webhook POST to verify the full pipeline.
 *
 * Usage:
 *   1. Start the server: npm run webhook
 *   2. In another terminal: npm test
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = `http://localhost:${process.env.PORT || 3000}`;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const testPayload = new URLSearchParams({
  MessageSid: 'TEST_' + Date.now(),
  From: 'whatsapp:+31600000000',
  To: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
  Body: 'Daniel said the funniest thing at dinner tonight! He called the moon a "night sun" #Daniel #funny #dinner',
  NumMedia: '0',
});

async function runTests() {
  console.log('='.repeat(60));
  console.log('Family Memoir App — End-to-End Webhook Test');
  console.log('='.repeat(60));

  // Test 1: Health Check
  console.log('\n[Test 1] Health check...');
  try {
    const healthRes = await fetch(`${BASE_URL}/`);
    const health = await healthRes.json();
    assert(health.status === 'ok', 'Health check should return ok');
    pass('Health check passed');
  } catch (err) {
    fail('Health check failed — is the server running? (npm run webhook)', err);
    return;
  }

  // Test 2: Send Webhook
  console.log('\n[Test 2] Sending test webhook...');
  try {
    const webhookRes = await fetch(`${BASE_URL}/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: testPayload.toString(),
    });
    assert(webhookRes.status === 200, `Expected 200, got ${webhookRes.status}`);
    pass('Webhook accepted (200)');
  } catch (err) {
    fail('Webhook request failed', err);
    return;
  }

  // Test 3: Verify Memory in Database
  console.log('\n[Test 3] Verifying memory in Supabase...');
  await new Promise((r) => setTimeout(r, 1500));

  try {
    const { data: memories, error } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    assert(!error, `Database query failed: ${error?.message}`);
    assert(memories.length > 0, 'No memories found in database');

    const memory = memories[0];
    console.log('  Memory found:');
    console.log(`    ID:     ${memory.id}`);
    console.log(`    Date:   ${memory.memory_date}`);
    console.log(`    Text:   ${memory.text}`);
    console.log(`    People: ${JSON.stringify(memory.people)}`);
    console.log(`    Tags:   ${JSON.stringify(memory.tags)}`);
    console.log(`    Source: ${memory.source}`);
    console.log(`    Author: ${memory.author}`);

    assert(memory.text.includes('Daniel said the funniest thing'), 'Text should contain the message');
    assert(memory.people.includes('Daniel'), 'People should include Daniel');
    assert(memory.tags.includes('funny'), 'Tags should include funny');
    assert(memory.tags.includes('dinner'), 'Tags should include dinner');
    assert(memory.source === 'whatsapp_dm', 'Source should be whatsapp_dm');
    pass('Memory correctly stored and parsed');

    // Cleanup
    console.log('\n[Cleanup] Removing test memory...');
    await supabase.from('memories').delete().eq('id', memory.id);
    pass('Test memory cleaned up');
  } catch (err) {
    fail('Database verification failed', err);
  }

  console.log('\n' + '='.repeat(60));
  console.log('All tests completed!');
  console.log('='.repeat(60));
}

function assert(condition, message) { if (!condition) throw new Error(message); }
function pass(msg) { console.log(`  \x1b[32m\u2713 ${msg}\x1b[0m`); }
function fail(msg, err) { console.error(`  \x1b[31m\u2717 ${msg}\x1b[0m`); if (err) console.error(`    ${err.message || err}`); }

runTests().catch(console.error);
