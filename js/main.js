import { initUI, getUIState, setExportButtonEnabled } from './modules/ui-handler.js';
import { drawCalendarPage } from './modules/canvas-drawer.js';

// This will hold the loaded image object.
let userImage = null;

/**
 * Loads a user-selected image file and returns it as an HTMLImageElement.
 * @param {File} imageFile The file object from the input.
 * @returns {Promise<HTMLImageElement|null>} A promise that resolves with the loaded image or null.
 */
function loadImage(imageFile) {
    return new Promise((resolve) => {
        if (!imageFile) {
            userImage = null;
            resolve(null); // No image selected
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                userImage = img;
                resolve(img);
            };
            img.onerror = () => resolve(null); // Handle image loading errors
            img.src = e.target.result;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(imageFile);
    });
}

/**
 * Main function to generate the entire calendar.
 */
async function generateCalendar() {
    console.log("Generating calendar...");
    const { year, imageFile, canvases } = getUIState();

    await loadImage(imageFile);

    // Loop through the 4 pages (canvases)
    for (let i = 0; i < canvases.length; i++) {
        const canvas = canvases[i];
        const startMonth = i * 3; // 0, 3, 6, 9

        drawCalendarPage({
            canvas,
            year,
            startMonth,
            image: userImage
        });
    }

    setExportButtonEnabled(true);
    console.log("Calendar generation complete.");
}

/**
 * Initializes the application.
 */
function main() {
    initUI({ onGenerate: generateCalendar });
    generateCalendar(); // Generate calendar for the current year on page load
}

main();
