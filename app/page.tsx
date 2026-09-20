'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Product {
  id: string;
  name: string;
  selling_price: number;
  stock: number;
  sku?: string;
}

interface Service {
  id: string;
  name: string;
  category?: string;
  price: number;
}

interface CartItem {
  id: string;
  name: string;
  selling_price: number;
  stock: number;
  cartQuantity: number;
  type: 'product' | 'service';
}

export default function POSPage() {
  const tenantId = '00000000-0000-0000-0000-000000000001';

  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchServices();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) {
      console.error(error);
      return;
    }

    setProducts(data || []);
  }

  async function fetchServices() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) {
      console.error(error);
      return;
    }

    setServices(data || []);
    setLoading(false);
  }

  const addProductToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);

      if (existing) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, cartQuantity: i.cartQuantity + 1 }
            : i
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          selling_price: product.selling_price,
          stock: product.stock,
          cartQuantity: 1,
          type: 'product',
        },
      ];
    });
  };

  const addServiceToCart = (service: Service) => {
    setCart((prev) => [
      ...prev,
      {
        id: `${service.id}-${Date.now()}`,
        name: service.name,
        selling_price: service.price,
        stock: 9999,
        cartQuantity: 1,
        type: 'service',
      },
    ]);
  };

  const updateQuantity = (
    id: string,
    amount: number
  ) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? {
                ...item,
                cartQuantity:
                  item.cartQuantity + amount,
              }
            : item
        )
        .filter((item) => item.cartQuantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      item.selling_price * item.cartQuantity,
    0
  );

  const vat = subtotal * 0.12;
  const total = subtotal + vat;

const handleCheckout = async () => {
  try {

    // 1. Create Sale Record

    const { data: sale, error: saleError } =
      await supabase
        .from('sales')
        .insert([
          {
            tenant_id: tenantId,
            total_amount: total,
            payment_method: 'Cash',
          },
        ])
        .select()
        .single();

    if (saleError) {
      console.error(saleError);
      alert('Failed to create sale.');
      return;
    }

    // 2. Save Sale Items

    const saleItems = cart.map((item) => ({
      sale_id: sale.id,
      item_name: item.name,
      item_type: item.type,
      quantity: item.cartQuantity,
      unit_price: item.selling_price,
      total_price:
        item.selling_price * item.cartQuantity,
    }));

    const { error: itemError } =
      await supabase
        .from('sale_items')
        .insert(saleItems);

    if (itemError) {
      console.error(itemError);
      alert('Failed to save sale items.');
      return;
    }

    // 3. Update Product Stocks

    for (const item of cart) {

      if (item.type === 'service') continue;

      const newStock =
        item.stock - item.cartQuantity;

      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.id);

      if (error) {
        console.error(error);
      }
    }

    // 4. Clear Cart

    setCart([]);

    // 5. Refresh Products

    fetchProducts();

    // 6. Success Message

    alert(
      `Sale completed successfully!\nTotal: ₱${total.toFixed(
        2
      )}`
    );

  } catch (error) {
    console.error(error);
    alert('Something went wrong.');
  }
};

  const filteredProducts = products.filter(
    (product) =>
      product.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      product.sku
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="h-screen bg-black text-white flex">

      {/* LEFT */}

      <div className="flex-1 flex flex-col">

        <div className="border-b border-zinc-800 px-6 py-5">
          <h1 className="text-2xl font-semibold">
            ShopGrid POS
          </h1>

          <p className="text-zinc-500">
            J&M Auto Repair
          </p>
        </div>

        <div className="p-6">

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="
              w-full
              bg-zinc-900
              border
              border-zinc-800
              rounded-xl
              px-4
              py-3
              mb-6
            "
          />

          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <h2 className="font-semibold mb-4">
                Products
              </h2>

              <div className="grid grid-cols-4 gap-4">

                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() =>
                      addProductToCart(product)
                    }
                    className="
                      bg-zinc-900
                      border
                      border-zinc-800
                      rounded-xl
                      p-4
                      text-left
                      hover:border-emerald-500
                    "
                  >
                    <div className="font-medium">
                      {product.name}
                    </div>

                    <div className="text-zinc-500 text-xs">
                      Stock {product.stock}
                    </div>

                    <div className="text-emerald-400 mt-3">
                      ₱{product.selling_price}
                    </div>
                  </button>
                ))}
              </div>

              <h2 className="font-semibold mt-10 mb-4">
                Services
              </h2>

              <div className="grid grid-cols-3 gap-4">

                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() =>
                      addServiceToCart(service)
                    }
                    className="
                      bg-zinc-900
                      border
                      border-zinc-800
                      rounded-xl
                      p-4
                      text-left
                      hover:border-emerald-500
                    "
                  >
                    <div className="font-medium">
                      {service.name}
                    </div>

                    <div className="text-xs text-zinc-500">
                      {service.category}
                    </div>

                    <div className="text-emerald-400 mt-3">
                      ₱{service.price}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* RIGHT */}

      <div className="w-[400px] border-l border-zinc-800 bg-zinc-950 flex flex-col">

        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold">
            Current Order
          </h2>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">

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
              <div className="flex justify-between">

                <div>
                  <div>{item.name}</div>

                  <div className="text-xs text-zinc-500">
                    {item.type}
                  </div>
                </div>

                <button
                  onClick={() =>
                    removeItem(item.id)
                  }
                  className="text-red-400"
                >
                  ×
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2">

                <button
                  onClick={() =>
                    updateQuantity(
                      item.id,
                      -1
                    )
                  }
                  className="px-2 bg-zinc-800 rounded"
                >
                  -
                </button>

                <span>
                  {item.cartQuantity}
                </span>

                <button
                  onClick={() =>
                    updateQuantity(
                      item.id,
                      1
                    )
                  }
                  className="px-2 bg-zinc-800 rounded"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-zinc-800">

          <div className="flex justify-between text-zinc-400">
            <span>Subtotal</span>
            <span>
              ₱{subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-zinc-400 mt-2">
            <span>VAT</span>
            <span>₱{vat.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-xl font-semibold mt-4">
            <span>Total</span>
            <span>
              ₱{total.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            className="
              w-full
              mt-6
              py-3
              rounded-xl
              bg-emerald-600
              hover:bg-emerald-700
            "
          >
            Process Payment
          </button>
        </div>
      </div>
    </div>
  );
}