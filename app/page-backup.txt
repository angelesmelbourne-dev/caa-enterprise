'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Product {
  id: string;
  name: string;
  stock: number;
  selling_price: number;
  sku?: string;
}

interface CartItem extends Product {
  cartQuantity: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const tenantId = '00000000-0000-0000-0000-000000000001';

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) {
      console.error(error);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  }

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const found = prev.find((x) => x.id === product.id);

      if (found) {
        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                cartQuantity: item.cartQuantity + 1,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          cartQuantity: 1,
        },
      ];
    });
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.selling_price * item.cartQuantity,
    0
  );

  const vat = subtotal * 0.12;
  const total = subtotal + vat;

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-screen bg-black text-white flex">

      {/* PRODUCTS AREA */}

      <div className="flex-1 flex flex-col">

        {/* HEADER */}

        <div className="border-b border-zinc-800 px-8 py-5">
          <h1 className="text-2xl font-semibold">
            ShopGrid POS
          </h1>

          <p className="text-zinc-500 text-sm mt-1">
            J&M Auto Repair
          </p>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-3 gap-4 p-6">

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-zinc-400 text-xs uppercase">
              Products
            </div>
            <div className="text-2xl font-semibold mt-2">
              {products.length}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-zinc-400 text-xs uppercase">
              Cart Items
            </div>
            <div className="text-2xl font-semibold mt-2">
              {cart.length}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-zinc-400 text-xs uppercase">
              Sales
            </div>
            <div className="text-2xl font-semibold mt-2">
              ₱{total.toFixed(2)}
            </div>
          </div>

        </div>

        {/* SEARCH */}

        <div className="px-6 pb-4">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              bg-zinc-900
              border
              border-zinc-800
              rounded-xl
              px-4
              py-3
              text-white
              placeholder-zinc-500
              focus:outline-none
              focus:ring-1
              focus:ring-emerald-500
            "
          />
        </div>

        {/* PRODUCT GRID */}

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {loading ? (
            <div className="text-zinc-500">
              Loading products...
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">

              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="
                    bg-zinc-900
                    border
                    border-zinc-800
                    rounded-xl
                    p-4
                    text-left
                    hover:border-emerald-500
                    transition-all
                  "
                >
                  <div className="font-medium">
                    {product.name}
                  </div>

                  <div className="text-xs text-zinc-500 mt-1">
                    {product.sku}
                  </div>

                  <div className="mt-4 flex justify-between">
                    <span className="text-zinc-400">
                      Stock {product.stock}
                    </span>

                    <span className="text-emerald-400 font-semibold">
                      ₱{product.selling_price}
                    </span>
                  </div>
                </button>
              ))}

            </div>
          )}
        </div>

      </div>

      {/* CART */}

      <div className="w-[400px] border-l border-zinc-800 bg-zinc-950 flex flex-col">

        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold">
            Current Order
          </h2>

          <p className="text-zinc-500 text-sm">
            {cart.length} items
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">

          {cart.map((item) => (
            <div
              key={item.id}
              className="
                bg-zinc-900
                border
                border-zinc-800
                rounded-xl
                p-4
                mb-3
              "
            >
              <div className="font-medium">
                {item.name}
              </div>

              <div className="text-zinc-500 text-sm mt-1">
                Qty {item.cartQuantity}
              </div>

              <div className="text-emerald-400 mt-2">
                ₱
                {(
                  item.selling_price *
                  item.cartQuantity
                ).toFixed(2)}
              </div>
            </div>
          ))}

        </div>

        {/* TOTALS */}

        <div className="border-t border-zinc-800 p-6">

          <div className="flex justify-between text-zinc-400">
            <span>Subtotal</span>
            <span>₱{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-zinc-400 mt-2">
            <span>VAT</span>
            <span>₱{vat.toFixed(2)}</span>
          </div>

          <div className="flex justify-between mt-5 text-xl font-semibold">
            <span>Total</span>
            <span>₱{total.toFixed(2)}</span>
          </div>

          <button
            className="
              w-full
              mt-6
              py-3
              rounded-xl
              bg-emerald-600
              hover:bg-emerald-700
              transition
              font-medium
            "
          >
            Process Payment
          </button>

        </div>

      </div>

    </div>
  );
}