/* All canvas drawing logic will go here */

import { getExtraDateInfo } from './calendar-converter.js';
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
 */
function drawMonth({ ctx, year, month, x, y, width, monthNames, dayNames, maxGridHeight, customHolidaysForMonth, hijriOffset }) {
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

    // 1. Draw Month Name
    ctx.fillStyle = '#333';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'left';
    const monthText = monthNames[month];
    const textX = x + 20; // Add some padding from the left
    const textY = y + headerHeight / 1.5;
    ctx.fillText(monthText, textX, textY);

    // Draw a bold bottom border for the month name header
    ctx.fillStyle = '#f5f5f5'; // Blend with the day names background
    const borderHeight = 4; // Make the border bigger
    ctx.fillRect(x, y + headerHeight - borderHeight, width, borderHeight);

    // 2. Draw Day Name Headers (Sun, Mon, etc.)
    ctx.fillStyle = '#f5f5f5'; // A light grey for the day header
    ctx.fillRect(x, y + headerHeight, width, dayHeaderHeight);
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < dayNames.length; i++) {
        ctx.fillStyle = (i === 0) ? '#d9534f' : '#555'; // Red for Sunday
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
            const extraInfo = getExtraDateInfo(date, hijriOffset);

            // Determine the color for the main date number
            let mainDateColor = '#333'; // Default color
            if (isFillerDay) {
                mainDateColor = '#ccc';
            } else if (isPublicHoliday || col === 0) {
                mainDateColor = '#d9534f'; // Red for public holidays and Sundays
            }

            // Draw a red circle for custom holidays (behind the text)
            if (isCustomHoliday) {
                ctx.strokeStyle = '#d9534f';
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
                const javaneseText = extraInfo.javaneseDay.toLowerCase();
                const combinedText = `${extraInfo.islamicDayNumber} ${javaneseText}`;
                
                ctx.textAlign = 'center';
                ctx.font = '12px sans-serif';
                ctx.fillStyle = '#6c757d'; // A nice gray color
                ctx.fillText(combinedText, cellX + cellWidth / 2, cellY + cellHeight / 2 + 14);
            }
        }
    }

    // 4. Draw Holiday Notes
    if (holidays.size > 0) {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#555';
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
 */
export function drawCalendarPage({ canvas, year, startMonth, image, logoImage, monthNames = DEFAULT_MONTH_NAMES, dayNames = DEFAULT_DAY_NAMES, customHolidays, imageTransform = { x: 0, y: 0, scale: 1 }, hijriOffset }) {
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

    const gradient = ctx.createLinearGradient(0, canvas.height, 0, gradientEndY);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(0.8, 'white');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

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
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`KALENDER ${year}`, PADDING, calendarAreaY - 40);
    ctx.restore();

    // Draw logo at the bottom right
    if (logoImage) {
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
            hijriOffset
        });
    }
}