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
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Hero Banner */}
      <div className="hero-banner">
        <h2>🎉 Bienvenido a Importaciones UTP</h2>
        <p>Tu tienda universitaria de confianza, ahora con Inteligencia Artificial.</p>
        <Link href="/products" className="btn">Ver Catálogo Completo</Link>
      </div>

      <div className="section">
        {/* Offers Section */}
        {offers.length > 0 && (
          <div className="section">
            <h2 className="section-title">🔥 Ofertas Especiales</h2>
            <div className="products-grid">
              <div className="product-row">
                {offers.map((product) => (
                  <ProductCard key={product.id} product={product} isOffer />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Featured Products */}
        <div className="section">
          <h2 className="section-title">Productos Destacados</h2>
          <div className="products-grid">
            <div className="product-row">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <ChatWidget context="El usuario está en la página de inicio de Importaciones UTP viendo ofertas y productos destacados." />
    </div>
  );
}

function ProductCard({ product, isOffer = false }: { product: Product; isOffer?: boolean }) {
  return (
    <div className="product-cell">
      <Link href={`/products/${product.id}`} className="product-card">
        {isOffer && (
          <div className="offer-badge">OFERTA</div>
        )}
        <div className="product-image">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/300'}
            alt={product.name}
          />
        </div>
        <div className="product-category">{product.category}</div>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price">
          {product.discountPrice ? (
            <>
              <span className="product-price-old">${product.price.toFixed(2)}</span>
              ${product.discountPrice.toFixed(2)}
            </>
          ) : (
            <span>${product.price.toFixed(2)}</span>
          )}
        </div>
      </Link>
    </div>
  );
}
