import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';

export interface ExportProgress {
    current: number;
    total: number;
    status: string;
}

export async function generatePresentationPDF(
    containerId: string,
    filename: string,
    onProgress?: (progress: ExportProgress) => void
) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error("Export container not found");

    const slides = container.querySelectorAll('[data-slide]');
    const total = slides.length;

    // Create PDF with 16:10 aspect ratio (approx 297x185mm for A4 width)
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [297, 185]
    });

    for (let i = 0; i < total; i++) {
        const slide = slides[i] as HTMLElement;

        if (onProgress) {
            onProgress({
                current: i + 1,
                total,
                status: `Capturing slide ${i + 1} of ${total}...`
            });
        }

        // Capture slide
        const dataUrl = await toPng(slide, {
            quality: 0.95,
            pixelRatio: 2, // High DPI for print
            skipFonts: false,
        });

        if (i > 0) pdf.addPage();

        pdf.addImage(dataUrl, 'PNG', 0, 0, 297, 185, undefined, 'FAST');
    }

    pdf.save(filename);
}
