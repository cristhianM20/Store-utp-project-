const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    imageUrl: string;
    category: string;
    stock: number;
}

export async function getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_URL}/api/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
}

export async function getOffers(): Promise<Product[]> {
    const response = await fetch(`${API_URL}/api/products/offers`);
    if (!response.ok) throw new Error('Failed to fetch offers');
    return response.json();
}

export async function getProductById(id: number): Promise<Product> {
    const response = await fetch(`${API_URL}/api/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
    const response = await fetch(`${API_URL}/api/products/category/${category}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
}

export async function searchProducts(query: string): Promise<Product[]> {
    const response = await fetch(`${API_URL}/api/products/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search products');
    return response.json();
}
