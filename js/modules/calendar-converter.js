/* Javanese/Islamic date conversion logic will go here */

/**
 * Javanese Pasaran days in order.
 */
const PASARAN_DAYS = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];

/**
 * Calculates the Javanese Pasaran day for a given Gregorian date.
 * This algorithm is based on the number of days elapsed since a known epoch.
 * @param {Date} date - The Gregorian date.
 * @returns {string} The Pasaran day (e.g., "Legi", "Pahing").
 */
function getJavanesePasaran(date) {
    // Create a UTC date to avoid timezone issues in calculation.
    const utcDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    // The epoch is the number of days from Jan 1, 1 AD to Jan 1, 1970 AD.
    const epoch = 719163;
    const daysSinceEpoch = Math.floor(utcDate / 86400000);
    
    // The total number of days modulo 5 gives the index in the Pasaran cycle.
    const pasaranIndex = (daysSinceEpoch + epoch) % 5;
    
    return PASARAN_DAYS[pasaranIndex];
}

/**
 * Formats a Gregorian date into the Islamic (Hijri) calendar format.
 * Uses the built-in Intl.DateTimeFormat API.
 * @param {Date} date - The Gregorian date.
 * @returns {string} The formatted Islamic date (e.g., "17 Dhu al-Hijjah 1445 AH").
 */
function getIslamicDate(date) {
    const islamicFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    return islamicFormatter.format(date);
}

/**
 * Gets a combined object with Javanese and Islamic date information.
 * @param {Date} gregorianDate - The input Gregorian date.
 * @returns {{javanese: string, islamic: string}}
 */
export function getExtraDateInfo(gregorianDate) {
    return {
        javanese: getJavanesePasaran(gregorianDate),
        islamic: getIslamicDate(gregorianDate).split(' ')[0], // We only need the day number for the calendar cell
    };
}