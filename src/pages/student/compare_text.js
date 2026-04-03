import { diffWords } from 'diff';

/**
 * Compares the spoken text with the original paragraph.
 * 
 * @param {string} original - The expected paragraph text.
 * @param {string} spoken - The transcribed speech text.
 * @returns {Array} An array of diff objects { value, added, removed }.
 */
export function compareSpeech(original, spoken) {
    if (!spoken) return [];

    // Clean up punctuation and case for better comparison, but keep original for display later
    const cleanOriginal = original.replace(/[.,/#!$%^&*;:{}=\-_`~()"'?“”‘’]/g, "").toLowerCase();
    const cleanSpoken = spoken.replace(/[.,/#!$%^&*;:{}=\-_`~()"'?“”‘’]/g, "").toLowerCase();

    // We use diffWords to compare. It returns an array showing additions, deletions, 
    // and parts that are the same.
    const diffResult = diffWords(cleanOriginal, cleanSpoken);

    return diffResult;
}
