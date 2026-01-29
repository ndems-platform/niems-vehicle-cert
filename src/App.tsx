import { useState, useCallback } from 'react';
import StepIndicator from './components/StepIndicator';
import UploadStep from './components/UploadStep';
import PreviewStep from './components/PreviewStep';
import GenerateStep from './components/GenerateStep';
import LoginPage from './components/LoginPage';
import { useAuth } from './hooks/useAuth';
import { LogOutIcon, SpinnerIcon } from './components/Icons';
import type { CertificateRecord, AppStep } from './types';

export default function App() {
    const { isAuthenticated, isLoading: authLoading, error: authError, login, logout } = useAuth();
    const [step, setStep] = useState<AppStep>('upload');
    const [records, setRecords] = useState<CertificateRecord[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [fileName, setFileName] = useState('');

    const getStepNumber = (): number => {
        switch (step) {
            case 'upload': return 1;
            case 'preview': return 2;
            case 'generate': return 3;
            default: return 1;
        }
    };

    const handleUploadComplete = useCallback((data: CertificateRecord[], name: string) => {
        setRecords(data);
        setFileName(name);
        // Auto-select all records
        setSelectedIds(new Set(data.map(r => r.id)));
        setStep('preview');
    }, []);

    const handleSelectionChange = useCallback((ids: Set<number>) => {
        setSelectedIds(ids);
    }, []);

    const handleBackToUpload = useCallback(() => {
        setStep('upload');
    }, []);

    const handleBackToPreview = useCallback(() => {
        setStep('preview');
    }, []);

    const handleContinueToGenerate = useCallback(() => {
        setStep('generate');
    }, []);

    const handleReset = useCallback(() => {
        setRecords([]);
        setSelectedIds(new Set());
        setFileName('');
        setStep('upload');
    }, []);

    // Show loading state while checking authentication
    if (authLoading) {
        return (
            <div className="app loading-screen">
                <div className="loading-content">
                    <img src={`${import.meta.env.BASE_URL}logo-200.png`} alt="NIEMS Logo" className="loading-logo" />
                    <div className="loading-spinner"><SpinnerIcon size={24} /></div>
                    <p>กำลังตรวจสอบการเข้าสู่ระบบ...</p>
                </div>
            </div>
        );
    }

    // Show login page if not authenticated
    if (!isAuthenticated) {
        return <LoginPage onLogin={login} error={authError} isLoading={authLoading} />;
    }

    return (
        <div className="app">
            {/* Header */}
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <img src={`${import.meta.env.BASE_URL}logo-200.png`} alt="NIEMS Logo" className="header-logo" />
                        <div>
                            <h1 className="header-title">ระบบสร้างหนังสือรับรองมาตรฐานรถบริการการแพทย์ฉุกเฉิน</h1>
                            <p className="header-subtitle">สถาบันการแพทย์ฉุกเฉินแห่งชาติ (สพฉ.)</p>
                        </div>
                        <button className="logout-button" onClick={logout} title="ออกจากระบบ">
                            <LogOutIcon size={18} />
                            <span>ออกจากระบบ</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="main">
                <div className="container">
                    <div className="card">
                        <StepIndicator currentStep={getStepNumber()} />

                        {step === 'upload' && (
                            <UploadStep onComplete={handleUploadComplete} />
                        )}

                        {step === 'preview' && (
                            <PreviewStep
                                records={records}
                                fileName={fileName}
                                selectedIds={selectedIds}
                                onSelectionChange={handleSelectionChange}
                                onBack={handleBackToUpload}
                                onContinue={handleContinueToGenerate}
                            />
                        )}

                        {step === 'generate' && (
                            <GenerateStep
                                records={records}
                                selectedIds={selectedIds}
                                onBack={handleBackToPreview}
                                onReset={handleReset}
                            />
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <p>© 2569 สถาบันการแพทย์ฉุกเฉินแห่งชาติ (สพฉ.) | National Institute for Emergency Medicine</p>
                </div>
            </footer>
        </div>
    );
}
