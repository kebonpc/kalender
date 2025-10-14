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
    const islamicFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    return islamicFormatter.format(date);
}

/**
 * Gets a combined object with Javanese and Islamic date information.
 * @param {Date} gregorianDate - The input Gregorian date.
 * @param {number} [hijriOffset=0] - The day offset for Hijri date adjustment from the UI.
 * @returns {{javaneseDay: string, islamicDate: string, islamicDayNumber: string}}
 */
export function getExtraDateInfo(gregorianDate, hijriOffset = 0) {
    const adjustedDate = new Date(gregorianDate);
    if (hijriOffset !== 0) {
        // For display, if the user selects +1, we show the Hijri date for the *next* Gregorian day.
        adjustedDate.setDate(adjustedDate.getDate() + hijriOffset);
    }
    // Using a separate formatter just for the day number is more reliable
    // than splitting a formatted string, which can vary between browsers.
    const dayFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
        day: 'numeric'
    });

    return {
        javaneseDay: getJavanesePasaran(gregorianDate),
        islamicDate: getIslamicDate(adjustedDate), // Keep this for potential future use
        islamicDayNumber: dayFormatter.format(adjustedDate),
    };
}

const ISLAMIC_MONTH_NAMES = [
    "Muharam", "Safar", "Rabiul Awal", "Rabiul Akhir",
    "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
    "Ramadan", "Syawal", "Zulkaidah", "Zulhijah"
];

function getIslamicDateParts(date) {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { year: 'numeric', month: 'numeric' });
    const parts = formatter.formatToParts(date);
    const year = parseInt(parts.find(p => p.type === 'year').value, 10);
    const month = parseInt(parts.find(p => p.type === 'month').value, 10);
    return { year, month };
}
/**
 * Gets the formatted month/year string for the Islamic calendar,
 * handling cases where a Gregorian month spans two different months.
 * @param {number} year - The Gregorian year.
 * @param {number} month - The Gregorian month index (0-11).
 * @param {number} hijriOffset - The day offset for Hijri date adjustment.
 * @returns {string} The formatted month span string.
 */
function getFormattedMonthSpan(year, month, hijriOffset) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    if (hijriOffset !== 0) {
        startDate.setDate(startDate.getDate() + hijriOffset);
        endDate.setDate(endDate.getDate() + hijriOffset);
    }

    const startParts = getIslamicDateParts(startDate);
    const endParts = getIslamicDateParts(endDate);

    const startMonthName = ISLAMIC_MONTH_NAMES[startParts.month - 1];
    const endMonthName = ISLAMIC_MONTH_NAMES[endParts.month - 1];
    const endYearFormatted = `${endParts.year} H`;

    if (startParts.month === endParts.month && startParts.year === endParts.year) {
        return `${startMonthName} ${endYearFormatted}`;
    }

    return `${startMonthName} - ${endMonthName} ${endYearFormatted}`;
}

export function getMonthSpanInfo(year, month, hijriOffset = 0) {
    return {
        islamic: getFormattedMonthSpan(year, month, hijriOffset),
    };
}