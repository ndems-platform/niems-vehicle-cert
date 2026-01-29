// Certificate record type from CSV data
export interface CertificateRecord {
    id: number;
    documentNumber: string;      // เลขที่ออกหนังสือ
    date: string;                // วันที่
    ownerName: string;           // ชื่อผู้รับอนุญาต
    address: string;             // ที่อยู่
    vehicleType: string;         // ประเภทรถ
    vehicleStyle: string;        // ลักษณะ
    registrationNumber: string;  // หมายเลขทะเบียน
    brand: string;               // ยี่ห้อรถ
    color: string;               // สีของรถ
    operationCode: string;       // รหัสรถปฏิบัติการ
    province: string;            // จังหวัดหน่วยปฏิบัติการ
    issueDate: string;           // วันที่ออกให้
    expiryDate: string;          // วันที่หมดอายุ
    registrationType: string;    // ประเภท (ขึ้นทะเบียนใหม่/ต่ออายุ)
    vehicleClass: string;        // ประเภทรถ (CLS/ALS/BLS/MC)
    usageYear: string;           // ปีอายุการใช้งาน
    responsiblePerson: string;   // ผู้รับผิดชอบ
    registrationStyle: string;   // ลักษณะรถตามเล่มทะเบียน
    remarks: string;             // หมายเหตุ
    sideSticker: string;         // สติ๊กเกอร์ด้านข้าง
    frontSticker: string;        // สติ๊กเกอร์ด้านหน้า
    ownershipHolder: string;     // ชื่อผู้ถือกรรมสิทธิ์
    operationUnitCode: string;   // รหัสหน่วยปฏิบัติการ
    operationUnitName: string;   // ชื่อหน่วยปฏิบัติการ
    unitLevel: string;           // ระดับหน่วย
    selected?: boolean;          // UI selection state
}

// Application state
export type AppStep = 'upload' | 'preview' | 'generate';

export interface AppState {
    step: AppStep;
    records: CertificateRecord[];
    selectedIds: Set<number>;
    fileName: string;
    isProcessing: boolean;
    progress: number;
    totalToGenerate: number;
    generatedCount: number;
    logs: LogEntry[];
}

export interface LogEntry {
    timestamp: Date;
    message: string;
    type: 'info' | 'success' | 'error';
}

// PDF generation message for Web Worker
export interface GeneratePDFMessage {
    type: 'generate';
    records: CertificateRecord[];
}

export interface ProgressMessage {
    type: 'progress';
    current: number;
    total: number;
    documentNumber: string;
}

export interface CompleteMessage {
    type: 'complete';
    zipBlob: Blob;
}

export interface ErrorMessage {
    type: 'error';
    message: string;
}

export type WorkerMessage = ProgressMessage | CompleteMessage | ErrorMessage;
