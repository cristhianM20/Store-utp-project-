'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, removeToken, registerFace } from '@/lib/auth';
import BiometricAuth from '@/components/BiometricAuth';

export default function DashboardPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [showBiometric, setShowBiometric] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated()) {
            router.push('/login');
        }
    }, [router]);

    const handleLogout = () => {
        removeToken();
        router.push('/login');
    };

    const handleRegisterFace = async (imageBase64: string) => {
        try {
            await registerFace(imageBase64);
            setMessage('¡Face ID activado exitosamente! Ahora puedes usar tu rostro para iniciar sesión.');
            setShowBiometric(false);
        } catch (error: any) {
            setMessage('Error al activar Face ID: ' + error.message);
            setShowBiometric(false);
        }
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {showBiometric && (
                <BiometricAuth
                    onCapture={handleRegisterFace}
                    onCancel={() => setShowBiometric(false)}
                />
            )}

            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-2xl font-bold text-red-600">
                            Importaciones UTP
                        </h1>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">¡Bienvenido a tu Panel!</h2>
                    <p className="text-gray-600 text-lg mb-6">
                        Has iniciado sesión exitosamente. ¡Comienza a comprar ahora!
                    </p>

                    {message && (
                        <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                            {message}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4">
                        <Link href="/products">
                            <button className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg">
                                Explorar Productos 🛍️
                            </button>
                        </Link>

                        <button
                            onClick={() => setShowBiometric(true)}
                            className="px-6 py-3 border-2 border-red-200 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-all flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                            </svg>
                            Activar Face ID
                        </button>

                        <Link href="/admin">
                            <button className="px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center gap-2">
                                ⚙️ Admin Panel
                            </button>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
