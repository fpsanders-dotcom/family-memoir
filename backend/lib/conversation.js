/**
 * Family Memoir App — Conversation Handler
 *
 * Manages the follow-up question flow after a memory is saved.
 *
 * Flow:
 * 1. Memory saved → ask about location
 * 2. User replies about location → update memory → ask about people
 * 3. User replies about people → update memory → done
 *
 * If the user sends a new memory (with media or hashtags) instead of
 * answering, the pending question is discarded and a new memory is created.
 */

import twilio from 'twilio';
import config from '../config.js';

const twilioClient = twilio(config.twilioAccountSid, config.twilioAuthToken);

/**
 * Check if there's a pending question for this phone number.
 * Returns the pending question row or null.
 */
export async function getPendingQuestion(supabase, phoneNumber) {
  const now = new Date().toISOString();

  // Clean up expired questions first
  await supabase
    .from('pending_questions')
    .delete()
    .lt('expires_at', now);

  // Get the most recent pending question for this user
  const { data, error } = await supabase
    .from('pending_questions')
    .select('*')
    .eq('phone_number', phoneNumber)
    .gt('expires_at', now)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Create a pending question for a user.
 */
export async function createPendingQuestion(supabase, phoneNumber, memoryId, questionType) {
  // Remove any existing pending questions for this user
  await supabase
    .from('pending_questions')
    .delete()
    .eq('phone_number', phoneNumber);

  // Create new pending question (expires in 1 hour)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await supabase.from('pending_questions').insert({
    phone_number: phoneNumber,
    memory_id: memoryId,
    question_type: questionType,
    expires_at: expiresAt,
  });
}

/**
 * Clear all pending questions for a user.
 */
export async function clearPendingQuestions(supabase, phoneNumber) {
  await supabase
    .from('pending_questions')
    .delete()
    .eq('phone_number', phoneNumber);
}

/**
 * Send the location question after a memory is saved.
 */
export async function askLocation(supabase, to, memoryId, memoryPreview) {
  const phoneNumber = to.replace('whatsapp:', '');

  await createPendingQuestion(supabase, phoneNumber, memoryId, 'location');

  const body =
    `Memory saved! ✓\n` +
    `"${memoryPreview}"\n\n` +
    `📍 *Where was this?*\n` +
    `1️⃣ Share your location (tap 📎 → Location)\n` +
    `2️⃣ Home\n` +
    `3️⃣ Type a place name\n` +
    `4️⃣ Skip`;

  await sendWhatsApp(to, body);
}

/**
 * Send the people question after location is handled.
 */
export async function askPeople(supabase, to, memoryId, knownPeople, alreadyTagged) {
  const phoneNumber = to.replace('whatsapp:', '');

  // Filter out people already tagged via hashtags
  const remaining = knownPeople.filter(
    (p) => !alreadyTagged.map((t) => t.toLowerCase()).includes(p.toLowerCase())
  );

  if (remaining.length === 0) {
    // Everyone is already tagged or no known people
    await clearPendingQuestions(supabase, phoneNumber);
    await sendWhatsApp(to, `All done! ✨`);
    return;
  }

  await createPendingQuestion(supabase, phoneNumber, memoryId, 'people');

  // Build numbered list of people
  const peopleList = remaining
    .map((name, i) => `${i + 1}️⃣ ${name}`)
    .join('\n');

  const body =
    `👥 *Who's in this memory?*\n` +
    `${peopleList}\n\n` +
    `Reply with numbers (e.g. "1 3") or names.\n` +
    `Type "skip" to finish.`;

  await sendWhatsApp(to, body);
}

/**
 * Handle a reply to the location question.
 * Returns true if handled, false if this wasn't a valid reply.
 */
export async function handleLocationReply(supabase, phoneNumber, memoryId, body, latitude, longitude) {
  const bodyLower = (body || '').trim().toLowerCase();

  let place = null;

  // Check if the user shared a WhatsApp location pin
  if (latitude != null && longitude != null) {
    // Reverse geocode
    const { reverseGeocode } = await import('./geocode.js');
    place = await reverseGeocode(latitude, longitude);
    console.log(`Location shared: ${latitude}, ${longitude} → ${place}`);
  } else if (bodyLower === '2' || bodyLower === 'home' || bodyLower === 'thuis') {
    place = 'Home';
  } else if (bodyLower === '4' || bodyLower === 'skip' || bodyLower === 'overslaan') {
    // Skip — no update needed
    place = null;
  } else if (bodyLower !== '1') {
    // User typed a place name (option 3)
    place = body.trim();
  }

  // Update the memory if we have a place
  if (place) {
    const { data: memory } = await supabase
      .from('memories')
      .select('places')
      .eq('id', memoryId)
      .single();

    const existingPlaces = memory?.places || [];
    const updatedPlaces = [...new Set([...existingPlaces, place])];

    await supabase
      .from('memories')
      .update({ places: updatedPlaces })
      .eq('id', memoryId);

    console.log(`Updated memory ${memoryId} places: ${updatedPlaces}`);
  }

  return true;
}

/**
 * Handle a reply to the people question.
 */
export async function handlePeopleReply(supabase, phoneNumber, memoryId, body, knownPeople) {
  const bodyLower = (body || '').trim().toLowerCase();

  if (bodyLower === 'skip' || bodyLower === 'overslaan') {
    return true;
  }

  // Parse the reply — could be numbers ("1 3") or names ("Eva Lucius")
  const tokens = body.trim().split(/[\s,]+/);
  const peopleLower = knownPeople.map((p) => p.toLowerCase());
  const matched = [];

  for (const token of tokens) {
    const num = parseInt(token, 10);
    if (!isNaN(num) && num >= 1 && num <= knownPeople.length) {
      // Numbered selection
      matched.push(knownPeople[num - 1]);
    } else {
      // Name match
      const idx = peopleLower.indexOf(token.toLowerCase());
      if (idx !== -1) matched.push(knownPeople[idx]);
    }
  }

  if (matched.length > 0) {
    const { data: memory } = await supabase
      .from('memories')
      .select('people')
      .eq('id', memoryId)
      .single();

    const existingPeople = memory?.people || [];
    const updatedPeople = [...new Set([...existingPeople, ...matched])];

    await supabase
      .from('memories')
      .update({ people: updatedPeople })
      .eq('id', memoryId);

    console.log(`Updated memory ${memoryId} people: ${updatedPeople}`);
  }

  return true;
}

/**
 * Send a WhatsApp message via Twilio.
 */
async function sendWhatsApp(to, body) {
  try {
    await twilioClient.messages.create({
      body,
      from: config.twilioWhatsAppNumber,
      to,
    });
  } catch (err) {
    console.error('Failed to send WhatsApp message:', err.message);
  }
}
