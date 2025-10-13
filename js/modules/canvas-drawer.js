/* All canvas drawing logic will go here */

import { getExtraDateInfo } from './calendar-converter.js';

// --- Constants for layout and styling ---
const PADDING = 50;
const MONTH_SPACING = 40;
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
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
 */
function drawMonth({ ctx, year, month, x, y, width }) {
    const headerHeight = 80;
    const dayHeaderHeight = 40;
    const gridStartY = y + headerHeight + dayHeaderHeight;
    const cellWidth = width / 7;

    // 1. Draw Month Name
    ctx.fillStyle = '#333';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${MONTH_NAMES[month]} ${year}`, x + width / 2, y + headerHeight / 1.5);

    // 2. Draw Day Name Headers (Sun, Mon, etc.)
    ctx.font = 'bold 18px sans-serif';
    for (let i = 0; i < DAY_NAMES.length; i++) {
        ctx.fillStyle = (i === 0) ? '#d9534f' : '#555'; // Red for Sunday
        ctx.fillText(DAY_NAMES[i], x + (i * cellWidth) + (cellWidth / 2), y + headerHeight + (dayHeaderHeight / 1.5));
    }

    // 3. Prepare to draw the date grid
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const cellHeight = (width / 7) * 0.8; // Make cells slightly shorter than they are wide

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    let currentDay = 1;
    for (let row = 0; row < 6; row++) { // Max 6 rows needed for a month
        for (let col = 0; col < 7; col++) {
            if ((row === 0 && col < firstDayOfWeek) || currentDay > daysInMonth) {
                // This is an empty cell (before the 1st or after the last day)
                continue;
            }

            const cellX = x + col * cellWidth;
            const cellY = gridStartY + row * cellHeight;

            // Draw the cell border
            ctx.strokeRect(cellX, cellY, cellWidth, cellHeight);

            // --- Draw date numbers and extra info inside the cell ---

            const date = new Date(year, month, currentDay);
            const extraInfo = getExtraDateInfo(date);

            // A. Draw Gregorian Day Number (large and centered)
            ctx.textAlign = 'center';
            ctx.font = 'bold 22px sans-serif';
            ctx.fillStyle = (col === 0) ? '#d9534f' : '#333'; // Red for Sunday
            ctx.fillText(currentDay, cellX + cellWidth / 2, cellY + 28);

            // B. Draw Javanese and Islamic dates (small, in corners)
            ctx.font = '12px sans-serif';
            ctx.fillStyle = '#777';

            // Javanese (bottom-left)
            ctx.textAlign = 'left';
            ctx.fillText(extraInfo.javanese, cellX + 5, cellY + cellHeight - 8);

            // Islamic (bottom-right)
            ctx.textAlign = 'right';
            ctx.fillText(extraInfo.islamic, cellX + cellWidth - 5, cellY + cellHeight - 8);

            currentDay++;
        }
    }
}

/**
 * Main exported function to draw a full calendar page (3 months).
 * @param {object} options
 * @param {HTMLCanvasElement} options.canvas - The canvas element to draw on.
 * @param {number} options.year - The calendar year.
 * @param {number} options.startMonth - The starting month index (0, 3, 6, 9).
 * @param {HTMLImageElement|null} options.image - The user-provided image.
 */
export function drawCalendarPage({ canvas, year, startMonth, image }) {
    const ctx = canvas.getContext('2d');

    // Clear canvas and set a white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- Define layout areas ---
    const contentWidth = canvas.width - (PADDING * 2);
    const imageAreaHeight = 400; // Reserve space for the image
    const calendarAreaY = PADDING + imageAreaHeight;
    const monthWidth = (contentWidth - (MONTH_SPACING * 2)) / 3;

    // Draw the user-provided image in the imageArea
    if (image) {
        const imageArea = {
            x: PADDING,
            y: PADDING,
            width: contentWidth,
            height: imageAreaHeight - MONTH_SPACING // Leave some space below the image
        };

        // Calculate aspect ratio to fit the image without distortion
        const scale = Math.min(imageArea.width / image.naturalWidth, imageArea.height / image.naturalHeight);
        const imgWidth = image.naturalWidth * scale;
        const imgHeight = image.naturalHeight * scale;
        ctx.drawImage(image, imageArea.x + (imageArea.width - imgWidth) / 2, imageArea.y + (imageArea.height - imgHeight) / 2, imgWidth, imgHeight);
    }

    // Loop and draw each of the three months for this page
    for (let i = 0; i < 3; i++) {
        const currentMonth = startMonth + i;
        const monthX = PADDING + i * (monthWidth + MONTH_SPACING);

        drawMonth({
            ctx,
            year,
            month: currentMonth,
            x: monthX,
            y: calendarAreaY,
            width: monthWidth
        });
    }
}