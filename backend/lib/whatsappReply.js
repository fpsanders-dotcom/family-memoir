/**
 * Family Memoir App — WhatsApp Confirmation Reply
 *
 * Sends a confirmation message back to the user after a memory is saved.
 * Format: "Memory saved! ✓ [date] | [first 30 chars of text]"
 */

import twilio from 'twilio';
import config from '../config.js';

/**
 * @param {string} to - Recipient in Twilio format (e.g. 'whatsapp:+31612345678')
 * @param {object} memory - The saved memory record
 */
export async function sendConfirmation(to, memory) {
  try {
    const client = twilio(config.twilioAccountSid, config.twilioAuthToken);

    const dateStr = memory.memory_date || 'today';
    const preview = memory.text
      ? memory.text.substring(0, 30) + (memory.text.length > 30 ? '...' : '')
      : '(photo)';

    const body = `Memory saved! \u2713 ${dateStr} | ${preview}`;

    await client.messages.create({
      body,
      from: config.twilioWhatsAppNumber,
      to,
    });

    console.log('Confirmation sent to', to);
  } catch (err) {
    console.error('Failed to send confirmation:', err.message);
  }
}
