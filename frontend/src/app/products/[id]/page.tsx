'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProductById, Product } from '@/lib/products';
import { addToCart } from '@/lib/cart';
import { isAuthenticated } from '@/lib/auth';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        loadProduct();
    }, [params.id]);

    const loadProduct = async () => {
        try {
            const data = await getProductById(parseInt(params.id));
            setProduct(data);
        } catch (error) {
            console.error('Error loading product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }
        if (!product) return;

        try {
            await addToCart(product.id, quantity);
            alert('Product added to cart!');
            router.push('/cart');
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add product to cart');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading product...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 text-lg">Product not found</p>
                    <Link href="/products">
                        <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg">
                            Back to Products
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Header */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/products">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent cursor-pointer">
                                EcommerceAI
                            </h1>
                        </Link>
                        <Link href="/cart">
                            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                                🛒 Cart
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Link href="/products">
                    <button className="mb-6 text-indigo-600 hover:text-indigo-700 flex items-center gap-2 font-medium">
                        ← Volver al Catálogo
                    </button>
                </Link>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="grid md:grid-cols-2">
                        {/* Product Image Zone */}
                        <div className="bg-gray-100 p-8 flex items-center justify-center min-h-[400px]">
                            {product.id ? (
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/api/products/${product.id}/image`}
                                    alt={product.name}
                                    className="w-full max-h-[500px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <span className="text-9xl opacity-20">📦</span>
                            )}
                        </div>

                        {/* Product Info Zone */}
                        <div className="p-8 lg:p-12 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold uppercase tracking-wider">
                                        {product.category || 'Producto'}
                                    </span>
                                    {product.stock > 0 ? (
                                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            Disponible
                                        </span>
                                    ) : (
                                        <span className="text-red-500 text-sm font-medium">Agotado</span>
                                    )}
                                </div>

                                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{product.name}</h1>

                                <div className="flex items-end gap-4 mb-6">
                                    <p className="text-5xl font-bold text-indigo-600">S/ {product.price}</p>
                                    {product.stock < 5 && product.stock > 0 && (
                                        <p className="text-orange-500 font-medium text-sm animate-pulse pb-2">
                                            ¡Solo quedan {product.stock} unidades!
                                        </p>
                                    )}
                                </div>

                                <p className="text-gray-600 text-lg leading-relaxed mb-6 border-l-4 border-indigo-200 pl-4 italic">
                                    {product.description}
                                </p>

                                {/* Specifications Section */}
                                <div className="mb-8 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl p-6 border border-indigo-100">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="text-2xl">📋</span>
                                        Especificaciones Técnicas
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {product.description.split(',').map((spec, index) => {
                                            const trimmedSpec = spec.trim();
                                            if (trimmedSpec.length > 5) {
                                                return (
                                                    <div key={index} className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                                        <span className="text-indigo-600 mt-1 flex-shrink-0">✓</span>
                                                        <span className="text-gray-700 text-sm leading-relaxed">{trimmedSpec}</span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                </div>

                                {/* Quantity Selector */}
                                <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Cantidad</label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex bg-white rounded-lg shadow-sm border border-gray-200">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-l-lg transition-colors font-bold text-xl"
                                            >
                                                -
                                            </button>
                                            <span className="w-16 h-12 flex items-center justify-center font-bold text-xl text-gray-800 border-x border-gray-200">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                                className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-r-lg transition-colors font-bold text-xl"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            Unidades máximas: {product.stock}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {product.stock === 0 ? '🚫 Agotado' : '🛒 Agregar al Carrito'}
                            </button>
                        </div>
                    </div>

                    {/* Additional Info / Features Section (Mocked for depth) */}
                    <div className="border-t border-gray-200">
                        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-gray-200">
                            <div className="p-8 text-center hover:bg-gray-50 transition-colors">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                                    🚀
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Envío Rápido</h3>
                                <p className="text-gray-500 text-sm">Entrega en 24-48 horas en Lima Metropolitana.</p>
                            </div>
                            <div className="p-8 text-center hover:bg-gray-50 transition-colors">
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                                    🛡️
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Garantía Extendida</h3>
                                <p className="text-gray-500 text-sm">12 meses de garantía oficial del fabricante.</p>
                            </div>
                            <div className="p-8 text-center hover:bg-gray-50 transition-colors">
                                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                                    💳
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Pago Seguro</h3>
                                <p className="text-gray-500 text-sm">Transacciones encriptadas y 100% seguras.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
