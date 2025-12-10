'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCart, updateCartItem, removeFromCart, clearCart, Cart } from '@/lib/cart';
import { isAuthenticated } from '@/lib/auth';

export default function CartPage() {
    const router = useRouter();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }
        loadCart();
    }, [router]);

    const loadCart = async () => {
        try {
            const data = await getCart();
            setCart(data);
        } catch (error) {
            console.error('Error loading cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (itemId: number, quantity: number) => {
        try {
            const updatedCart = await updateCartItem(itemId, quantity);
            setCart(updatedCart);
        } catch (error) {
            console.error('Error updating cart:', error);
            alert('Failed to update cart');
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        try {
            const updatedCart = await removeFromCart(itemId);
            setCart(updatedCart);
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Failed to remove item');
        }
    };

    const handleClearCart = async () => {
        if (!confirm('Are you sure you want to clear your cart?')) return;
        try {
            await clearCart();
            setCart({ id: cart?.id || 0, items: [], totalPrice: 0 });
        } catch (error) {
            console.error('Error clearing cart:', error);
            alert('Failed to clear cart');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading cart...</p>
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
                        <Link href="/dashboard">
                            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                                Dashboard
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Shopping Cart</h2>
                    {cart && cart.items.length > 0 && (
                        <button
                            onClick={handleClearCart}
                            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                        >
                            Clear Cart
                        </button>
                    )}
                </div>

                {!cart || cart.items.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                        <p className="text-gray-500 text-lg mb-6">Your cart is empty</p>
                        <Link href="/products">
                            <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all">
                                Continue Shopping
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.items.map(item => (
                                <div key={item.id} className="bg-white rounded-xl shadow-lg p-6 flex gap-4">
                                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        {item.productImageUrl ? (
                                            <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <span className="text-4xl">📦</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">{item.productName}</h3>
                                        <p className="text-indigo-600 font-semibold">S/ {item.productPrice}</p>
                                        <div className="flex items-center gap-4 mt-4">
                                            <button
                                                onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 transition-colors font-bold"
                                            >
                                                -
                                            </button>
                                            <span className="font-semibold w-8 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 transition-colors font-bold"
                                            >
                                                +
                                            </button>
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="ml-auto text-red-600 hover:text-red-700 font-medium"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-gray-900">S/ {item.subtotal.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Items ({cart.items.length})</span>
                                        <span className="font-semibold">S/ {cart.totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-semibold">FREE</span>
                                    </div>
                                    <div className="border-t pt-2 mt-2">
                                        <div className="flex justify-between text-lg">
                                            <span className="font-bold">Total</span>
                                            <span className="font-bold text-indigo-600">S/ {cart.totalPrice.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg">
                                    Proceed to Checkout
                                </button>
                                <Link href="/products">
                                    <button className="w-full mt-3 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                                        Continue Shopping
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
