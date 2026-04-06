/**
 * Family Memoir App — Webhook Server
 *
 * Express server that receives Twilio WhatsApp webhooks,
 * processes the message, and stores memories in Supabase.
 *
 * Flow for NEW memories:
 * 1. Twilio POSTs incoming WhatsApp message to /webhook
 * 2. Parse text, extract hashtags, classify into people/places/tags
 * 3. If photo attached: download, upload to Supabase Storage
 * 4. Insert memory record into Supabase
 * 5. Ask follow-up: "Where was this?" → then "Who's in this?"
 *
 * Flow for REPLIES to follow-up questions:
 * 1. Check pending_questions for this phone number
 * 2. If pending → handle the reply (update memory) → ask next question or finish
 * 3. If no pending → treat as new memory (flow above)
 */

import express from 'express';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import config from './config.js';
import { parseMessage } from './lib/parseMessage.js';
import { extractExif } from './lib/exifExtract.js';
import { reverseGeocode } from './lib/geocode.js';
import { uploadPhoto } from './lib/storage.js';
import {
  getPendingQuestion,
  clearPendingQuestions,
  askLocation,
  askPeople,
  handleLocationReply,
  handlePeopleReply,
} from './lib/conversation.js';

// Supabase client with service role (bypasses RLS for backend operations)
const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);

const app = express();

// Twilio sends application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', app: 'Family Memoir App', version: '2.0.0' });
});

// --- Main Webhook Endpoint ---
app.post('/webhook', async (req, res) => {
  try {
    const {
      Body: body,
      From: from,
      NumMedia: numMedia,
      Latitude: latitude,
      Longitude: longitude,
    } = req.body;

    const phoneNumber = from.replace('whatsapp:', '');
    const mediaCount = parseInt(numMedia, 10) || 0;
    const hasMedia = mediaCount > 0;
    const hasHashtags = body && /#\w+/.test(body);
    const lat = latitude ? parseFloat(latitude) : null;
    const lon = longitude ? parseFloat(longitude) : null;

    console.log(`\n--- Incoming message from ${from} ---`);
    console.log(`Text: ${body || '(none)'}`);
    console.log(`Media: ${mediaCount} attachment(s)`);
    if (lat != null) console.log(`Location: ${lat}, ${lon}`);

    // --- Fetch shared data ---
    const { data: knownPeopleRows } = await supabase
      .from('known_people')
      .select('name');
    const knownPeople = (knownPeopleRows || []).map((r) => r.name);

    // --- Check for pending follow-up question ---
    const pending = await getPendingQuestion(supabase, phoneNumber);

    if (pending && !hasMedia && !hasHashtags) {
      // This looks like a reply to our follow-up question
      console.log(`Handling reply to ${pending.question_type} question for memory ${pending.memory_id}`);

      if (pending.question_type === 'location') {
        await handleLocationReply(supabase, phoneNumber, pending.memory_id, body, lat, lon);

        // Get the current people tags on this memory
        const { data: memory } = await supabase
          .from('memories')
          .select('people')
          .eq('id', pending.memory_id)
          .single();

        // Now ask about people
        await askPeople(supabase, from, pending.memory_id, knownPeople, memory?.people || []);

      } else if (pending.question_type === 'people') {
        await handlePeopleReply(supabase, phoneNumber, pending.memory_id, body, knownPeople);
        await clearPendingQuestions(supabase, phoneNumber);

        // All done — send a simple confirmation
        const twilio = (await import('twilio')).default;
        const client = twilio(config.twilioAccountSid, config.twilioAuthToken);
        await client.messages.create({
          body: 'All done! ✨',
          from: config.twilioWhatsAppNumber,
          to: from,
        });
      }

      res.status(200).send('<Response></Response>');
      return;
    }

    // --- New memory flow ---
    // Clear any stale pending questions
    if (pending) {
      await clearPendingQuestions(supabase, phoneNumber);
    }

    // Parse message text
    const { cleanText, people, places, tags } = parseMessage(body, knownPeople);

    // Look up the author
    const { data: phoneUser } = await supabase
      .from('phone_users')
      .select('display_name')
      .eq('phone_number', phoneNumber)
      .single();
    const author = phoneUser?.display_name || phoneNumber;

    // Process attached photos
    const photoPaths = [];
    let exifDate = null;

    const memoryId = crypto.randomUUID();

    for (let i = 0; i < mediaCount; i++) {
      const mediaUrl = req.body[`MediaUrl${i}`];
      const mediaContentType = req.body[`MediaContentType${i}`];
      if (!mediaUrl) continue;

      console.log(`Processing media ${i}: ${mediaContentType}`);

      try {
        const storagePath = await uploadPhoto(supabase, mediaUrl, memoryId, i);
        if (storagePath) photoPaths.push(storagePath);
      } catch (photoErr) {
        console.error(`Failed to process media ${i}:`, photoErr.message);
      }
    }

    // Determine memory_date
    const memoryDate = exifDate
      ? new Date(exifDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    // Insert memory record
    const memoryRecord = {
      id: memoryId,
      memory_date: memoryDate,
      text: cleanText || null,
      people,
      places,
      tags,
      photos: photoPaths,
      source: 'whatsapp_dm',
      author,
      organisation: [],
    };

    const { data: insertedMemory, error: insertError } = await supabase
      .from('memories')
      .insert(memoryRecord)
      .select()
      .single();

    if (insertError) {
      console.error('Failed to insert memory:', insertError.message);
      res.status(500).send('Database error');
      return;
    }

    console.log(`Memory saved: ${insertedMemory.id}`);

    // Start follow-up conversation — ask about location
    const preview = cleanText
      ? cleanText.substring(0, 40) + (cleanText.length > 40 ? '...' : '')
      : '(photo)';

    await askLocation(supabase, from, memoryId, preview);

    // Respond to Twilio (must return 200)
    res.status(200).send('<Response></Response>');
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Internal server error');
  }
});

app.listen(config.port, () => {
  console.log(`Family Memoir webhook server running on port ${config.port}`);
  console.log(`Webhook URL: http://localhost:${config.port}/webhook`);
});
