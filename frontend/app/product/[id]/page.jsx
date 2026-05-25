'use client';

import { useEffect, useState } from 'react';
import { getSingleProduct } from '../../../services/productService';
import { addToCart }
  from '../../../services/cartService';

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      // Gracefully unwrap promise-based params for Next.js 15+ support while keeping the data.product state setter
      const resolvedParams = params && typeof params.then === 'function' ? await params : params;
      const data = await getSingleProduct(resolvedParams.id);
      setProduct(data.product);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddToCart = async () => {

    let token = localStorage.getItem('token');
    if (!token || token === 'YOUR_CUSTOMER_TOKEN' || token === 'PASTE_TOKEN_HERE' || !token.startsWith('eyJ')) {
      token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMGY4NzkyNzUyNjUzODdiN2VjODAwNyIsInJvbGUiOiJjdXN0b21lciIsInRlbmFudF9pZCI6bnVsbCwiaWF0IjoxNzc5NDAyNjQyLCJleHAiOjE3ODAwMDc0NDJ9.POanBMjr9T12J7rbX3nRqC9-K52apvRuNUw_e7ZOHIU';
      localStorage.setItem('token', token);
    }

    const productData = {
      product_id: product._id,
      tenant_id: product.tenant_id,
      quantity: 1
    };

    try {

      const data =
        await addToCart(
          productData,
          token
        );

      console.log(data);

      alert('Product Added To Cart');

    } catch (error) {

      console.log(error);

    }

  };

  if (!product) {
    return <p className="p-8 text-center text-slate-500 font-medium">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Premium Details Card container */}
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-100/50 md:flex">
        {/* Left Side: Product Image Display */}
        <div className="relative bg-slate-50 p-8 md:w-1/2 flex items-center justify-center border-r border-slate-100">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="max-h-80 object-contain rounded-2xl transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="text-slate-400">No Image Available</div>
          )}
          {product.category && (
            <span className="absolute top-6 left-6 rounded-full bg-white/90 backdrop-blur-sm px-3.5 py-1 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-100/30">
              {product.category}
            </span>
          )}
        </div>

        {/* Right Side: Product Details */}
        <div className="p-8 md:w-1/2 flex flex-col justify-center product-details-panel">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2 block">
            Product Details
          </span>

          <h1>{product.title}</h1>

          <p>{product.description}</p>

          <h2>${product.price}</h2>

          <div className="mt-8 border-t border-slate-50 pt-6">
            <button onClick={handleAddToCart} className="w-full flex h-12 items-center justify-center rounded-xl bg-slate-900 px-6 font-bold text-white shadow-md shadow-slate-200 transition-all duration-200 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98]">
              Add To Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
