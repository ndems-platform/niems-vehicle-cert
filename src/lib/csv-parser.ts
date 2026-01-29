import * as XLSX from 'xlsx';
import type { CertificateRecord } from '../types';

// Column index mapping (0-based) for the specific CSV format

// Header Name Mapping (Title Row text -> keys)
// Used to find which column index corresponds to which field
const HEADER_MAP: Record<string, keyof CertificateRecord> = {
    'เลขที่ออกหนังสือ': 'documentNumber',
    'วันที่': 'date', // date in header, often maps to issueDate logic or separate
    'ชื่อผู้รับอนุญาต': 'ownerName',
    'ที่อยู่': 'address',
    'ประเภทรถ': 'vehicleType',
    'ลักษณะ': 'vehicleStyle',
    'หมายเลขทะเบียน': 'registrationNumber',
    'ยี่ห้อรถ': 'brand',
    'สีของรถ': 'color',
    'รหัสรถปฏิบัติการ': 'operationCode',
    'รหัสรถปฏิบัติการ (ถ้ามี)': 'operationCode',
    'จังหวัดหน่วยปฏิบัติการ': 'province',
    'วัน เดือน ปีที่ออกให้': 'issueDate',
    'วัน เดือน ปี\r\nที่ออกให้': 'issueDate',
    'วัน เดือน ปี ที่ออกให้': 'issueDate',
    'วันที่ออกให้': 'issueDate',
    'วัน เดือน ปีที่หมดอายุ': 'expiryDate',
    'วัน เดือน ปี\r\nที่หมดอายุ': 'expiryDate',
    'วัน เดือน ปี ที่หมดอายุ': 'expiryDate',
    'วันที่หมดอายุ': 'expiryDate',
    'ประเภท': 'registrationType',
    'ประเภทรถ (CLS / ALS / BLS)': 'vehicleClass',
    'ประเภทรถ\r\n(CLS / ALS / BLS)': 'vehicleClass',
    'ปีอายุการใช้งาน': 'usageYear',
    'ผู้รับผิดชอบ': 'responsiblePerson',
    'ลักษณะรถ ตามเล่มทะเบียนรถ': 'registrationStyle',
    'หมายเหตุ': 'remarks',
    'สติ๊กเกอร์ด้านข้าง': 'sideSticker',
    'สติ๊กเกอร์ด้านหน้า': 'frontSticker',
    'ชื่อผู้ถือกรรมสิทธิ์': 'ownershipHolder',
    'รหัสหน่วยปฏิบัติการ': 'operationUnitCode',
    'รหัสหน่วยปฏิบัติการ ': 'operationUnitCode', // Excel has trailing space
    // Fallback if column names vary slightly
    'ประเภท ระดับ': 'unitLevel',
    'ประเภท ระดับ\r\n.(พื้นฐาน/สูง/เฉพาะทาง/ที่ปรึกษา)': 'unitLevel',
    'ประเภท ระดับ.(พื้นฐาน/สูง/เฉพาะทาง/ที่ปรึกษา)': 'unitLevel', // Normalized version
    'ประเภท ระดับ .(พื้นฐาน/สูง/เฉพาะทาง/ที่ปรึกษา)': 'unitLevel' // Normalized version with space
};

export async function parseFile(file: File): Promise<CertificateRecord[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (!data) {
                    throw new Error('ไม่สามารถอ่านไฟล์ได้');
                }

                // Parse workbook
                const workbook = XLSX.read(data, { type: 'array' });

                // Get first sheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert to array of arrays (raw data)
                const rawData: (string | number | undefined)[][] = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    raw: false,
                    defval: '',
                });

                if (rawData.length < 2) {
                    throw new Error('ไฟล์ไม่มีข้อมูลเพียงพอ (ต้องมีอย่างน้อย 2 บรรทัด)');
                }

                // Find Header Row
                // We analyze the first few rows to find one that contains known keywords
                let headerRowIndex = -1;
                let columnMap: Map<number, keyof CertificateRecord> = new Map();

                // Look for "เลขที่ออกหนังสือ" or "ชื่อผู้รับอนุญาต" in rows 0-5
                for (let r = 0; r < Math.min(10, rawData.length); r++) {
                    const row = rawData[r];
                    let matchCount = 0;
                    row.forEach(cell => {
                        const cellStr = String(cell || '').trim();
                        // Check if any key in HEADER_MAP is contained in this cell
                        // Exact match or partial? Let's try exact/starts-with first
                        if (Object.keys(HEADER_MAP).some(k => cellStr.includes(k) || k === cellStr)) {
                            matchCount++;
                        }
                    });

                    // If we found a row with multiple matches, assume it's the header
                    if (matchCount > 3) {
                        headerRowIndex = r;
                        break;
                    }
                }

                if (headerRowIndex === -1) {
                    // Fallback: Assume Row 1 (index 1) if Row 0 is Title
                    headerRowIndex = 1;
                    console.warn('Could not auto-detect header row, using default index 1');
                }

                // Build Column Map from Header Row
                const headerRow = rawData[headerRowIndex];
                headerRow.forEach((cell, index) => {
                    const headerText = String(cell || '').trim();
                    // Match against HEADER_MAP
                    // Try exact match first
                    let mappedKey = HEADER_MAP[headerText];

                    // If no exact match, try normalized (remove newlines)
                    if (!mappedKey) {
                        const normalized = headerText.replace(/\r\n/g, '').replace(/\n/g, '').replace(/\s+/g, ' ');
                        mappedKey = HEADER_MAP[normalized];

                        // Try Partial
                        if (!mappedKey) {
                            for (const [k, v] of Object.entries(HEADER_MAP)) {
                                if (normalized.includes(k)) {
                                    mappedKey = v;
                                    break;
                                }
                            }
                        }
                    }

                    if (mappedKey) {
                        columnMap.set(index, mappedKey);
                    }
                });

                console.log('Detected Header Row:', headerRowIndex);
                console.log('Mapped Columns:', Object.fromEntries(columnMap));

                const records: CertificateRecord[] = [];
                let idCounter = 1;

                // Iterate data rows (start after header)
                for (let i = headerRowIndex + 1; i < rawData.length; i++) {
                    const row = rawData[i];
                    if (!row || row.length === 0) continue;

                    // Skip empty rows (check if all mapped columns are empty)
                    let hasData = false;

                    // Basic sanity check: Must have at least document number OR owner name OR Reg Number
                    // Or usually Column 0 is "Sequence/No"

                    const record: Partial<CertificateRecord> = {};

                    // Copy mapped fields
                    columnMap.forEach((key, colIndex) => {
                        let value = row[colIndex];
                        if (value !== undefined && value !== null) {
                            let strValue = String(value).trim();
                            // Clean up specific fields
                            if (key === 'brand') {
                                strValue = strValue.replace(/^ยี่ห้อรถ\s*/, '');
                            }
                            if (key === 'color') {
                                strValue = strValue.replace(/^สีของรถ\s*/, '');
                            }

                            if (strValue) {
                                (record as Record<string, unknown>)[key] = strValue;
                                hasData = true;
                            }
                        }
                    });

                    if (!hasData) continue;

                    // Skip if key fields are missing (optional refinement)
                    // But some rows might be partial. Let's keep if it has name or doc ID.
                    if (!record.documentNumber && !record.ownerName && !record.registrationNumber) continue;

                    // Ensure ID
                    record.id = idCounter++;

                    records.push(record as CertificateRecord);
                }

                console.log('Parsed records:', records.length);

                if (records.length === 0) {
                    throw new Error('ไม่พบข้อมูลในไฟล์ กรุณาตรวจสอบว่าไฟล์มีข้อมูลตามรูปแบบที่กำหนด');
                }

                resolve(records);
            } catch (error) {
                console.error('Parse error:', error);
                reject(error instanceof Error ? error : new Error('เกิดข้อผิดพลาดในการอ่านไฟล์'));
            }
        };

        reader.onerror = () => {
            reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
        };

        reader.readAsArrayBuffer(file);
    });
}

export function validateFile(file: File): { valid: boolean; error?: string } {
    const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
        'application/vnd.ms-excel', // xls
        'text/csv',
        'application/csv',
    ];

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!validTypes.includes(file.type) && !validExtensions.includes(extension)) {
        return {
            valid: false,
            error: 'รูปแบบไฟล์ไม่ถูกต้อง รองรับเฉพาะ Excel (.xlsx, .xls) หรือ CSV',
        };
    }

    // 50MB limit
    if (file.size > 50 * 1024 * 1024) {
        return {
            valid: false,
            error: 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 50 MB)',
        };
    }

    return { valid: true };
}
