import { useEffect, useState } from 'react';
import { CertificateTemplate } from '../components/CertificateTemplate';
import type { CertificateRecord } from '../types';
import '../styles/certificate-print.css';

export function PreviewPage() {
    const [records, setRecords] = useState<CertificateRecord[]>([]);

    useEffect(() => {
        // Load data from sessionStorage
        const dataStr = sessionStorage.getItem('certificateData');
        if (dataStr) {
            try {
                const data = JSON.parse(dataStr);
                setRecords(data);
            } catch (error) {
                console.error('Failed to parse certificate data:', error);
            }
        }
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const handleClose = () => {
        window.close();
    };

    if (records.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>ไม่พบข้อมูลใบรับรอง กรุณาปิดหน้าต่างนี้และลองใหม่อีกครั้ง</p>
                <button onClick={handleClose}>ปิดหน้าต่าง</button>
            </div>
        );
    }

    return (
        <>
            <div className="preview-toolbar no-print">
                <button className="btn-print" onClick={handlePrint}>
                    🖨️ พิมพ์ PDF
                </button>
                <span style={{ color: '#94a3b8' }}>
                    {records.length} ใบรับรอง
                </span>
                <button className="btn-close" onClick={handleClose}>
                    ✕ ปิด
                </button>
            </div>

            <div className="preview-container">
                <div className="certificates-wrapper">
                    {records.map((record, index) => (
                        <CertificateTemplate key={record.id || index} record={record} />
                    ))}
                </div>
            </div>
        </>
    );
}
