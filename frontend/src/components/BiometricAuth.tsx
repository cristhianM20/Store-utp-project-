'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X } from 'lucide-react';

interface BiometricAuthProps {
    onCapture: (imageBase64: string) => void;
    onCancel: () => void;
}

export default function BiometricAuth({ onCapture, onCancel }: BiometricAuthProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string>('');
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [countdown, setCountdown] = useState<number>(0);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            setError('');
            setLoading(true);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                // Wait for video to be ready
                videoRef.current.onloadedmetadata = () => {
                    setLoading(false);
                };
            }
        } catch (err: any) {
            console.error("Error accessing camera:", err);
            setLoading(false);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Permiso de cámara denegado. Por favor, permite el acceso a la cámara en la configuración de tu navegador y haz clic en "Reintentar".');
            } else if (err.name === 'NotFoundError') {
                setError('No se encontró ninguna cámara en tu dispositivo.');
            } else if (err.name === 'NotReadableError') {
                setError('La cámara está siendo usada por otra aplicación. Por favor ciérrala e intenta de nuevo.');
            } else {
                setError('No se pudo acceder a la cámara. Por favor verifica los permisos.');
            }
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const handleCaptureWithCountdown = () => {
        setCountdown(3);
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setTimeout(() => {
                        handleCapture();
                        setCountdown(0);
                    }, 1000);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleCapture = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);
                onCapture(imageBase64);
                stopCamera();
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full relative animate-in fade-in zoom-in duration-300">
                <button
                    onClick={() => { stopCamera(); onCancel(); }}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <X size={24} />
                </button>

                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                    Autenticación Facial
                </h3>
                <p className="text-sm text-gray-500 mb-4 text-center">
                    Centra tu rostro en el recuadro
                </p>

                {error ? (
                    <div className="mb-4">
                        <div className="text-red-600 text-center p-4 bg-red-50 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                        <button
                            onClick={startCamera}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : (
                    <div className="relative rounded-lg overflow-hidden bg-gray-900 aspect-video mb-6 shadow-lg">
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                <div className="text-white text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                                    <p>Iniciando cámara...</p>
                                </div>
                            </div>
                        )}
                        {countdown > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                                <div className="text-white text-8xl font-bold animate-pulse">
                                    {countdown}
                                </div>
                            </div>
                        )}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover transform scale-x-[-1]"
                        />
                        {/* Face guide overlay */}
                        {!loading && countdown === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-48 h-64 border-4 border-white/50 rounded-full"></div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={() => { stopCamera(); onCancel(); }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                    {!error && !loading && countdown === 0 && (
                        <button
                            onClick={handleCaptureWithCountdown}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            <Camera size={20} />
                            Capturar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
