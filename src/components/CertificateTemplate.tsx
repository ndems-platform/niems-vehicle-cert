import type { CertificateRecord } from '../types';
import '../styles/certificate-print.css';

interface CertificateTemplateProps {
    record: CertificateRecord;
}

function formatThaiDate(dateStr: string): string {
    if (!dateStr) return '…………………………………….';
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

export function CertificateTemplate({ record }: CertificateTemplateProps) {
    const dots = '…………………………………….';
    // Use BASE_URL for logo path (works with GitHub Pages)
    const basePath = import.meta.env.BASE_URL || '/';
    const logoUrl = `${basePath}logo-200.png`;

    return (
        <div className="certificate-page">
            {/* Logo - Centered at top */}
            <div className="cert-logo">
                <img src={logoUrl} alt="NIEMS Logo" />
            </div>

            {/* Watermark - Absolute centered */}
            <div className="cert-watermark">
                <img src={logoUrl} alt="" />
            </div>

            {/* Header - Centered */}
            <div className="cert-header">
                <h1 className="cert-title">หนังสือแสดงการรับรองมาตรฐานรถบริการการแพทย์ฉุกเฉิน</h1>
                <h2 className="cert-subtitle">สถาบันการแพทย์ฉุกเฉินแห่งชาติ</h2>
            </div>

            {/* Document Number and Date - same row, doc# left, date right */}
            <div className="cert-doc-info">
                <div className="doc-number-left">
                    <span>ที่ สพฉ</span>
                    <span className="doc-number-tab">พ.1/ 2569/ </span>
                    <span className="doc-number-value">{record.documentNumber || '................................'}</span>
                </div>
                <div className="doc-date-right">
                    <span>วันที่ </span>
                    <span className="doc-date-value">{formatThaiDate(record.issueDate)}</span>
                </div>
            </div>

            {/* Statement - Bold, with double space before ขอรับรองว่า */}
            <div className="cert-statement">
                <strong>สถาบันการแพทย์ฉุกเฉินแห่งชาติ  ขอรับรองว่า</strong>
            </div>

            {/* Fields - Matching DOCX exactly */}
            <div className="cert-fields">
                <div className="field-row">
                    <span className="field-label">หมายเลขทะเบียนรถ : </span>
                    <span className="field-value">{record.registrationNumber || dots}</span>
                </div>

                <div className="field-row field-row-two-col">
                    <div className="field-col-left">
                        <span className="field-label">ยี่ห้อรถ : </span>
                        <span className="field-value">{record.brand || dots}</span>
                    </div>
                    <div className="field-col-right">
                        <span className="field-label">สีของรถ : </span>
                        <span className="field-value">{record.color || dots}</span>
                    </div>
                </div>

                <div className="field-row">
                    <span className="field-label">ชื่อผู้ถือกรรมสิทธิ์ : </span>
                    <span className="field-value">{record.ownershipHolder || dots}</span>
                </div>

                <div className="field-row">
                    <span className="field-label">รหัสหน่วยปฏิบัติการ : </span>
                    <span className="field-value">{record.operationUnitCode || dots}</span>
                </div>

                <div className="field-row">
                    <span className="field-label">ชื่อหน่วยปฏิบัติการ : </span>
                    <span className="field-value">{record.ownerName || dots}</span>
                </div>

                <div className="field-row">
                    <span className="field-label">ประเภท ระดับ : </span>
                    <span className="field-value">{record.unitLevel || dots}</span>
                </div>

                <div className="field-row">
                    <span className="field-label">ขึ้นทะเบียนเป็นหน่วยปฏิบัติการในจังหวัด : </span>
                    <span className="field-value">{record.province || dots}</span>
                </div>

                <div className="field-row">
                    <span className="field-label">ที่อยู่ : </span>
                    <span className="field-value">{record.address || dots}</span>
                </div>

                <div className="field-row">
                    <span className="field-label">ได้รับการรับรองมาตรฐาน : </span>
                    <span className="field-value">{record.vehicleType || dots}</span>
                </div>
            </div>

            {/* Dates - Centered */}
            <div className="cert-dates">
                <div>รับรอง ณ วันที่ {formatThaiDate(record.issueDate)}</div>
                <div>หมดอายุการรับรอง วันที่ {formatThaiDate(record.expiryDate)}</div>
            </div>

            {/* Signature - Centered with more space above for signature */}
            <div className="cert-signature">
                <div className="sig-space"></div>
                <div className="sig-name">(นายพิเชษฐ์ หนองช้าง)</div>
                <div className="sig-title">เลขาธิการสถาบันการแพทย์ฉุกเฉินแห่งชาติ</div>
            </div>

            {/* Footer Notes */}
            <div className="cert-footer">
                <div className="footer-title">หมายเหตุ  :  </div>
                <div className="footer-notes">
                    <p>*&nbsp;&nbsp;รถบริการการแพทย์ฉุกเฉินที่ได้รับการรับรองมาตรฐานแล้ว อาจถูกยกเลิกการรับรองมาตรฐานได้ หากตรวจพบว่าไม่ปฏิบัติตามเกณฑ์ที่กำหนด</p>
                    <p>*&nbsp;&nbsp;นำหนังสือแสดงการรับรองมาตรฐานรถบริการการแพทย์ฉุกเฉิน ยื่นขออนุญาตใช้สัญญาณไฟวับวาบ และเสียงสัญญาณไซเรน หรือเสียงสัญญาณอย่างอื่น ยังกองบังคับการตำรวจจราจร พื้นที่กรุงเทพมหานคร หรือ ภูธรจังหวัด ที่หน่วยปฏิบัติการนั้นตั้งอยู่ เมื่อได้รับหนังสืออนุญาตดังกล่าว ให้สำเนาหนังสือแจ้งกลับ สถาบันการแพทย์ฉุกเฉินแห่งชาติทันที</p>
                    <p>*&nbsp;&nbsp;สำหรับกรณีรถทะเบียนป้ายแดง (ยังไม่จดทะเบียน) ให้การรับรองชั่วคราว 12 เดือน เมื่อได้รับการจดทะเบียนเรียบร้อยต้องแจ้งมายัง สพฉ. เพื่อออกใบรับรองฉบับใหม่</p>
                </div>
            </div>

            {/* Document Code Footer */}
            <div className="cert-doc-code">
                NIEM-FM-04.02-143
            </div>
        </div>
    );
}
