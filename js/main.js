import { initUI, getUIState, setExportButtonEnabled, setExportButtonBusy, setLoading } from './modules/ui-handler.js';
import { drawCalendarPage } from './modules/canvas-drawer.js';
import { parseCustomHolidays, setPrecomputedHolidays } from './modules/holiday-data.js';
import { loadHolidayData } from './modules/data-loader.js';
import { generatePdf } from './modules/pdf-generator.js';

let defaultImage = null;
let logoImage = null;

/**
 * Loads a user-selected image file and returns it as an HTMLImageElement.
 * @param {File | string} imageFile The file object from the input or a URL string for the default image.
 * @returns {Promise<HTMLImageElement|null>} A promise that resolves with the loaded image or null.
 */
function loadImage(imageFile) {
    return new Promise((resolve) => {
        if (!imageFile) {
            resolve(null); // No image selected
            return;
        }

        if (typeof imageFile === 'string') {
            // It's a URL (for our default image)
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null); // Silently fail if default image is missing
            img.src = imageFile;
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
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
 * Dynamically loads a script and returns a promise that resolves when it's loaded.
 * @param {string} url The URL of the script to load.
 * @returns {Promise<void>}
 */
function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
        document.head.appendChild(script);
    });
}


/**
 * Main function to generate the entire calendar.
 */
async function generateCalendar() {
    console.log("Generating calendar...");
    setLoading(true, 'Membuat Kalender...');

    // Use requestAnimationFrame to ensure the loader is painted before heavy work begins.
    requestAnimationFrame(async () => {
        try {
            const { year, imageFiles, canvases, customHolidays, imageTransforms, hijriOffset, paperSize, showLogo, colors } = getUIState();

            const loadedImages = await Promise.all(imageFiles.map(file => loadImage(file)));
            const parsedCustomHolidays = parseCustomHolidays(customHolidays);

            // Find the last valid uploaded image to use as a fallback for initial empty slots.
            let lastValidImage = loadedImages.slice().reverse().find(img => img !== null) || defaultImage;

            // Loop through the 6 pages (canvases)
            for (let i = 0; i < canvases.length; i++) {
                const canvas = canvases[i];
                const startMonth = i * 2; // 0, 2, 4, 6, 8, 10

                // If there's a new image for this page, update the last valid image.
                if (loadedImages[i]) {
                    lastValidImage = loadedImages[i];
                }
                const imageForPage = lastValidImage;
                drawCalendarPage({ canvas, year, startMonth, image: imageForPage, logoImage: logoImage, customHolidays: parsedCustomHolidays, imageTransform: imageTransforms[i], hijriOffset, paperSize, showLogo, colors });
            }

            setExportButtonEnabled(true);
            console.log("Calendar generation complete.");
        } finally {
            setLoading(false);
        }
    });
}

/**
 * Handles the PDF export process.
 */
async function exportCalendar() {
    console.log("Exporting to PDF...");
    setExportButtonBusy(true);

    const { year, canvases, paperSize } = getUIState();

    try {
        await generatePdf({ canvases, year, paperSize });
    } catch (error) {
        console.error("Failed to export PDF:", error);
        alert("Terjadi kesalahan saat mengekspor PDF. Silakan coba lagi.");
    } finally {
        setExportButtonBusy(false);
    }
}

/**
 * Initializes the application.
 */
async function main() {
    try {
        const holidayData = await loadHolidayData();
        setPrecomputedHolidays(holidayData);
        defaultImage = await loadImage('images/placeholder.png'); // For image uploads
        logoImage = await loadImage('images/logo.png'); // For the bottom-right corner
        await loadScript('js/lib/jspdf.umd.min.js');
        initUI({ onGenerate: generateCalendar, onExport: exportCalendar });
        generateCalendar(); // Generate calendar for the current year on page load
    } catch (error) {
        console.error(error);
        alert('Pustaka penting (jsPDF) tidak dapat dimuat. Ekspor PDF tidak akan berfungsi.');
    }
}

main();
