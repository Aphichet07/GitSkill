"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface AuthModalProps {
    onClose: () => void;
}

function AuthModal({ onClose }: AuthModalProps) { 
    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(true);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const router = useRouter(); 

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const endpoint = isLoggingIn ? '/auth/login' : '/auth/register';
            const requestBody = isLoggingIn ? { email, password } : { email, password, username };

            const res = await fetch(`http://127.0.0.1:8000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || `เกิดข้อผิดพลาด (${res.status})`);
            }

            const data = await res.json();
            
            if (isLoggingIn) {
                setMessage({ type: 'success', text: 'เข้าสู่ระบบสำเร็จ!' });
                console.log("Token Data:", data);
                
                const tokenToSave = data.access_token || data.token || data; 
                Cookies.set('token', tokenToSave, { expires: 7, path: '/' });
                
                setTimeout(() => {
                    onClose(); 
                    router.push('/dashboard'); 
                }, 1000);

            } else {
                setMessage({ type: 'success', text: 'สมัครสมาชิกสำเร็จ! ระบบกำลังพาไปหน้าเข้าสู่ระบบ...' });
                setTimeout(() => {
                    setIsLoggingIn(true);
                    setMessage(null);
                    setPassword('');
                }, 1500);
            }

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        
        <div className="relative w-full max-w-md mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
            
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                aria-label="Close"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div className="flex w-full mb-6 bg-gray-100 rounded-lg p-1 mt-2">
                <button
                    type="button"
                    onClick={() => { setIsLoggingIn(true); setMessage(null); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                        isLoggingIn ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    เข้าสู่ระบบ
                </button>
                <button
                    type="button"
                    onClick={() => { setIsLoggingIn(false); setMessage(null); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                        !isLoggingIn ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    สมัครสมาชิก
                </button>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                {isLoggingIn ? 'ยินดีต้อนรับกลับมา!' : 'สร้างบัญชีใหม่'}
            </h2>

            {message && (
                <div className={`p-3 rounded-lg mb-4 text-sm ${
                    message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="you@example.com"
                    />
                </div>

                {!isLoggingIn && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้ (Username)</label>
                        <input 
                            type="text" 
                            required={!isLoggingIn}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="ตั้งชื่อผู้ใช้ของคุณ"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="••••••••"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="mt-2 w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {isLoading ? 'กำลังประมวลผล...' : (isLoggingIn ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก')}
                </button>
            </form>
        </div>
    );
}

export default AuthModal;