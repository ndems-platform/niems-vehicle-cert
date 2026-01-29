import { useState, FormEvent } from 'react';
import { UserIcon, LockIcon, AlertIcon, SpinnerIcon } from './Icons';

interface LoginPageProps {
    onLogin: (username: string, password: string) => Promise<boolean>;
    error: string | null;
    isLoading: boolean;
}

export default function LoginPage({ onLogin, error, isLoading }: LoginPageProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (username && password) {
            await onLogin(username, password);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Logo and Branding */}
                <div className="login-header">
                    <img src={`${import.meta.env.BASE_URL}logo-200.png`} alt="NIEMS Logo" className="login-logo" />
                    <h1 className="login-title">ระบบสร้างหนังสือรับรอง</h1>
                    <p className="login-subtitle">มาตรฐานรถบริการการแพทย์ฉุกเฉิน</p>
                </div>

                {/* Login Form */}
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">ชื่อผู้ใช้</label>
                        <div className="input-wrapper">
                            <span className="input-icon"><UserIcon size={18} /></span>
                            <input
                                id="username"
                                type="text"
                                placeholder="กรอกชื่อผู้ใช้"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">รหัสผ่าน</label>
                        <div className="input-wrapper">
                            <span className="input-icon"><LockIcon size={18} /></span>
                            <input
                                id="password"
                                type="password"
                                placeholder="กรอกรหัสผ่าน"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="login-error">
                            <AlertIcon size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading || !username || !password}
                    >
                        {isLoading ? (
                            <>
                                <SpinnerIcon size={18} />
                                <span>กำลังเข้าสู่ระบบ...</span>
                            </>
                        ) : (
                            <>
                                <LockIcon size={18} />
                                <span>เข้าสู่ระบบ</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="login-footer">
                    <p>© 2569 สถาบันการแพทย์ฉุกเฉินแห่งชาติ (สพฉ.)</p>
                </div>
            </div>
        </div>
    );
}
