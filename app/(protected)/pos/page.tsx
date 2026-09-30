"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface Item {
    id: string;
    name: string;
    type: "product" | "service";
    category: string;
    price: number;
    stock: number;
    sku: string;
    tenant_id: string;
}

export interface CartItem extends Item {
    quantity: number;
}

type PaymentMethod = "cash" | "card" | "gcash";

export default function POSPage() {
    const [items, setItems] = useState<Item[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
    const [amountTendered, setAmountTendered] = useState("");

    const [gcashReference, setGcashReference] = useState("");
    const [showReceipt, setShowReceipt] = useState(false);

    const [lastTransaction, setLastTransaction] = useState<{
        cart: CartItem[];
        subtotal: number;
        tax: number;
        total: number;
        paymentMethod: string;
        tendered: number;
        change: number;
        gcashReference?: string;
        date: string;
    } | null>(null);

    const fetchItems = async () => {
        setIsLoading(true);

        const { data, error } = await supabase
            .from("inventory")
            .select("*")
            .order("name");

        if (!error && data) {
            setItems(data);
        }

        setIsLoading(false);
    };

    const addToCart = (item: Item) => {
        setCart((prev) => {
            const existing = prev.find((c) => c.id === item.id);

            if (existing) {
                if (item.type === "product" && existing.quantity >= item.stock) {
                    return prev;
                }

                return prev.map((c) =>
                    c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
                );
            }

            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const updateCartQuantity = (id: string, delta: number) => {
        setCart((prev) =>
            prev
                .map((item) => {
                    if (item.id === id) {
                        const newQty = item.quantity + delta;

                        if (newQty <= 0) return null;
                        if (item.type === "product" && newQty > item.stock) return item;

                        return {
                            ...item,
                            quantity: newQty,
                        };
                    }

                    return item;
                })
                .filter(Boolean) as CartItem[]
        );
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const categories = ["All", ...Array.from(new Set(items.map((i) => i.category)))];

    const filteredItems = items.filter((item) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            item.name.toLowerCase().includes(query) ||
            (item.sku ?? "").toLowerCase().includes(query);
        const matchesCategory =
            selectedCategory === "All" || item.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const subtotal = cart.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );
    const tax = subtotal * 0.12;
    const total = subtotal + tax;
    const tenderedNum = parseFloat(amountTendered) || 0;
    const change = Math.max(0, tenderedNum - total);

    const handleCheckout = async () => {
        if (
            paymentMethod === "gcash" &&
            !gcashReference.trim()
        ) {
            alert("GCash reference number is required");
            return;
        }
        if (cart.length === 0) return;

        if (paymentMethod === "cash" && tenderedNum < total) {
            alert("Tendered amount is insufficient");
            return;
        }

        try {
            const tenantId = items[0]?.tenant_id;

            const { data: sale, error: saleError } = await supabase
                .from("sales")
                .insert({
                    tenant_id: tenantId,
                    total_amount: total,
                    payment_method: paymentMethod,
                })
                .select()
                .single();

            if (saleError) {
                throw saleError;
            }
            const saleItems = cart.map((item) => ({
                sale_id: sale.id,
                item_name: item.name,
                quantity: item.quantity,
                item_type: item.type,
                unit_price: item.price,
                total_price: item.price * item.quantity,
            }));

            const { error: itemsError } = await supabase
                .from("sale_items")
                .insert(saleItems);

            if (itemsError) {
                throw itemsError;
            }
            for (const cartItem of cart) {
                if (cartItem.type === "product") {
                    const newStock = cartItem.stock - cartItem.quantity;

                    await supabase
                        .from("inventory")
                        .update({
                            stock: Math.max(0, newStock),
                        })
                        .eq("id", cartItem.id);
                }
            }

            setLastTransaction({
                cart: [...cart],
                subtotal,
                tax,
                total,
                paymentMethod,
                tendered:
                    paymentMethod === "cash"
                        ? tenderedNum
                        : total,
                change:
                    paymentMethod === "cash"
                        ? change
                        : 0,
                gcashReference,
                date: new Date().toLocaleString(),
            });
            setShowReceipt(true);

            setCart([]);
            setAmountTendered("");

            fetchItems();
        } catch (err: any) {
            alert("Checkout error: " + err.message);
        }
    };
    return (
        <div className="p-6 text-white">
            <h1 className="text-2xl font-bold mb-4">
                POS Terminal
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    {/* Search + category filter */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <input
                            type="text"
                            placeholder="Search by name or SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
                        />

                        <div className="flex gap-2 overflow-x-auto">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap border ${selectedCategory === cat
                                        ? "bg-zinc-800 text-white border-zinc-700"
                                        : "bg-zinc-950 text-zinc-400 border-zinc-900"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Item grid */}
                    {isLoading ? (
                        <p>Loading inventory...</p>
                    ) : filteredItems.length === 0 ? (
                        <p className="text-zinc-500">No items found</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredItems.map((item) => {
                                const outOfStock = item.type === "product" && item.stock <= 0;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => addToCart(item)}
                                        disabled={outOfStock}
                                        className={`border rounded-lg p-4 text-left ${outOfStock
                                            ? "bg-zinc-950 border-zinc-900 opacity-50 cursor-not-allowed"
                                            : "bg-zinc-900 border-zinc-800 hover:border-red-500/50"
                                            }`}
                                    >
                                        <div className="text-white font-semibold">
                                            {item.name}
                                        </div>

                                        <div className="text-zinc-400 text-sm">
                                            {item.category}
                                        </div>

                                        <div className="mt-2 text-green-400">
                                            ₱{item.price.toLocaleString()}
                                        </div>

                                        {item.type === "product" && (
                                            <div
                                                className={`text-xs ${item.stock <= 3
                                                    ? "text-red-400 font-bold"
                                                    : "text-zinc-500"
                                                    }`}
                                            >
                                                Stock: {item.stock}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Cart */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                    <h2 className="text-xl font-bold mb-4">
                        Cart
                    </h2>

                    {cart.length === 0 && (
                        <p className="text-zinc-500">Cart is empty</p>
                    )}

                    <div className="space-y-2">
                        {cart.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-3"
                            >
                                <span className="flex-1">
                                    {item.name}
                                </span>
                                <button
                                    onClick={() => updateCartQuantity(item.id, -1)}
                                    className="px-2 bg-zinc-800 rounded"
                                >
                                    -
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                    onClick={() => updateCartQuantity(item.id, 1)}
                                    className="px-2 bg-zinc-800 rounded"
                                >
                                    +
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="mt-4 border-t border-zinc-800 pt-4">
                        <div>Subtotal: ₱{subtotal.toFixed(2)}</div>
                        <div>VAT (12%): ₱{tax.toFixed(2)}</div>
                        <div className="font-bold text-green-400">
                            Total: ₱{total.toFixed(2)}
                        </div>
                    </div>
                    {/* Payment method */}
                    <div className="mt-4 grid grid-cols-3 gap-2 max-w-sm">
                        {(["cash", "card", "gcash"] as const).map((method) => (
                            <button
                                key={method}
                                onClick={() => setPaymentMethod(method)}
                                className={`py-2 rounded-lg text-xs font-semibold capitalize border ${paymentMethod === method
                                    ? "bg-zinc-800 text-white border-red-500"
                                    : "bg-zinc-950 text-zinc-400 border-zinc-800"
                                    }`}
                            >
                                {method}
                            </button>
                        ))}
                    </div>
                    {paymentMethod === "cash" && (
                        <div className="mt-3 max-w-sm">
                            <label className="text-xs text-zinc-400 block mb-1">
                                Amount Tendered (₱)
                            </label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={amountTendered}
                                onChange={(e) => setAmountTendered(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
                            />
                            {cart.length > 0 && tenderedNum >= total && (
                                <p className="text-xs text-emerald-400 mt-1 font-semibold">
                                    Change: ₱{change.toFixed(2)}
                                </p>
                            )}
                            {cart.length > 0 && tenderedNum > 0 && tenderedNum < total && (
                                <p className="text-xs text-red-400 mt-1">
                                    Remaining Balance: ₱{(total - tenderedNum).toFixed(2)}
                                </p>

                            )}
                        </div>
                    )}
                    {paymentMethod === "gcash" && (
                        <div className="mt-3 max-w-sm">
                            <label className="text-xs text-zinc-400 block mb-1">
                                GCash Reference Number
                            </label>

                            <input
                                type="text"
                                placeholder="Enter GCash reference"
                                value={gcashReference}
                                onChange={(e) => setGcashReference(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white"
                            />
                        </div>
                    )}
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className="w-full mt-4 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Complete Sale
                    </button>
                </div>
            </div>
            
            {
                showReceipt && lastTransaction && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                        <div className="bg-white text-black p-6 rounded-lg w-full max-w-md">

                            <h2 className="text-xl font-bold mb-2">
                                ShopGrid Receipt
                            </h2>

                            <p className="text-sm mb-4">
                                {lastTransaction.date}
                            </p>

                            <div className="space-y-2 mb-4">
                                {lastTransaction.cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between"
                                    >
                                        <span>
                                            {item.name} x {item.quantity}
                                        </span>

                                        <span>
                                            ₱{(item.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <hr className="my-3" />

                            <div>Subtotal: ₱{lastTransaction.subtotal.toFixed(2)}</div>
                            <div>VAT: ₱{lastTransaction.tax.toFixed(2)}</div>

                            <div className="font-bold">
                                Total: ₱{lastTransaction.total.toFixed(2)}
                            </div>

                            <div className="mt-6 flex gap-2">
                                <button
                                    onClick={() => window.print()}
                                    className="flex-1 bg-black text-white py-2 rounded"
                                >
                                    Print Receipt
                                </button>

                                <button
                                    onClick={() => setShowReceipt(false)}
                                    className="px-4 py-2 bg-zinc-300 rounded"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div >

    );
}