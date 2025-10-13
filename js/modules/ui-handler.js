/* Handles UI events and DOM manipulation */

// Get references to all the important DOM elements
const yearInput = document.getElementById('year-input');
const imageUpload = document.getElementById('image-upload');
const generateBtn = document.getElementById('generate-btn');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const canvases = [
    document.getElementById('page-1'),
    document.getElementById('page-2'),
    document.getElementById('page-3'),
    document.getElementById('page-4'),
];

/**
 * Initializes the UI controls, setting default values and attaching event listeners.
 * @param {object} options
 * @param {function} options.onGenerate - The callback function to execute when the generate button is clicked.
 */
export function initUI({ onGenerate }) {
    // Set default year to the current year
    yearInput.value = new Date().getFullYear();

    // Attach event listener to the generate button
    generateBtn.addEventListener('click', onGenerate);

    // Also trigger generation when a new image is selected
    imageUpload.addEventListener('change', onGenerate);
}

/**
 * Gets the current values from the UI controls.
 * @returns {{year: number, imageFile: File | null, canvases: HTMLCanvasElement[]}}
 */
export function getUIState() {
    const year = parseInt(yearInput.value, 10) || new Date().getFullYear();
    const imageFile = imageUpload.files.length > 0 ? imageUpload.files[0] : null;

    return { year, imageFile, canvases };
}

/**
 * Enables or disables the export button.
 * @param {boolean} enabled - True to enable, false to disable.
 */
export function setExportButtonEnabled(enabled) {
    exportPdfBtn.disabled = !enabled;
}