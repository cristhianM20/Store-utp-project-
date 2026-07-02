'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, saveToken, loginBiometric } from '@/lib/auth';

import BiometricAuth from '@/components/BiometricAuth';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showBiometric, setShowBiometric] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await login(formData);
            saveToken(response.token);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleBiometricCapture = async (imageBase64: string) => {
        if (!formData.email) {
            setError('Por favor ingresa tu correo electrónico para usar Face ID');
            setShowBiometric(false);
            return;
        }

        setLoading(true);
        setShowBiometric(false);

        try {
            const response = await loginBiometric(formData.email, imageBase64);
            saveToken(response.token);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Error en autenticación biométrica');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            {showBiometric && (
                <BiometricAuth
                    onCapture={handleBiometricCapture}
                    onCancel={() => setShowBiometric(false)}
                />
            )}
            <div className="form-container">
                {/* Logo/Brand */}
                <div className="form-title">
                    🛒 Importaciones UTP
                </div>
                <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
                    ¡Bienvenido de nuevo! Inicia sesión en tu cuenta.
                </p>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="tu@ejemplo.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn form-submit"
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>

                    <div style={{ margin: '20px 0', textAlign: 'center', position: 'relative' }}>
                        <div style={{ borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                            O continuar con
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowBiometric(true)}
                        className="btn"
                        style={{ backgroundColor: '#ffffff', color: '#cc0000', border: '2px solid #cc0000', width: '100%' }}
                    >
                        🔐 Inicio de Sesión con Face ID
                    </button>
                </form>

                <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
                    ¿No tienes cuenta?{' '}
                    <Link href="/register">Regístrate</Link>
                </p>
            </div>
        </div>
    );
}
