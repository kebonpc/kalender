/* Handles UI events and DOM manipulation */

const NOW = new Date();

// Get references to all the important DOM elements
const yearInput = document.getElementById('year-input');
const generateBtn = document.getElementById('generate-btn');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const customHolidaysTextarea = document.getElementById('custom-holidays');
const hijriOffsetSelect = document.getElementById('hijri-offset');
const paperSizeSelect = document.getElementById('paper-size-select');
const showLogoToggle = document.getElementById('show-logo-toggle');

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

// Color Picker elements
const colorPickers = {
    year: document.getElementById('year-color-picker'),
    month: document.getElementById('month-color-picker'),
    dayNamesBg: document.getElementById('day-names-bg-color-picker'),
    dayNames: document.getElementById('day-names-color-picker'),
    weekday: document.getElementById('weekday-color-picker'),
    friday: document.getElementById('friday-color-picker'),
    holiday: document.getElementById('holiday-color-picker'),
    customHoliday: document.getElementById('custom-holiday-color-picker'),
    fillerDay: document.getElementById('filler-day-color-picker'),
    subDate: document.getElementById('sub-date-color-picker'),
    arabicNumber: document.getElementById('arabic-number-color-picker'),
    notes: document.getElementById('notes-color-picker'),
    overlay: document.getElementById('overlay-color-picker'),
};

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

const PAPER_DIMENSIONS = {
    a4: { width: 1240, height: 1754 },
    letter: { width: 1275, height: 1650 },
    legal: { width: 1275, height: 2100 },
};

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
 * Updates the width and height of all canvas elements based on the selected paper size.
 * @param {string} paperSize - The selected paper size (e.g., 'a4', 'letter').
 */
function updateCanvasDimensions(paperSize) {
    const dimensions = PAPER_DIMENSIONS[paperSize] || PAPER_DIMENSIONS.a4;
    canvases.forEach(canvas => {
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
    });
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

    // Set initial canvas dimensions based on default paper size
    updateCanvasDimensions(paperSizeSelect.value);

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

    paperSizeSelect.addEventListener('change', (e) => {
        updateCanvasDimensions(e.target.value);
        // Regenerate the calendar to apply the new dimensions
        onGenerate();
    });

    showLogoToggle.addEventListener('change', onGenerate);

    // Add event listeners for all color pickers
    Object.values(colorPickers).forEach(picker => {
        picker.addEventListener('input', debounce(onGenerate, 200));
    });

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

    // Automatically regenerate calendar when custom holidays are changed
    customHolidaysTextarea.addEventListener('input', debounce(onGenerate, 500));

    // Automatically regenerate calendar when the year is changed
    yearInput.addEventListener('input', debounce(onGenerate, 500));

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
 * @returns {{year: number, imageFiles: (File | null)[], canvases: HTMLCanvasElement[], customHolidays: string, imageTransforms: object[], hijriOffset: number, paperSize: string, showLogo: boolean, colors: object}}
 */
export function getUIState() {
    const year = parseInt(yearInput.value, 10) || NOW.getFullYear();
    const imageFiles = pageImageStates.map(state => state.file);
    const imageTransforms = pageImageStates.map(state => state.transform);
    const customHolidays = customHolidaysTextarea.value;
    const hijriOffset = parseInt(hijriOffsetSelect.value, 10);
    const paperSize = paperSizeSelect.value;
    const showLogo = showLogoToggle.checked;

    const colors = {};
    for (const key in colorPickers) {
        colors[key] = colorPickers[key].value;
    }

    return { year, imageFiles, canvases, customHolidays, imageTransforms, hijriOffset, paperSize, showLogo, colors };
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
 * @param {string} [text] - Optional text to display on the loader.
 */
export function setLoading(visible, text = 'Membuat Kalender...') {
    if (visible) {
        loadingOverlay.querySelector('span').textContent = text;
        loadingOverlay.classList.remove('hidden');
    } else {
        loadingOverlay.classList.add('hidden');
    }
}