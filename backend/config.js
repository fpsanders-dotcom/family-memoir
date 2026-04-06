/**
 * Family Memoir App — Configuration
 * Loads environment variables and exports app-wide settings.
 */

import 'dotenv/config';

export default {
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,

  // Twilio
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioWhatsAppNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',

  // Server
  port: parseInt(process.env.PORT, 10) || 3000,
};
