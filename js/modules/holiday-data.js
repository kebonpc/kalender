/*
 * Holiday Data and Logic for Indonesia.
 * Note: Calculating many floating holidays (Nyepi, Waisak) is complex.
 * For this offline app, we are hardcoding them for a range of years.
 * This data would need to be updated periodically for future years.
 */

import { getExtraDateInfo } from './calendar-converter.js';

// --- Fixed Gregorian Date Holidays ---
const FIXED_HOLIDAYS = [
    { month: 0, day: 1, name: "Tahun Baru Masehi" },
    { month: 4, day: 1, name: "Hari Buruh Internasional" },
    { month: 5, day: 1, name: "Hari Lahir Pancasila" },
    { month: 7, day: 17, name: "Hari Kemerdekaan RI" },
    { month: 11, day: 25, name: "Hari Raya Natal" },
];

const MONTH_MAP = {
    'jan': 0, 'januari': 0, '1': 0, '01': 0,
    'feb': 1, 'februari': 1, '2': 1, '02': 1,
    'mar': 2, 'maret': 2, '3': 2, '03': 2,
    'apr': 3, 'april': 3, '4': 3, '04': 3,
    'may': 4, 'mei': 4, '5': 4, '05': 4,
    'jun': 5, 'juni': 5, '6': 5, '06': 5,
    'jul': 6, 'juli': 6, '7': 6, '07': 6,
    'aug': 7, 'agustus': 7, '8': 7, '08': 7,
    'sep': 8, 'september': 8, '9': 8, '09': 8,
    'oct': 9, 'oktober': 9, '10': 9,
    'nov': 10, 'november': 10, '11': 10,
    'dec': 11, 'desember': 11, '12': 11,
};

let PRECOMPUTED_HOLIDAYS = {};

/**
 * Sets the precomputed holiday data from an external source.
 * @param {object} data - The holiday data object loaded from JSON.
 */
export function setPrecomputedHolidays(data) {
    PRECOMPUTED_HOLIDAYS = data;
}

// --- Islamic Holidays (calculated algorithmically) ---
// Format: { islamicMonth, islamicDay, name }
const ISLAMIC_HOLIDAYS = [
    { month: 1, day: 1, name: "Tahun Baru Islam" },
    { month: 3, day: 12, name: "Maulid Nabi Muhammad SAW" },
    { month: 7, day: 27, name: "Isra Mi'raj" },
    { month: 10, day: 1, name: "Hari Raya Idul Fitri" },
    { month: 10, day: 2, name: "Hari Raya Idul Fitri" },
    { month: 12, day: 10, name: "Hari Raya Idul Adha" },
];

const islamicMonthFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic', { month: 'numeric' });
const islamicDayFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic', { day: 'numeric' });

/**
 * Checks if a given Gregorian date is an Islamic holiday.
 * @param {Date} date The Gregorian date to check.
 * @param {number} [hijriOffset=0] - The day offset for Hijri date adjustment.
 * @returns {object|null} The holiday object if it's a holiday, otherwise null.
 */
function getIslamicHoliday(date, hijriOffset = 0) {
    const adjustedDate = new Date(date);
    if (hijriOffset !== 0) {
        // The offset from the UI is the opposite of what we need for calculation.
        // If the user wants to shift the Hijri date +1 day, they are saying "my calendar is one day ahead",
        // so we need to check the Gregorian date one day *before* to find the correct holiday.
        // Example: If Hijri 1st is on Sept 2 instead of Sept 1, the user selects -1.
        // We then check Sept 2 with an offset of +1 to see if it's Hijri 1st.
        adjustedDate.setDate(adjustedDate.getDate() - hijriOffset);
    }
    const islamicMonth = parseInt(islamicMonthFormatter.format(adjustedDate), 10);
    const islamicDay = parseInt(islamicDayFormatter.format(adjustedDate), 10);

    return ISLAMIC_HOLIDAYS.find(h => h.islamicMonth === islamicMonth && h.islamicDay === islamicDay) || null;
}

/**
 * Retrieves all holidays for a given Gregorian month and year.
 * @param {number} year The full year.
 * @param {number} month The month index (0-11).
 * @param {Map<number, string>} [customHolidaysForMonth] - Optional map of custom holidays for this month.
 * @param {number} [hijriOffset=0] - The day offset for Hijri date adjustment from the UI.
 * @returns {Map<number, string>} A Map where the key is the day number and the value is the holiday name.
 */
export function getHolidaysForMonth(year, month, customHolidaysForMonth, hijriOffset = 0) {
    const holidays = new Map();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 1. Check Fixed Gregorian Holidays
    FIXED_HOLIDAYS.forEach(h => {
        if (h.month === month) {
            holidays.set(h.day, h.name);
        }
    });

    // 2. Check Pre-computed Floating Holidays
    if (PRECOMPUTED_HOLIDAYS[year]) {
        PRECOMPUTED_HOLIDAYS[year].forEach(h => {
            if (h.month === month) {
                holidays.set(h.day, h.name);
            }
        });
    }

    // 3. Check Islamic Holidays for every day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const islamicHoliday = getIslamicHoliday(date, hijriOffset);
        if (islamicHoliday) {
            holidays.set(day, islamicHoliday.name);
        }
    }

    // 4. Add custom holidays, overwriting any public ones on the same day
    if (customHolidaysForMonth) {
        customHolidaysForMonth.forEach((name, day) => {
            holidays.set(day, name);
        });
    }

    return holidays;
}

/**
 * Parses the user-provided custom holiday string.
 * @param {string} text - The raw text from the textarea.
 * @returns {Map<number, Map<number, string>>} A map of months, each containing a map of days to holiday names.
 */
export function parseCustomHolidays(text) {
    const customHolidays = new Map();
    if (!text) {
        return customHolidays;
    }

    const lines = text.split('\n');
    lines.forEach(line => {
        const parts = line.split(':');
        if (parts.length < 2) return;

        const datePart = parts[0].trim();
        const name = parts.slice(1).join(':').trim();
        const dateParts = datePart.split(/[\s/]+/);
        if (dateParts.length < 2) return;

        const day = parseInt(dateParts[0], 10);
        const monthStr = dateParts[1].toLowerCase();
        const month = MONTH_MAP[monthStr];

        if (!isNaN(day) && month !== undefined && name) {
            if (!customHolidays.has(month)) {
                customHolidays.set(month, new Map());
            }
            customHolidays.get(month).set(day, name);
        }
    });

    return customHolidays;
}