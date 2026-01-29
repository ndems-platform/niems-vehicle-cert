import { useState, useCallback, DragEvent, ChangeEvent } from 'react';
import { parseFile, validateFile } from '../lib/csv-parser';
import type { CertificateRecord } from '../types';
import { FolderIcon, SpinnerIcon, CheckCircleIcon, InfoIcon, DownloadIcon, AlertIcon } from './Icons';

interface UploadStepProps {
    onComplete: (records: CertificateRecord[], fileName: string) => void;
}

export default function UploadStep({ onComplete }: UploadStepProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [recordCount, setRecordCount] = useState<number>(0);

    const handleFile = useCallback(async (file: File) => {
        setError(null);

        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
            setError(validation.error || 'ไฟล์ไม่ถูกต้อง');
            return;
        }

        setIsLoading(true);
        setUploadedFile(file);

        try {
            const records = await parseFile(file);
            setRecordCount(records.length);
            onComplete(records, file.name);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอ่านไฟล์');
            setUploadedFile(null);
        } finally {
            setIsLoading(false);
        }
    }, [onComplete]);

    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }, [handleFile]);

    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    }, [handleFile]);

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="fade-in">
            <div
                className={`upload-area ${isDragging ? 'dragover' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById('file-input')?.click()}
            >
                <input
                    id="file-input"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleInputChange}
                    style={{ display: 'none' }}
                />

                {isLoading ? (
                    <>
                        <div className="upload-icon">
                            <SpinnerIcon size={48} />
                        </div>
                        <div className="upload-title">กำลังอ่านไฟล์...</div>
                        <div className="upload-subtitle">กรุณารอสักครู่</div>
                    </>
                ) : (
                    <>
                        <div className="upload-icon">
                            <FolderIcon size={48} />
                        </div>
                        <div className="upload-title">ลากไฟล์มาวางที่นี่ หรือ คลิกเพื่อเลือกไฟล์</div>
                        <div className="upload-subtitle">
                            อัปโหลดไฟล์ข้อมูลที่ต้องการสร้างหนังสือรับรอง
                        </div>
                        <div className="upload-formats">
                            รองรับ: Excel (.xlsx, .xls) หรือ CSV (.csv) • ขนาดไม่เกิน 50 MB
                        </div>
                    </>
                )}
            </div>

            {error && (
                <div className="alert alert-warning">
                    <span className="alert-icon"><AlertIcon size={20} /></span>
                    <div>{error}</div>
                </div>
            )}

            {uploadedFile && !error && !isLoading && (
                <div className="file-info">
                    <span className="file-info-icon"><CheckCircleIcon size={32} /></span>
                    <div className="file-info-details">
                        <h4>{uploadedFile.name}</h4>
                        <p>
                            ขนาด: {formatFileSize(uploadedFile.size)} • พบข้อมูล {recordCount.toLocaleString()} รายการ
                        </p>
                    </div>
                </div>
            )}

            <div className="alert alert-info" style={{ marginTop: '24px' }}>
                <span className="alert-icon"><InfoIcon size={20} /></span>
                <div>
                    <strong>คำแนะนำ:</strong> ใช้ไฟล์ข้อมูลตามแบบฟอร์มที่กำหนด
                    โดยต้องมีคอลัมน์: เลขที่ออกหนังสือ, ชื่อผู้รับอนุญาต, หมายเลขทะเบียน, ยี่ห้อรถ, สีของรถ เป็นต้น
                </div>
            </div>

            <div className="template-download">
                <a
                    href={`${import.meta.env.BASE_URL}template.xlsx`}
                    download="template.xlsx"
                    className="btn btn-secondary"
                >
                    <DownloadIcon size={18} />
                    <span>ดาวน์โหลด Template</span>
                </a>
            </div>
        </div>
    );
}
