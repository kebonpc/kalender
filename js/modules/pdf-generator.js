/* PDF generation logic will go here */

/**
 * Generates a multi-page PDF from the provided canvas elements.
 * @param {object} options
 * @param {HTMLCanvasElement[]} options.canvases - An array of canvas elements to add as pages.
 * @param {number} options.year - The year of the calendar, used for the filename.
 */
export async function generatePdf({ canvases, year }) {
    // Access the jsPDF constructor from the global window object created by the UMD script.
    const { jsPDF } = window.jspdf;

    // A4 dimensions in mm: 210 x 297
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
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