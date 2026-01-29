import { useState, useMemo } from 'react';
import type { CertificateRecord } from '../types';
import {
    FolderIcon,
    ChartBarIcon,
    CheckCircleIcon,
    SearchIcon,
    InboxIcon,
    ArrowLeftIcon,
    ArrowRightIcon
} from './Icons';

interface PreviewStepProps {
    records: CertificateRecord[];
    fileName: string;
    selectedIds: Set<number>;
    onSelectionChange: (ids: Set<number>) => void;
    onBack: () => void;
    onContinue: () => void;
}

const PAGE_SIZE = 50;

export default function PreviewStep({
    records,
    fileName,
    selectedIds,
    onSelectionChange,
    onBack,
    onContinue,
}: PreviewStepProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [provinceFilter, setProvinceFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Get unique provinces and types for filters
    const provinces = useMemo(() => {
        const set = new Set(records.map(r => r.province).filter(Boolean));
        return Array.from(set).sort();
    }, [records]);

    const vehicleTypes = useMemo(() => {
        const set = new Set(records.map(r => r.vehicleClass).filter(Boolean));
        return Array.from(set).sort();
    }, [records]);

    // Filter records
    const filteredRecords = useMemo(() => {
        return records.filter(record => {
            // Search filter
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                const searchFields = [
                    record.documentNumber,
                    record.ownerName,
                    record.registrationNumber,
                    record.province,
                ].join(' ').toLowerCase();
                if (!searchFields.includes(term)) {
                    return false;
                }
            }

            // Province filter
            if (provinceFilter && record.province !== provinceFilter) {
                return false;
            }

            // Type filter
            if (typeFilter && record.vehicleClass !== typeFilter) {
                return false;
            }

            return true;
        });
    }, [records, searchTerm, provinceFilter, typeFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE);
    const paginatedRecords = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredRecords.slice(start, start + PAGE_SIZE);
    }, [filteredRecords, currentPage]);

    // Selection handlers
    const handleSelectAll = () => {
        if (selectedIds.size === filteredRecords.length) {
            const newIds = new Set(selectedIds);
            filteredRecords.forEach(r => newIds.delete(r.id));
            onSelectionChange(newIds);
        } else {
            const newIds = new Set(selectedIds);
            filteredRecords.forEach(r => newIds.add(r.id));
            onSelectionChange(newIds);
        }
    };

    const handleSelectOne = (id: number) => {
        const newIds = new Set(selectedIds);
        if (newIds.has(id)) {
            newIds.delete(id);
        } else {
            newIds.add(id);
        }
        onSelectionChange(newIds);
    };

    const allFilteredSelected = filteredRecords.length > 0 &&
        filteredRecords.every(r => selectedIds.has(r.id));

    const handleQuickSelect = (type: 'all' | 'none') => {
        if (type === 'all') {
            onSelectionChange(new Set(records.map(r => r.id)));
        } else if (type === 'none') {
            onSelectionChange(new Set());
        }
    };

    return (
        <div className="fade-in">
            {/* Header Section */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>
                    ตรวจสอบข้อมูลหนังสือรับรอง
                </h2>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'var(--secondary)', borderRadius: '20px', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                    <FolderIcon size={16} /> <span>ไฟล์: {fileName}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stat-grid">
                <div className="stat-card">
                    <div className="stat-icon bg-navy"><ChartBarIcon size={24} /></div>
                    <div className="stat-content">
                        <h3>{records.length.toLocaleString()}</h3>
                        <p>รายการทั้งหมด</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-green"><CheckCircleIcon size={24} /></div>
                    <div className="stat-content">
                        <h3>{selectedIds.size.toLocaleString()}</h3>
                        <p>เลือกพิมพ์</p>
                    </div>
                </div>
                {filteredRecords.length !== records.length && (
                    <div className="stat-card">
                        <div className="stat-icon bg-orange"><SearchIcon size={24} /></div>
                        <div className="stat-content">
                            <h3>{filteredRecords.length.toLocaleString()}</h3>
                            <p>ค้นพบ</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Data Table Section */}
            <div className="table-container">
                <div className="table-header">
                    <div className="search-box">
                        <span style={{ color: 'var(--text-muted)', display: 'flex' }}>
                            <SearchIcon size={16} />
                        </span>
                        <input
                            type="text"
                            placeholder="ค้นหา..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={provinceFilter}
                            onChange={(e) => {
                                setProvinceFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">ทุกจังหวัด</option>
                            {provinces.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>

                        <select
                            className="filter-select"
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">ทุกประเภท</option>
                            {vehicleTypes.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                        <button className="btn btn-secondary" onClick={() => handleQuickSelect('all')}>
                            เลือกทั้งหมด
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleQuickSelect('none')}>
                            ยกเลิก
                        </button>
                    </div>
                </div>

                <div className="table-scroll">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '48px', textAlign: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={allFilteredSelected}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th style={{ width: '60px' }}>No.</th>
                                <th>เลขที่หนังสือ</th>
                                <th>ชื่อผู้รับอนุญาต</th>
                                <th>ทะเบียน</th>
                                <th>ประเภท</th>
                                <th>ระดับ</th>
                                <th>จังหวัด</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRecords.length > 0 ? (
                                paginatedRecords.map((record) => (
                                    <tr key={record.id} style={selectedIds.has(record.id) ? { background: '#eff6ff' } : {}}>
                                        <td style={{ textAlign: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(record.id)}
                                                onChange={() => handleSelectOne(record.id)}
                                            />
                                        </td>
                                        <td><span className="badge badge-gray">{record.id}</span></td>
                                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{record.documentNumber}</td>
                                        <td>{record.ownerName}</td>
                                        <td><span className="badge badge-blue">{record.registrationNumber}</span></td>
                                        <td>{record.vehicleClass}</td>
                                        <td><span className="badge badge-green">{record.unitLevel}</span></td>
                                        <td>{record.province}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center', opacity: 0.3 }}>
                                            <InboxIcon size={48} />
                                        </div>
                                        <p>ไม่พบข้อมูลตามเงื่อนไข</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="table-footer">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>
                        แสดง <strong>{paginatedRecords.length}</strong> จาก <strong>{filteredRecords.length}</strong> รายการ
                    </div>

                    <div className="pagination">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ArrowLeftIcon size={16} />
                        </button>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                            หน้า {currentPage} / {totalPages || 1}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            <ArrowRightIcon size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="button-group">
                <button className="btn btn-secondary btn-lg" onClick={onBack}>
                    <ArrowLeftIcon size={20} /> ย้อนกลับ
                </button>
                <button
                    className="btn btn-primary btn-lg"
                    onClick={onContinue}
                    disabled={selectedIds.size === 0}
                >
                    สร้างหนังสือรับรอง ({selectedIds.size.toLocaleString()}) <ArrowRightIcon size={20} />
                </button>
            </div>
        </div>
    );
}
