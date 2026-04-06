/**
 * Family Memoir App — Supabase Storage Upload
 *
 * Downloads a photo from a Twilio media URL and uploads it
 * to the existing Supabase Storage "photos" bucket.
 * Memories are stored under: photos/{memory-uuid}/photo_N.jpg
 */

import config from '../config.js';

/**
 * Download a photo from Twilio and upload to Supabase Storage.
 *
 * @param {object} supabase - Supabase client (service role)
 * @param {string} mediaUrl - Twilio media URL
 * @param {string} memoryId - UUID of the memory (used as folder name)
 * @param {number} index - Photo index (for naming)
 * @returns {Promise<string|null>} The storage path, or null on failure
 */
export async function uploadPhoto(supabase, mediaUrl, memoryId, index = 0) {
  try {
    const authHeader = Buffer.from(
      `${config.twilioAccountSid}:${config.twilioAuthToken}`
    ).toString('base64');

    const response = await fetch(mediaUrl, {
      headers: { Authorization: `Basic ${authHeader}` },
    });

    if (!response.ok) {
      console.error('Failed to download photo from Twilio:', response.status);
      return null;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const extension = contentType.includes('png') ? 'png' : 'jpg';
    const buffer = Buffer.from(await response.arrayBuffer());

    const storagePath = `${memoryId}/photo_${index}.${extension}`;

    const { error } = await supabase.storage
      .from('photos')
      .upload(storagePath, buffer, { contentType, upsert: false });

    if (error) {
      console.error('Supabase storage upload failed:', error.message);
      return null;
    }

    return storagePath;
  } catch (err) {
    console.error('Photo upload failed:', err.message);
    return null;
  }
}

/**
 * Get a signed URL for a stored photo.
 */
export async function getSignedUrl(supabase, storagePath, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from('photos')
    .createSignedUrl(storagePath, expiresIn);

  if (error) {
    console.error('Failed to create signed URL:', error.message);
    return null;
  }
  return data.signedUrl;
}
