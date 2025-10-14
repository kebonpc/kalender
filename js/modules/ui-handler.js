/* Handles UI events and DOM manipulation */

const NOW = new Date();

// Get references to all the important DOM elements
const yearInput = document.getElementById('year-input');
const generateBtn = document.getElementById('generate-btn');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const customHolidaysTextarea = document.getElementById('custom-holidays');
const hijriOffsetSelect = document.getElementById('hijri-offset');

const imagePageSelect = document.getElementById('image-page-select');
const uploadImageBtn = document.getElementById('upload-image-btn');
const imageUploadInput = document.getElementById('image-upload-input');
const scaleSlider = document.getElementById('image-scale');
const xSlider = document.getElementById('image-x');
const ySlider = document.getElementById('image-y');
const scaleNumberInput = document.getElementById('image-scale-number');
const xNumberInput = document.getElementById('image-x-number');
const yNumberInput = document.getElementById('image-y-number');
const loadingOverlay = document.getElementById('loading-overlay');
const mobileToggleBtn = document.getElementById('mobile-sidebar-toggle');

// Sidebar navigation elements
const sidebarPanels = document.querySelectorAll('.sidebar-panel');
const navButtons = document.querySelectorAll('.sidebar-nav button');
const backButtons = document.querySelectorAll('.back-btn');

const canvases = [
    document.getElementById('page-1'),
    document.getElementById('page-2'),
    document.getElementById('page-3'),
    document.getElementById('page-4'),
    document.getElementById('page-5'),
    document.getElementById('page-6'),
];

const NUM_PAGES = 6;
let pageImageStates = Array(NUM_PAGES).fill(null).map(() => ({
    file: null,
    transform: { x: 0, y: 0, scale: 1 }
}));
let selectedImagePageIndex = 0; // Default to Page 1

/**
 * Creates a debounced function that delays invoking the func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * @param {function} func The function to debounce.
 * @param {number} wait The number of milliseconds to delay.
 * @returns {function} Returns the new debounced function.
 */
function debounce(func, wait) {
    let timeout;
    return (...args) => clearTimeout(timeout, timeout = setTimeout(() => func.apply(this, args), wait));
}

/**
 * Switches the visible sidebar panel.
 * @param {string} panelId The ID of the panel to show.
 */
function navigateToPanel(panelId) {
    sidebarPanels.forEach(panel => {
        panel.classList.remove('active');
    });
    const targetPanel = document.getElementById(panelId);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
}

/**
 * Sets a CSS variable for the actual viewport height to solve mobile browser issues.
 */
function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

/**
 * Initializes the UI controls, setting default values and attaching event listeners.
 * @param {object} options
 * @param {function} options.onGenerate - Callback for the "Generate" button click.
 * @param {function} options.onExport - Callback for the "Export" button.
 */
export function initUI({ onGenerate, onExport }) {
    // Set the viewport height variable on load and on resize
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);

    // Set default year to the current year
    yearInput.value = NOW.getFullYear();

    // Attach event listener to the generate button
    generateBtn.addEventListener('click', onGenerate);

    // Programmatically click the hidden file input
    uploadImageBtn.addEventListener('click', () => {
        imageUploadInput.click();
    });

    // Handle the file upload for the currently selected page
    imageUploadInput.addEventListener('change', (e) => {
        if (e.target.files.length === 0) return;
        const file = e.target.files[0];
        pageImageStates[selectedImagePageIndex].file = file;
        pageImageStates[selectedImagePageIndex].transform = { x: 0, y: 0, scale: 1 }; // Reset transform
        updateSlidersFromTransform(pageImageStates[selectedImagePageIndex].transform);
        onGenerate();
        e.target.value = ''; // Reset input so the same file can be re-selected
    });

    // Attach event listener to the export button
    exportPdfBtn.addEventListener('click', onExport);

    // Initialize image transform controls
    imagePageSelect.value = selectedImagePageIndex;
    updateSlidersFromTransform(pageImageStates[selectedImagePageIndex].transform);

    hijriOffsetSelect.addEventListener('change', onGenerate);

    imagePageSelect.addEventListener('change', (e) => {
        selectedImagePageIndex = parseInt(e.target.value, 10);
        updateSlidersFromTransform(pageImageStates[selectedImagePageIndex].transform);
    });

    const debouncedGenerate = debounce(onGenerate, 150);

    [scaleSlider, xSlider, ySlider].forEach(slider => {
        slider.addEventListener('input', () => {
            updateTransformFromSliders(pageImageStates[selectedImagePageIndex].transform);
            debouncedGenerate();
        });
    });

    // --- Two-way binding for sliders and number inputs ---
    const sliderNumberPairs = [
        [scaleSlider, scaleNumberInput, 'float'],
        [xSlider, xNumberInput, 'int'],
        [ySlider, yNumberInput, 'int']
    ];

    sliderNumberPairs.forEach(([slider, numberInput, type]) => {
        const parser = type === 'float' ? parseFloat : parseInt;
        slider.addEventListener('input', () => numberInput.value = slider.value);
        numberInput.addEventListener('input', () => slider.value = parser(numberInput.value));
    });


    // --- Sidebar Navigation Logic ---
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPanelId = button.dataset.targetPanel;
            navigateToPanel(targetPanelId);
        });
    });

    backButtons.forEach(button => {
        button.addEventListener('click', () => navigateToPanel('sidebar-main-menu'));
    });

    // --- Mobile Sidebar Toggle ---
    mobileToggleBtn.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('visible');
    });
}

function updateSlidersFromTransform(transform) {
    scaleSlider.value = transform.scale;
    xSlider.value = transform.x;
    ySlider.value = transform.y;

    scaleNumberInput.value = transform.scale;
    xNumberInput.value = transform.x;
    yNumberInput.value = transform.y;
}

function updateTransformFromSliders(transform) {
    transform.scale = parseFloat(scaleSlider.value);
    transform.x = parseInt(xSlider.value, 10);
    transform.y = parseInt(ySlider.value, 10);
}

/**
 * Gets the current values from the UI controls.
 * @returns {{year: number, imageFiles: (File | null)[], canvases: HTMLCanvasElement[], customHolidays: string, imageTransforms: object[], hijriOffset: number}}
 */
export function getUIState() {
    const year = parseInt(yearInput.value, 10) || NOW.getFullYear();
    const imageFiles = pageImageStates.map(state => state.file);
    const imageTransforms = pageImageStates.map(state => state.transform);
    const customHolidays = customHolidaysTextarea.value;
    const hijriOffset = parseInt(hijriOffsetSelect.value, 10);

    return { year, imageFiles, canvases, customHolidays, imageTransforms, hijriOffset };
}

/**
 * Enables or disables the export button.
 * @param {boolean} enabled - True to enable, false to disable.
 */
export function setExportButtonEnabled(enabled) {
    exportPdfBtn.disabled = !enabled;
}

/**
 * Sets the state of the export button to indicate it's busy.
 * @param {boolean} isBusy - True to show "Exporting...", false to revert to "Export to PDF".
 */
export function setExportButtonBusy(isBusy) {
    if (isBusy) {
        exportPdfBtn.disabled = true;
        exportPdfBtn.textContent = 'Mengekspor...';
    } else {
        exportPdfBtn.disabled = false;
        exportPdfBtn.textContent = 'Ekspor ke PDF';
    }
}

/**
 * Shows or hides the main loading indicator over the preview area.
 * @param {boolean} visible - True to show, false to hide.
 */
export function setLoading(visible) {
    if (visible) {
        loadingOverlay.classList.remove('hidden');
    } else {
        loadingOverlay.classList.add('hidden');
    }
}