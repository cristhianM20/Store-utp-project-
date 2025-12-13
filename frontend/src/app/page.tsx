'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product, getProducts, getOffers } from '@/lib/products';
import ChatWidget from '@/components/ChatWidget';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, offersData] = await Promise.all([
          getProducts(),
          getOffers()
        ]);
        setFeaturedProducts(productsData.slice(0, 8)); // Show top 8
        setOffers(offersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-black text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Bienvenido a Importaciones UTP</h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">Tu tienda universitaria de confianza, ahora con IA.</p>
          <Link href="/products" className="bg-white text-red-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors">
            Ver Catálogo Completo
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Offers Section */}
        {offers.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-8">
              <span className="text-3xl">🔥</span>
              <h2 className="text-3xl font-bold text-gray-900">Ofertas Especiales</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {offers.map((product) => (
                <ProductCard key={product.id} product={product} isOffer />
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Productos Destacados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>

      <ChatWidget context="El usuario está en la página de inicio de Importaciones UTP viendo ofertas y productos destacados." />
    </div>
  );
}

function ProductCard({ product, isOffer = false }: { product: Product; isOffer?: boolean }) {
  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col relative border border-gray-100">
        {isOffer && (
          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold z-10 animate-pulse">
            OFERTA
          </div>
        )}
        <div className="relative h-48 w-full bg-gray-100 p-4">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/300'}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="text-xs font-medium text-red-600 mb-1 uppercase tracking-wider">
            {product.category}
          </div>
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
            {product.name}
          </h3>
          <div className="mt-auto pt-4 flex items-end justify-between">
            <div className="flex flex-col">
              {product.discountPrice ? (
                <>
                  <span className="text-xs text-gray-400 line-through">${product.price.toFixed(2)}</span>
                  <span className="text-xl font-bold text-red-600">${product.discountPrice.toFixed(2)}</span>
                </>
              ) : (
                <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
              )}
            </div>
            <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
              →
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
