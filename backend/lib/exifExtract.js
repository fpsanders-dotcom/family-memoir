/**
 * Family Memoir App — EXIF Metadata Extractor
 *
 * Extracts date and GPS coordinates from photo EXIF data.
 * - Date taken → auto-populates memory_date
 * - GPS coordinates → reverse-geocoded to a place name
 * - If no EXIF date, caller falls back to WhatsApp message timestamp
 */

import exifr from 'exifr';

/**
 * @param {Buffer} photoBuffer - The raw photo file buffer
 * @returns {Promise<{ date: Date|null, latitude: number|null, longitude: number|null }>}
 */
export async function extractExif(photoBuffer) {
  try {
    const exif = await exifr.parse(photoBuffer, {
      pick: ['DateTimeOriginal', 'CreateDate', 'GPSLatitude', 'GPSLongitude'],
      gps: true,
    });

    if (!exif) {
      return { date: null, latitude: null, longitude: null };
    }

    const date = exif.DateTimeOriginal || exif.CreateDate || null;
    const latitude = exif.latitude ?? null;
    const longitude = exif.longitude ?? null;

    return { date, latitude, longitude };
  } catch (err) {
    console.error('EXIF extraction failed:', err.message);
    return { date: null, latitude: null, longitude: null };
  }
}
