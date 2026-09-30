"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Item {
    id: string;
    name: string;
    type: "product" | "service";
    category: string;
    price: number;
    stock: number;
    sku: string;
}

export default function InventoryPage() {
    const [items, setItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingItemId, setEditingItemId] =
        useState<string | null>(null);

    const [editPrice, setEditPrice] = useState("");
    const [editStock, setEditStock] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [newItem, setNewItem] = useState({
        name: "",
        type: "product",
        category: "Parts",
        price: "",
        stock: "0",
        sku: "",
    });
    const saveItemChanges = async (id: string) => {
        const { error } = await supabase
            .from("inventory")
            .update({
                price: Number(editPrice),
                stock: Number(editStock),
            })
            .eq("id", id);

        if (!error) {
            setEditingItemId(null);
            fetchItems();
        }
    };
    const addItem = async () => {
        const { error } = await supabase
            .from("inventory")
            .insert({
                name: newItem.name,
                type: newItem.type,
                category: newItem.category,
                price: Number(newItem.price),
                stock: Number(newItem.stock),
                sku: newItem.sku,
            });

        if (!error) {
            setShowAddModal(false);

            setNewItem({
                name: "",
                type: "product",
                category: "Parts",
                price: "",
                stock: "0",
                sku: "",
            });

            fetchItems();
        }
    };
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
    const deleteItem = async (id: string) => {
        const confirmed = confirm(
            "Are you sure you want to delete this item?"
        );

        if (!confirmed) return;

        const { error } = await supabase
            .from("inventory")
            .delete()
            .eq("id", id);

        if (!error) {
            fetchItems();
        }
        const deleteItem = async (id: string) => {
            const confirmed = confirm(
                "Are you sure you want to delete this item?"
            );

            if (!confirmed) return;

            const { error } = await supabase
                .from("inventory")
                .delete()
                .eq("id", id);

            if (!error) {
                fetchItems();
            }
        };
    };
    useEffect(() => {
        fetchItems();
    }, []);
    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return (
        <div className="p-6 text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    Inventory & Services
                </h1>

                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Search inventory..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2"
                    />

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg"
                    >
                        Add Item
                    </button>
                </div>
            </div>

            {isLoading ? (
                <p>Loading inventory...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border border-zinc-800">
                        <thead>
                            <tr className="bg-zinc-900">
                                <th className="p-3 text-left">Name</th>
                                <th className="p-3 text-left">Type</th>
                                <th className="p-3 text-left">Category</th>
                                <th className="p-3 text-left">Price</th>
                                <th className="p-3 text-left">Stock</th>
                                <th className="p-3 text-left">SKU</th>
                                <th className="p-3 text-left">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredItems.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-t border-zinc-800"
                                >
                                    <td className="p-3">{item.name}</td>
                                    <td className="p-3">{item.type}</td>
                                    <td className="p-3">{item.category}</td>
                                    <td className="p-3">
                                        {editingItemId === item.id ? (
                                            <input
                                                type="number"
                                                value={editPrice}
                                                onChange={(e) =>
                                                    setEditPrice(e.target.value)
                                                }
                                                className="w-24 bg-zinc-900 border border-zinc-700 px-2 py-1"
                                            />
                                        ) : (
                                            <>₱{item.price.toLocaleString()}</>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {item.type === "product" ? (
                                            <span
                                                className={
                                                    item.stock <= 3
                                                        ? "font-bold text-red-400"
                                                        : ""
                                                }
                                            >
                                                {item.stock}
                                            </span>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {editingItemId === item.id ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => saveItemChanges(item.id)}
                                                    className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-500"
                                                >
                                                    Save
                                                </button>

                                                <button
                                                    onClick={() => setEditingItemId(null)}
                                                    className="rounded bg-zinc-600 px-3 py-1 text-white"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingItemId(item.id);
                                                        setEditPrice(item.price.toString());
                                                        setEditStock(item.stock.toString());
                                                    }}
                                                    className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-500"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => deleteItem(item.id)}
                                                    className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-500"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-md">

                        <h2 className="text-xl font-bold mb-4">
                            Add Item / Service
                        </h2>

                        <div className="space-y-3">

                            <input
                                placeholder="Name"
                                value={newItem.name}
                                onChange={(e) =>
                                    setNewItem({
                                        ...newItem,
                                        name: e.target.value,
                                    })
                                }
                                className="w-full p-2 bg-zinc-800 rounded"
                            />

                            <select
                                value={newItem.type}
                                onChange={(e) =>
                                    setNewItem({
                                        ...newItem,
                                        type: e.target.value,
                                    })
                                }
                                className="w-full p-2 bg-zinc-800 rounded"
                            >
                                <option value="product">Product</option>
                                <option value="service">Service</option>
                            </select>

                            <input
                                placeholder="Category"
                                value={newItem.category}
                                onChange={(e) =>
                                    setNewItem({
                                        ...newItem,
                                        category: e.target.value,
                                    })
                                }
                                className="w-full p-2 bg-zinc-800 rounded"
                            />

                            <input
                                placeholder="Price"
                                type="number"
                                value={newItem.price}
                                onChange={(e) =>
                                    setNewItem({
                                        ...newItem,
                                        price: e.target.value,
                                    })
                                }
                                className="w-full p-2 bg-zinc-800 rounded"
                            />

                            <input
                                placeholder="Stock"
                                type="number"
                                value={newItem.stock}
                                onChange={(e) =>
                                    setNewItem({
                                        ...newItem,
                                        stock: e.target.value,
                                    })
                                }
                                className="w-full p-2 bg-zinc-800 rounded"
                            />

                            <input
                                placeholder="SKU"
                                value={newItem.sku}
                                onChange={(e) =>
                                    setNewItem({
                                        ...newItem,
                                        sku: e.target.value,
                                    })
                                }
                                className="w-full p-2 bg-zinc-800 rounded"
                            />

                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={addItem}
                                className="flex-1 bg-green-600 py-2 rounded"
                            >
                                Save
                            </button>

                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 bg-zinc-700 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}