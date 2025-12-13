'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProducts, Product } from '@/lib/products';
import { addToCart } from '@/lib/cart';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import ChatWidget from '@/components/ChatWidget';

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (productId: number) => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }
        try {
            await addToCart(productId, 1);
            alert('¡Producto agregado al carrito!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add product to cart');
        }
    };

    const categories = ['all', ...new Set(products.map(p => p.category))];
    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter(p => p.category === selectedCategory);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando productos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard">
                            <h1 className="text-2xl font-bold text-red-600 cursor-pointer">
                                Importaciones UTP
                            </h1>
                        </Link>
                        <div className="flex gap-4">
                            <Link href="/cart">
                                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">
                                    🛒 Carrito
                                </button>
                            </Link>
                            <Link href="/dashboard">
                                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">
                                    Panel
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Nuestros Productos</h2>

                {/* Category Filter */}
                <div className="mb-8 flex gap-2 flex-wrap">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedCategory === cat
                                ? 'bg-red-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
                            <div className="h-48 bg-gray-50 flex items-center justify-center">
                                {product.id ? (
                                    <img src={`${process.env.NEXT_PUBLIC_API_URL}/api/products/${product.id}/image`} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-6xl">📦</span>
                                )}
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-2xl font-bold text-red-600">S/ {product.price}</span>
                                    <span className="text-sm text-gray-500">{product.stock} en stock</span>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Link href={`/products/${product.id}`} className="flex-1">
                                        <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                                            Ver Detalles
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => handleAddToCart(product.id)}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
                                    >
                                        Agregar al Carrito
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No se encontraron productos en esta categoría.</p>
                    </div>
                )}
            </main>
            <ChatWidget context="Página de productos - ayuda al usuario a encontrar lo que busca" />
        </div>
    );
}
