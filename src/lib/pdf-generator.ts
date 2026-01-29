import { jsPDF } from 'jspdf';
import type { CertificateRecord } from '../types';

// Asset data
let assetsLoaded = false;
let regularFontBase64: string | null = null;
let boldFontBase64: string | null = null;
let logoBase64: string | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export async function loadAssets(): Promise<void> {
    if (assetsLoaded && regularFontBase64 && boldFontBase64 && logoBase64) return;

    try {
        let basePath = import.meta.env.BASE_URL || '/';
        if (!basePath.endsWith('/')) {
            basePath += '/';
        }

        const regularUrl = `${basePath}fonts/Sarabun-Regular.ttf`;
        const boldUrl = `${basePath}fonts/Sarabun-Bold.ttf`;
        const logoUrl = `${basePath}logo-200.png`;

        const [regRes, boldRes, logoRes] = await Promise.all([
            fetch(regularUrl),
            fetch(boldUrl),
            fetch(logoUrl)
        ]);

        if (regRes.ok && boldRes.ok && logoRes.ok) {
            const regBuffer = await regRes.arrayBuffer();
            const boldBuffer = await boldRes.arrayBuffer();
            const logoBuffer = await logoRes.arrayBuffer();

            regularFontBase64 = arrayBufferToBase64(regBuffer);
            boldFontBase64 = arrayBufferToBase64(boldBuffer);
            logoBase64 = arrayBufferToBase64(logoBuffer);

            assetsLoaded = true;
        } else {
            console.error('Failed to load assets');
        }
    } catch (error) {
        console.error('Error loading assets:', error);
    }
}

// Thai Date Formatter
function formatThaiDate(dateStr: string): string {
    if (!dateStr) return '';
    if (dateStr.includes('พ.ศ.')) return dateStr;

    let date: Date;
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            let year = parseInt(parts[2]);
            if (year < 2400) year += 543;
            const month = parseInt(parts[1]) - 1;
            const day = parseInt(parts[0]);
            date = new Date(year - 543, month, day);
        } else {
            date = new Date(dateStr);
        }
    } else {
        date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) return dateStr;

    const months = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} พ.ศ. ${date.getFullYear() + 543}`;
}

// Helper to fill dots
// We want to print dots up to a certain width or count.
function getDots(doc: jsPDF, widthMM: number): string {
    const dotChar = '.';
    const dotW = doc.getTextWidth(dotChar);
    const count = Math.floor(widthMM / dotW);
    return dotChar.repeat(count);
}

export async function generateCertificatePDF(record: CertificateRecord): Promise<Uint8Array> {
    await loadAssets();

    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    if (regularFontBase64) {
        doc.addFileToVFS('Sarabun-Regular.ttf', regularFontBase64);
        doc.addFont('Sarabun-Regular.ttf', 'Sarabun', 'normal');
    }
    if (boldFontBase64) {
        doc.addFileToVFS('Sarabun-Bold.ttf', boldFontBase64);
        doc.addFont('Sarabun-Bold.ttf', 'Sarabun', 'bold');
    }

    // A4 = 210 x 297
    // 25mm.
    const leftMargin = 25;
    const pageWidth = 210;
    const centerX = pageWidth / 2;

    let currentY = 15;

    // --- LOGO ---
    const logoSize = 15; // mm (smaller)
    if (logoBase64) {
        // Center Logo
        const logoX = centerX - (logoSize / 2);
        doc.addImage(logoBase64, 'PNG', logoX, currentY, logoSize, logoSize);
    }
    currentY += logoSize + 3;

    // --- HEADER ---
    doc.setFont('Sarabun', 'bold');
    doc.setFontSize(18); // Thai government standard title size
    // Adjust visual center
    doc.text("หนังสือแสดงการรับรองมาตรฐานรถบริการการแพทย์ฉุกเฉิน", centerX, currentY, { align: 'center' });
    currentY += 6;
    doc.setFontSize(16); // Subtitle slightly smaller
    doc.text("สถาบันการแพทย์ฉุกเฉินแห่งชาติ", centerX, currentY, { align: 'center' });
    currentY += 8;

    // --- DOC NUM & DATE ---
    doc.setFont('Sarabun', 'normal');
    doc.setFontSize(14); // Thai government standard body size
    const lineHeight = 8; // 8pt line spacing as requested

    const docNum = record.documentNumber || '';
    doc.text(`ที่ สพฉ พ.1/2569/${docNum}`, leftMargin, currentY);
    currentY += lineHeight;

    const dateStr = record.issueDate ? formatThaiDate(record.issueDate) : '................................';
    doc.text(`วันที่   ${dateStr}`, 100, currentY);
    currentY += 8;

    // --- CERTIFY STATEMENT (Bold) ---
    doc.setFont('Sarabun', 'bold');
    doc.text("สถาบันการแพทย์ฉุกเฉินแห่งชาติ  ขอรับรองว่า", leftMargin + 20, currentY);
    currentY += 8;

    // --- FIELDS ---
    const labelX = leftMargin + 10;
    const valueStartOffset = 3;

    const drawRow = (label: string, value: string, y: number, x: number = labelX, dotsWidth: number = 0) => {
        doc.setFont('Sarabun', 'bold');
        doc.text(label, x, y);
        const w = doc.getTextWidth(label);

        doc.setFont('Sarabun', 'normal');
        const valX = x + w + valueStartOffset;
        const valText = value || (dotsWidth > 0 ? getDots(doc, dotsWidth) : '-');
        doc.text(valText, valX, y);
        return valX + doc.getTextWidth(valText);
    };

    // Row 1: Reg
    drawRow("หมายเลขทะเบียนรถ  :", record.registrationNumber || '', currentY);
    currentY += lineHeight;

    // Row 2: Brand + Color (same line)
    drawRow("ยี่ห้อรถ  :", record.brand || '', currentY);
    drawRow("สีของรถ  :", record.color || '', currentY, 110);
    currentY += lineHeight;

    // Row 3: Owner + Unit Code (same line)
    drawRow("ชื่อผู้ถือกรรมสิทธิ์ :", record.ownershipHolder || record.ownerName || '', currentY);
    drawRow("รหัสหน่วยปฏิบัติการ  :", record.operationUnitCode || record.operationCode || '', currentY, 110);
    currentY += lineHeight;

    // Row 4: Unit Name
    drawRow("ชื่อหน่วยปฏิบัติการ:", record.operationUnitName || '', currentY);
    currentY += lineHeight;

    // Row 5: Type / Level
    drawRow("ประเภท ระดับ  :", record.unitLevel || '', currentY);
    currentY += lineHeight;

    // Row 6: Province
    drawRow("ขึ้นทะเบียนเป็นหน่วยปฏิบัติการในจังหวัด:", record.province || '', currentY);
    currentY += lineHeight;

    // Row 7: Address
    drawRow("ที่อยู่   :", record.address || '', currentY);
    currentY += lineHeight;

    // Row 8: Standard
    drawRow("ได้รับการรับรองมาตรฐาน:", record.vehicleType || '', currentY);
    currentY += 10;

    // --- SIGNATURE SECTION ---
    const certDate = record.issueDate ? formatThaiDate(record.issueDate) : '................................';
    const expDate = record.expiryDate ? formatThaiDate(record.expiryDate) : '................................';

    doc.setFont('Sarabun', 'normal');
    doc.text(`รับรอง ณ วันที่  ${certDate}`, centerX, currentY, { align: 'center' });
    currentY += lineHeight;
    doc.text(`หมดอายุการรับรอง วันที่  ${expDate}`, centerX, currentY, { align: 'center' });
    currentY += 10;

    doc.setFont('Sarabun', 'bold');
    doc.text("(นายพิเชษฐ์ หนองช้าง)", centerX, currentY, { align: 'center' });
    currentY += lineHeight;
    doc.setFont('Sarabun', 'normal');
    const titleLines = doc.splitTextToSize("เลขาธิการสถาบันการแพทย์ฉุกเฉินแห่งชาติ", 100);
    doc.text(titleLines, centerX, currentY, { align: 'center' });

    // --- FOOTER NOTES ---
    // A4 page = 297mm, bottom margin = 15mm
    // Move footer up to Y=250 to ensure notes fit
    const footerY = 250;
    doc.setFontSize(8); // Smaller font for notes
    doc.setFont('Sarabun', 'bold');
    doc.text("หมายเหตุ :", leftMargin, footerY);

    doc.setFont('Sarabun', 'normal');
    const noteLines = [
        "* รถที่ได้รับการรับรองแล้ว อาจถูกยกเลิกได้ หากไม่ปฏิบัติตามเกณฑ์ที่กำหนด",
        "* นำหนังสือฯ ไปยื่นขออนุญาตใช้สัญญาณไฟวับวาบ ต่อกองบังคับการตำรวจจราจร หรือภูธรจังหวัดในพื้นที่",
        "* กรณีรถป้ายแดง ให้การรับรองชั่วคราว 12 เดือน และต้องแจ้ง สพฉ. เพื่อออกใบรับรองฉบับใหม่"
    ];

    let noteY = footerY + 4;
    const lineHeightNote = 4;

    for (const line of noteLines) {
        doc.text(line, leftMargin, noteY);
        noteY += lineHeightNote;
    }

    const pdfBytes = doc.output('arraybuffer');
    return new Uint8Array(pdfBytes);
}

export function generateFileName(record: CertificateRecord): string {
    const docNum = (record.documentNumber || 'unknown')
        .replace(/[\\/:\*\?"<>|]/g, '-')
        .replace(/\./g, '_')
        .replace(/\s+/g, '_');
    return `cert_${docNum}.pdf`;
}
