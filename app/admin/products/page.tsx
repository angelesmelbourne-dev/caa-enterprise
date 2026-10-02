"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminProductsPage() {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [stock, setStock] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const handleSaveProduct = async () => {
        const { data, error } = await supabase
            .from("products")
            .insert([
                {
                    name,
                    price: Number(price),
                    stock: Number(stock),
                    description,
                    youtube_url: youtubeUrl,
                    is_active: true,
                },
            ]);

        if (error) {
            console.error(error);
            alert("Failed to save product");
            return;
        }

        alert("Product saved successfully!");
        console.log(data);
    };
    return (
        <div className="mx-auto max-w-3xl p-6">

            <div className="rounded-2xl border bg-white p-6 shadow-sm">

                <h1 className="mb-2 text-2xl font-bold">
                    Product Management
                </h1>

                <p className="mb-6 text-sm text-[var(--text-muted)]">
                    Add and manage products for your online store.
                </p>

                <div className="space-y-4">

                    <input
                        type="text"
                        placeholder="Product Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border p-3"
                    />

                    <input
                        type="number"
                        placeholder="Price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full rounded-xl border p-3"
                    />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-xl border p-3"
                    >
                        <option value="">Select Category</option>
                        <option value="POS Systems">POS Systems</option>
                        <option value="Receipt Printers">Receipt Printers</option>
                        <option value="Barcode Scanners">Barcode Scanners</option>
                        <option value="Cash Drawers">Cash Drawers</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Stock"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="w-full rounded-xl border p-3"
                    />

                    <input
                        type="text"
                        placeholder="Youtube Demo URL"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="w-full rounded-xl border p-3"
                    />

                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-xl border p-3"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setImage(file);
                        }}
                        className="w-full rounded-xl border p-3"
                    />
                    <button
                        onClick={handleSaveProduct}
                        className="
    rounded-xl
    bg-[var(--brand-forest)]
    px-6
    py-3
    text-white
  "
                    >
                        Save Product
                    </button>

                </div>
            </div>
        </div>
    );
}
