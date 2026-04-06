/**
 * Family Memoir App — Message Parser
 *
 * Parses a WhatsApp message body into structured data:
 * - Extracts #hashtags
 * - Classifies hashtags into people[], places[], and tags[]
 * - Returns cleaned text (hashtags removed)
 */

/**
 * @param {string} body - The raw message text
 * @param {string[]} knownPeople - Known family member names (case-insensitive match)
 * @returns {{ cleanText: string, people: string[], places: string[], tags: string[] }}
 */
export function parseMessage(body, knownPeople = []) {
  if (!body || typeof body !== 'string') {
    return { cleanText: '', people: [], places: [], tags: [] };
  }

  const hashtagRegex = /#(\w+)/g;
  const allHashtags = [];
  let match;
  while ((match = hashtagRegex.exec(body)) !== null) {
    allHashtags.push(match[1]);
  }

  const knownPeopleLower = knownPeople.map((p) => p.toLowerCase());
  const people = [];
  const tags = [];

  for (const tag of allHashtags) {
    const tagLower = tag.toLowerCase();
    const peopleIndex = knownPeopleLower.indexOf(tagLower);
    if (peopleIndex !== -1) {
      people.push(knownPeople[peopleIndex]);
    } else {
      tags.push(tag.toLowerCase());
    }
  }

  const cleanText = body
    .replace(/#\w+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    cleanText,
    people: [...new Set(people)],
    places: [],  // populated by EXIF/geocoding, not text parsing
    tags: [...new Set(tags)],
  };
}
