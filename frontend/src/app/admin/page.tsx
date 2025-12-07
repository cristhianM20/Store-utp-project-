'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    stock: number;
}

export default function AdminPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        imageUrl: '',
        category: '',
        stock: ''
    });

    const [uploading, setUploading] = useState(false);
    const [logs, setLogs] = useState<{ timestamp: string, message: string, type: 'info' | 'error' | 'success' }[]>([]);

    const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [{ timestamp, message, type }, ...prev]);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
            if (!res.ok) throw new Error('Failed to fetch products');
            const data = await res.json();
            setProducts(data);
            addLog(`Productos cargados: ${data.length} items`, 'success');
        } catch (err: any) {
            setError('Error loading products');
            addLog(`Error cargando productos: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        addLog('Iniciando creación de producto...', 'info');

        try {
            const token = getToken();
            if (!token) {
                const msg = 'No estás autenticado. Por favor inicia sesión.';
                addLog(msg, 'error');
                alert(msg);
                router.push('/login');
                return;
            }

            // Create product object
            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
                imageUrl: formData.imageUrl,
                category: formData.category,
                stock: parseInt(formData.stock)
            };

            addLog(`Enviando producto: ${productData.name}`, 'info');

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error('Error creating product:', errorData);
                throw new Error(errorData.message || 'Failed to create product');
            }

            await fetchProducts();
            setFormData({
                name: '',
                description: '',
                price: '',
                discountPrice: '',
                imageUrl: '',
                category: '',
                stock: ''
            });

            addLog('Producto creado exitosamente', 'success');
            alert('Producto creado exitosamente!');
        } catch (err: any) {
            console.error(err);
            addLog(`Error: ${err.message}`, 'error');
            alert('Error al crear producto: ' + (err.message || 'Error desconocido'));
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to delete');
            addLog(`Producto #${id} eliminado`, 'success');
            fetchProducts();
        } catch (err: any) {
            addLog(`Error eliminando producto: ${err.message}`, 'error');
            alert('Error deleting product');
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando panel...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">Panel de Administración</h1>

                {/* Create Product Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                    <h2 className="text-xl font-semibold mb-4">Agregar Nuevo Producto</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                            <input
                                type="text"
                                placeholder="Ej. Smartphone X Pro"
                                className="p-2 border rounded w-full"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <input
                                type="text"
                                placeholder="Ej. Electrónica"
                                className="p-2 border rounded w-full"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="p-2 border rounded w-full"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Use punto para decimales.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Oferta (Opcional)</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="p-2 border rounded w-full"
                                value={formData.discountPrice}
                                onChange={e => setFormData({ ...formData, discountPrice: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                            <input
                                type="number"
                                placeholder="0"
                                className="p-2 border rounded w-full"
                                value={formData.stock}
                                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL de la Imagen</label>
                            <input
                                type="url"
                                placeholder="https://ejemplo.com/imagen.jpg"
                                className="p-2 border rounded w-full"
                                value={formData.imageUrl}
                                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                required
                            />
                            {formData.imageUrl && (
                                <div className="mt-2">
                                    <p className="text-xs text-gray-500 mb-1">Vista previa:</p>
                                    <img
                                        src={formData.imageUrl}
                                        alt="Vista previa"
                                        className="h-32 object-contain border rounded bg-gray-50"
                                        onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error+URL'}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                            <textarea
                                placeholder="Detalles del producto..."
                                className="p-2 border rounded w-full h-24"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 md:col-span-2 disabled:opacity-50 font-medium transition-colors"
                            disabled={uploading}
                        >
                            {uploading ? '⏳ Procesando...' : '✨ Crear Producto'}
                        </button>
                    </form>
                </div>

                {/* System Logs */}
                <div className="bg-gray-900 text-gray-100 p-6 rounded-xl shadow-sm mb-8 font-mono text-sm">
                    <h3 className="text-lg font-semibold mb-2 text-gray-300">Registro del Sistema (Logs)</h3>
                    <div className="h-40 overflow-y-auto bg-black/30 p-4 rounded border border-gray-700 space-y-1">
                        {logs.length === 0 && <p className="text-gray-500 italic">Esperando actividad...</p>}
                        {logs.map((log, idx) => (
                            <div key={idx} className={`flex gap-2 ${log.type === 'error' ? 'text-red-400' :
                                log.type === 'success' ? 'text-green-400' : 'text-blue-300'
                                }`}>
                                <span className="opacity-50">[{log.timestamp}]</span>
                                <span>{log.message}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product List */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Inventario de Productos</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-2">ID</th>
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Price</th>
                                    <th className="p-2">Stock</th>
                                    <th className="p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id} className="border-b hover:bg-gray-50">
                                        <td className="p-2">#{product.id}</td>
                                        <td className="p-2">{product.name}</td>
                                        <td className="p-2">${product.price}</td>
                                        <td className="p-2">{product.stock}</td>
                                        <td className="p-2">
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
