import { useState } from 'react';
import type { CertificateRecord } from '../types';
import { CheckIcon, InfoIcon, FileTextIcon, ArrowLeftIcon, ArrowRightIcon, EyeIcon } from './Icons';

interface GenerateStepProps {
    records: CertificateRecord[];
    selectedIds: Set<number>;
    onBack: () => void;
    onReset: () => void;
}

export default function GenerateStep({
    records,
    selectedIds,
    onBack,
    onReset,
}: GenerateStepProps) {
    const [isComplete, setIsComplete] = useState(false);

    const selectedRecords = records.filter(r => selectedIds.has(r.id));
    const total = selectedRecords.length;

    const handleOpenPreview = () => {
        // Store data in sessionStorage
        sessionStorage.setItem('certificateData', JSON.stringify(selectedRecords));

        // Open preview in new window
        const basePath = import.meta.env.BASE_URL || '/';
        const previewUrl = `${basePath}preview`;
        window.open(previewUrl, '_blank', 'width=1200,height=900');

        setIsComplete(true);
    };

    if (isComplete) {
        return (
            <div className="fade-in">
                <div className="generate-complete-container">
                    <div className="success-animation">
                        <div className="success-checkmark">
                            <div className="checkmark-circle">
                                <CheckIcon size={32} className="checkmark-icon" />
                            </div>
                        </div>
                    </div>

                    <h2 className="generate-complete-title">เปิด Preview สำเร็จ!</h2>
                    <p className="generate-complete-subtitle">
                        เปิดหน้าต่าง Preview สำหรับหนังสือรับรอง <strong>{total.toLocaleString()}</strong> ฉบับแล้ว
                    </p>

                    <div className="generate-info-card">
                        <div className="info-card-icon"><InfoIcon size={24} /></div>
                        <div className="info-card-content">
                            <h4>วิธีบันทึกเป็น PDF</h4>
                            <div className="info-steps">
                                <div className="info-step">
                                    <span className="step-number">1</span>
                                    <span>กดปุ่ม "พิมพ์ PDF" ในหน้า Preview</span>
                                </div>
                                <div className="info-step">
                                    <span className="step-number">2</span>
                                    <span>เลือก "Save as PDF" หรือ "Microsoft Print to PDF"</span>
                                </div>
                                <div className="info-step">
                                    <span className="step-number">3</span>
                                    <span>กำหนดชื่อไฟล์และตำแหน่งที่จะบันทึก</span>
                                </div>
                                <div className="info-step">
                                    <span className="step-number">4</span>
                                    <span>กดบันทึก เสร็จสิ้น!</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="generate-actions">
                        <button className="btn btn-secondary btn-with-icon" onClick={handleOpenPreview}>
                            <EyeIcon size={18} />
                            <span>เปิด Preview อีกครั้ง</span>
                        </button>
                        <button className="btn btn-primary btn-with-icon" onClick={onReset}>
                            <span>สร้างหนังสือรับรองชุดใหม่</span>
                            <ArrowRightIcon size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="generate-ready-container">
                {/* Header Visual */}
                <div className="generate-visual">
                    <div className="document-stack">
                        <div className="document-page doc-1"><FileTextIcon size={32} /></div>
                        <div className="document-page doc-2"><FileTextIcon size={32} /></div>
                        <div className="document-page doc-3"><FileTextIcon size={32} /></div>
                    </div>
                </div>

                <h2 className="generate-title">พร้อมสร้างหนังสือรับรอง</h2>
                <p className="generate-subtitle">
                    คุณได้เลือกข้อมูลสำหรับสร้างหนังสือรับรองแล้ว
                </p>

                {/* Stats Card */}
                <div className="generate-stats-card">
                    <div className="stats-item">
                        <div className="stats-value">{total.toLocaleString()}</div>
                        <div className="stats-label">ฉบับที่เลือก</div>
                    </div>
                    <div className="stats-divider"></div>
                    <div className="stats-item">
                        <div className="stats-value">A4</div>
                        <div className="stats-label">ขนาดกระดาษ</div>
                    </div>
                    <div className="stats-divider"></div>
                    <div className="stats-item">
                        <div className="stats-value">PDF</div>
                        <div className="stats-label">รูปแบบไฟล์</div>
                    </div>
                </div>

                {/* Features Card */}
                <div className="generate-features-card">
                    <h4>คุณสมบัติระบบ</h4>
                    <div className="features-grid">
                        <div className="feature-item">
                            <span className="feature-icon"><CheckIcon size={16} /></span>
                            <span>คุณภาพฟอนต์ภาษาไทยคมชัด</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon"><CheckIcon size={16} /></span>
                            <span>ตรวจสอบ Layout ก่อนบันทึก</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon"><CheckIcon size={16} /></span>
                            <span>รองรับการพิมพ์หลายฉบับ</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon"><CheckIcon size={16} /></span>
                            <span>ใช้ Browser Print Engine</span>
                        </div>
                    </div>
                </div>

                <div className="generate-actions">
                    <button className="btn btn-secondary btn-with-icon" onClick={onBack}>
                        <ArrowLeftIcon size={18} />
                        <span>ย้อนกลับ</span>
                    </button>
                    <button className="btn btn-primary btn-lg btn-with-icon" onClick={handleOpenPreview}>
                        <EyeIcon size={18} />
                        <span>ดูตัวอย่าง / พิมพ์</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
