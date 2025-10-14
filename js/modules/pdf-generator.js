/* PDF generation logic will go here */

/**
 * Generates a multi-page PDF from the provided canvas elements.
 * @param {object} options
 * @param {HTMLCanvasElement[]} options.canvases - An array of canvas elements to add as pages.
 * @param {number} options.year - The year of the calendar, used for the filename.
 * @param {string} options.paperSize - The paper size format (e.g., 'a4', 'letter').
 */
export async function generatePdf({ canvases, year, paperSize }) {
    // Access the jsPDF constructor from the global window object created by the UMD script
    // This is now guaranteed to exist because main.js awaits the script load.
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: paperSize || 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = 0; i < canvases.length; i++) {
        const canvas = canvases[i];
        // Use JPEG for smaller file size, with quality 0.9
        const imgData = canvas.toDataURL('image/jpeg', 0.90);

        if (i > 0) {
            doc.addPage();
        }

        // Add the canvas image to the PDF page, fitting it to the page dimensions
        doc.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
    }

    // Save the PDF with a descriptive filename
    doc.save(`Calendar-${year}.pdf`);
}