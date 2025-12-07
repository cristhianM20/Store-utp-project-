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
                    <button className="mb-6 text-indigo-600 hover:text-indigo-700 flex items-center gap-2">
                        ← Back to Products
                    </button>
                </Link>

                <div className="bg-white rounded-2xl shadow-xl p-8 grid md:grid-cols-2 gap-8">
                    {/* Product Image */}
                    <div className="h-96 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                        {product.id ? (
                            <img src={`${process.env.NEXT_PUBLIC_API_URL}/api/products/${product.id}/image`} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <span className="text-9xl">📦</span>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                        <p className="text-gray-600 mb-6">{product.description}</p>

                        <div className="mb-6">
                            <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg font-medium">
                                {product.category}
                            </span>
                        </div>

                        <div className="mb-6">
                            <p className="text-4xl font-bold text-indigo-600">${product.price}</p>
                            <p className="text-gray-500 mt-2">{product.stock} items in stock</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-bold"
                                >
                                    -
                                </button>
                                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    className="w-10 h-10 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-bold"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
