/* All canvas drawing logic will go here */

import { getExtraDateInfo, getMonthSpanInfo } from './calendar-converter.js';
import { getHolidaysForMonth } from './holiday-data.js';

// --- Constants for layout and styling ---
const PADDING = 50;
const MONTH_SPACING = 40;
const DEFAULT_DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const DEFAULT_MONTH_NAMES = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

/**
 * Converts a Western Arabic numeral string to an Eastern Arabic numeral string.
 * @param {string|number} number - The number to convert.
 * @returns {string} The number in Eastern Arabic numerals.
 */
function toEasternArabicNumerals(number) {
    const easternNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(number).split('').map(digit => easternNumerals[parseInt(digit, 10)]).join('');
}

/**
 * Draws a single month's grid onto the canvas.
 * @param {object} options
 * @param {CanvasRenderingContext2D} options.ctx - The canvas rendering context.
 * @param {number} options.year - The full year.
 * @param {number} options.month - The month index (0-11).
 * @param {number} options.x - The starting X coordinate for this month's grid.
 * @param {number} options.y - The starting Y coordinate for this month's grid.
 * @param {number} options.width - The total width available for this month's grid.
 * @param {string[]} options.monthNames - Array of month names.
 * @param {number} options.maxGridHeight - The maximum possible height of the grid area.
 * @param {Map<number, string>} [options.customHolidaysForMonth] - Optional map of custom holidays for this month.
 * @param {string[]} options.dayNames - Array of day names.
 * @param {number} options.hijriOffset - The day offset for Hijri date adjustment.
 * @param {object} options.colors - The theme colors.
 */
function drawMonth({ ctx, year, month, x, y, width, monthNames, dayNames, maxGridHeight, customHolidaysForMonth, hijriOffset, colors }) {
    const headerHeight = 80;
    const dayHeaderHeight = 40;
    const gridStartY = y + headerHeight + dayHeaderHeight;
    const cellWidth = width / 7;

    // Calculate grid height for styling
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const numRows = Math.ceil((firstDayOfWeek + daysInMonth) / 7);
    const cellHeight = (width / 7) * 0.8;
    const gridHeight = numRows * cellHeight;

    const holidays = getHolidaysForMonth(year, month, customHolidaysForMonth, hijriOffset);
    const monthSpans = getMonthSpanInfo(year, month, hijriOffset);

    // 1. Draw Month Name
    ctx.fillStyle = colors.month;
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'left';
    const monthText = monthNames[month];
    const textX = x + 20; // Add some padding from the left
    const textY = y + headerHeight / 1.5;
    ctx.fillText(monthText, textX, textY);

    // Draw Islamic and Javanese month spans on the right
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'right';
    const spanX = x + width - 20; // Add some padding from the right
    const islamicSpanY = y + headerHeight / 1.5; // Vertically center with month name
    ctx.fillText(monthSpans.islamic, spanX, islamicSpanY);

    // Draw a bold bottom border for the month name header
    ctx.fillStyle = colors.dayNamesBg; // Blend with the day names background
    const borderHeight = 4; // Make the border bigger
    ctx.fillRect(x, y + headerHeight - borderHeight, width, borderHeight);

    // 2. Draw Day Name Headers (Sun, Mon, etc.)
    ctx.fillStyle = colors.dayNamesBg; // A light grey for the day header
    ctx.fillRect(x, y + headerHeight, width, dayHeaderHeight);
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < dayNames.length; i++) {
        if (i === 0) { // Sunday
            ctx.fillStyle = colors.holiday;
        } else if (i === 5) { // Friday
            ctx.fillStyle = colors.friday;
        } else {
            ctx.fillStyle = colors.dayNames;
        }
        ctx.fillText(dayNames[i], x + (i * cellWidth) + (cellWidth / 2), y + headerHeight + (dayHeaderHeight / 1.5));
    }

    // 3. Prepare to draw the date grid
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    let currentDay = 1;
    let nextMonthDay = 1;

    for (let row = 0; row < numRows; row++) { // Loop only for the required number of rows
        for (let col = 0; col < 7; col++) {
            const cellX = x + col * cellWidth;
            const cellY = gridStartY + row * cellHeight;

            let dayNumber;
            let date;
            let isFillerDay = false;

            if (row === 0 && col < firstDayOfWeek) {
                // Previous month's day
                dayNumber = daysInPrevMonth - (firstDayOfWeek - 1 - col);
                date = new Date(year, month - 1, dayNumber);
                isFillerDay = true;
            } else if (currentDay > daysInMonth) {
                // Next month's day
                dayNumber = nextMonthDay++;
                date = new Date(year, month + 1, dayNumber);
                isFillerDay = true;
            } else {
                // Current month's day
                dayNumber = currentDay++;
                date = new Date(year, month, dayNumber);
            }
            
            const isCustomHoliday = !isFillerDay && customHolidaysForMonth && customHolidaysForMonth.has(dayNumber);
            const isPublicHoliday = !isFillerDay && !isCustomHoliday && holidays.has(dayNumber);

            // Draw the cell border
            // ctx.strokeRect(cellX, cellY, cellWidth, cellHeight);

            // --- Draw date numbers and extra info inside the cell ---

            // Determine the color for the main date number
            let mainDateColor = colors.weekday; // Default color
            if (isFillerDay) {
                mainDateColor = colors.fillerDay;
            } else if (isPublicHoliday || col === 0) {
                mainDateColor = colors.holiday; // Red for public holidays and Sundays
            } else if (col === 5) {
                mainDateColor = colors.friday; // Green for Fridays
            }

            // Draw a red circle for custom holidays (behind the text)
            if (isCustomHoliday) {
                ctx.strokeStyle = colors.customHoliday;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(cellX + cellWidth / 2, cellY + cellHeight / 2 - 8, 18, 0, 2 * Math.PI);
                ctx.stroke();
            }

            // A. Draw Gregorian Day Number (centered, upper part of the cell)
            ctx.textAlign = 'center';
            ctx.font = 'bold 24px sans-serif';
            ctx.fillStyle = mainDateColor;
            ctx.fillText(dayNumber, cellX + cellWidth / 2, cellY + cellHeight / 2 - 2);

            // B. Draw Islamic and Javanese dates (centered, lower part of the cell)
            if (!isFillerDay) {
                const extraInfo = getExtraDateInfo(date, hijriOffset);
                const javaneseText = extraInfo.javaneseDay.toLowerCase();
                const combinedText = `${extraInfo.islamicDayNumber} ${javaneseText}`;
                
                ctx.textAlign = 'center';
                ctx.font = '12px sans-serif';
                ctx.fillStyle = colors.subDate; // A nice gray color
                ctx.fillText(combinedText, cellX + cellWidth / 2, cellY + cellHeight / 2 + 14);

                // C. Draw Eastern Arabic numeral for Islamic day (top right)
                const arabicDayNumber = toEasternArabicNumerals(extraInfo.islamicDayNumber);
                ctx.textAlign = 'right';
                ctx.font = '14px sans-serif';
                ctx.fillStyle = colors.arabicNumber;
                ctx.fillText(arabicDayNumber, cellX + cellWidth - 8, cellY + 16);
            }
        }
    }

    // 4. Draw Holiday Notes
    if (holidays.size > 0) {
        ctx.textAlign = 'left';
        ctx.fillStyle = colors.notes;
        ctx.font = '12px sans-serif';
        let noteY = y + maxGridHeight + 20; // Start drawing notes below the grid

        // Sort holidays by date to display them in order
        const sortedHolidays = Array.from(holidays.entries()).sort((a, b) => a[0] - b[0]);
        for (const [day, name] of sortedHolidays) {
            ctx.fillText(`${day}: ${name}`, x, noteY);
            noteY += 18; // Line height for the next note
        }
    }
}

/**
 * Converts a hex color string to an rgba string.
 * @param {string} hex - The hex color string (e.g., '#ffffff').
 * @param {number} alpha - The alpha transparency value (0-1).
 * @returns {string} The resulting rgba color string.
 */
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


/**
 * Main exported function to draw a full calendar page (3 months).
 * @param {object} options
 * @param {HTMLCanvasElement} options.canvas - The canvas element to draw on.
 * @param {number} options.year - The calendar year.
 * @param {number} options.startMonth - The starting month index (0, 3, 6, 9).
 * @param {HTMLImageElement|null} options.image - The user-provided image for this page.
 * @param {string[]} [options.monthNames] - Optional custom month names.
 * @param {string[]} [options.dayNames] - Optional custom day names.
 * @param {Map<number, Map<number, string>>} [options.customHolidays] - Parsed custom holidays.
 * @param {object} [options.imageTransform] - Object with x, y, scale for image transformation.
 * @param {number} [options.hijriOffset] - The day offset for Hijri date adjustment.
 * @param {HTMLImageElement|null} options.logoImage - The logo image to draw on the page.
 * @param {string} [options.paperSize] - The paper size format (e.g., 'a4', 'letter').
 * @param {boolean} [options.showLogo] - Whether to show the logo and label.
 * @param {object} [options.colors] - The theme colors.
 */
export function drawCalendarPage({ canvas, year, startMonth, image, logoImage, monthNames = DEFAULT_MONTH_NAMES, dayNames = DEFAULT_DAY_NAMES, customHolidays, imageTransform = { x: 0, y: 0, scale: 1 }, hijriOffset, paperSize, showLogo = true, colors = {} }) {
    // Provide default colors if none are passed
    const themeColors = {
        year: '#ffffff', month: '#333333', dayNamesBg: '#f5f5f5', dayNames: '#555555',
        weekday: '#333333', friday: '#28a745', holiday: '#d9534f', customHoliday: '#d9534f', arabicNumber: '#6c757d',
        fillerDay: '#cccccc', subDate: '#6c757d', notes: '#555555',
        overlay: '#ffffff',
        ...colors
    };

    const ctx = canvas.getContext('2d');

    // Clear canvas and set a white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate the maximum possible height for a month grid to position it
    const holidayNotesAreaHeight = 150; // Space at the bottom for notes
    const monthWidth = (canvas.width - (PADDING * 2) - MONTH_SPACING) / 2;
    const maxCellHeight = (monthWidth / 7) * 0.8;
    const maxGridHeight = 80 + 40 + (6 * maxCellHeight); // headerHeight + dayHeaderHeight + (6 rows * cellHeight)
    const calendarAreaY = canvas.height - PADDING - maxGridHeight - holidayNotesAreaHeight;
    const imageAreaHeight = calendarAreaY - PADDING;

    // Draw the user-provided image in the imageArea
    if (image) {
        // Calculate initial scale to make the image cover the full width of the canvas
        const baseScale = canvas.width / image.naturalWidth;
        const baseWidth = image.naturalWidth * baseScale;
        const baseHeight = image.naturalHeight * baseScale;

        // Apply user's transform adjustments
        const finalWidth = baseWidth * imageTransform.scale;
        const finalHeight = baseHeight * imageTransform.scale;

        // Calculate initial X (full width) and Y (vertically centered in available space)
        const initialImgX = 0;
        const initialImgY = PADDING + (imageAreaHeight - finalHeight) / 2;

        // Apply user's transform offsets
        const imgX = initialImgX + imageTransform.x;
        const imgY = initialImgY + imageTransform.y;

        ctx.drawImage(image, imgX, imgY, finalWidth, finalHeight);
    }

    // Draw a curved gradient overlay for readability
    const curveStartY = calendarAreaY - 50;
    const waveAmplitude = 80;
    const gradientEndY = curveStartY - waveAmplitude; // The highest point of the wave

    const gradient = ctx.createLinearGradient(0, canvas.height, 0, gradientEndY);    gradient.addColorStop(0, themeColors.overlay);
    gradient.addColorStop(0.8, themeColors.overlay);
    gradient.addColorStop(1, hexToRgba(themeColors.overlay, 0));

    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(canvas.width, curveStartY); // Go up to the start of the wave on the right

    // Use a bezier curve to create a wave shape
    ctx.bezierCurveTo(
        canvas.width * 0.75, curveStartY + waveAmplitude, // Control point 1 (pulls the curve down on the right)
        canvas.width * 0.25, curveStartY - waveAmplitude, // Control point 2 (pulls the curve up on the left)
        0, curveStartY // End point on the left
    );

    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw Year at the top of the page (on top of the image)
    ctx.save();
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = themeColors.year;
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`KALENDER ${year}`, PADDING, calendarAreaY - 40);
    ctx.restore();

    // Draw paper size at the bottom left
    if (paperSize && startMonth === 0) {
        ctx.fillStyle = '#aaa';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        const paperSizeText = paperSize.toUpperCase();
        ctx.fillText(paperSizeText, PADDING, canvas.height - PADDING + 12);
    }

    // Draw logo at the bottom right
    if (showLogo && logoImage) {
        const logoSize = 60;
        const logoX = canvas.width - PADDING - logoSize;
        const logoY = canvas.height - PADDING - logoSize;
        ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);

        // Add text to the left of the logo
        const textLines = [
            "dibuat mengunakan",
            "kebonpc kalender",
            "generator"
        ];
        const lineHeight = 16;
        const textBlockHeight = textLines.length * lineHeight;
        
        ctx.fillStyle = '#888';
        ctx.font = 'italic 12px sans-serif';
        ctx.textAlign = 'right';

        let textY = logoY + (logoSize - textBlockHeight) / 2 + lineHeight / 1.5;
        for (const line of textLines) {
            ctx.fillText(line, logoX - 10, textY);
            textY += lineHeight;
        }
    }


    // Loop and draw each of the two months for this page
    for (let i = 0; i < 2; i++) {
        const currentMonth = startMonth + i;
        const monthX = PADDING + i * (monthWidth + MONTH_SPACING);

        drawMonth({
            ctx,
            year,
            month: currentMonth,
            x: monthX,
            y: calendarAreaY,
            width: monthWidth,
            monthNames,
            dayNames,
            maxGridHeight,
            customHolidaysForMonth: customHolidays ? customHolidays.get(currentMonth) : null,
            hijriOffset,
            colors: themeColors
        });
    }
}