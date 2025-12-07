import { getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface CartItem {
    id: number;
    productId: number;
    productName: string;
    productPrice: number;
    productImageUrl: string;
    quantity: number;
    subtotal: number;
}

export interface Cart {
    id: number;
    items: CartItem[];
    totalPrice: number;
}

export async function getCart(): Promise<Cart> {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/cart`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to fetch cart');
    return response.json();
}

export async function addToCart(productId: number, quantity: number = 1): Promise<Cart> {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/cart/items?productId=${productId}&quantity=${quantity}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to add to cart');
    return response.json();
}

export async function updateCartItem(itemId: number, quantity: number): Promise<Cart> {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/cart/items/${itemId}?quantity=${quantity}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to update cart item');
    return response.json();
}

export async function removeFromCart(itemId: number): Promise<Cart> {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to remove item');
    return response.json();
}

export async function clearCart(): Promise<void> {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/cart`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error('Failed to clear cart');
}
