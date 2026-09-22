"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CustomersPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const handleSaveCustomer = async () => {
    if (!name.trim()) {
      alert("Customer name is required.");
      return;
    }
    const { error } = await supabase
      .from("customers")
      .insert([
        {
          tenant_id: crypto.randomUUID(),
          name,
          phone,
          address,
          notes,
        },
      ]);

    if (error) {
      console.error(error);
      alert("Failed to save customer.");
      return;
    }

    alert("Customer saved!");

    setName("");
    setPhone("");
    setAddress("");
    setNotes("");
  };
  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      <div className="max-w-7xl mx-auto p-8">

        <div className="flex items-center justify-between mb-8">

          <div>
            <h1 className="text-3xl font-bold">
              Customers
            </h1>

            <p className="text-zinc-400 mt-2">
              Manage customer information.
            </p>
          </div>

          <button
            className="
              rounded-xl
              bg-emerald-600
              px-5
              py-3
              font-medium
              hover:bg-emerald-700
            "
          >
            Add Customer
          </button>

        </div>

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-900
          "
        >

          <div className="p-5 border-b border-zinc-800">

            <input
              type="text"
              placeholder="Search customers..."
              className="
                w-full
                rounded-lg
                border
                border-zinc-700
                bg-zinc-950
                px-4
                py-3
                text-white
                outline-none
              "
            />

          </div>

          <div className="p-6">

            <div className="grid gap-4">

              <input
                type="text"
                placeholder="Customer Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="
    rounded-lg
    border
    border-zinc-700
    bg-zinc-950
    px-4
    py-3
  "
              />

              <input
                type="text"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="
    rounded-lg
    border
    border-zinc-700
    bg-zinc-950
    px-4
    py-3
  "
              />

              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="
    rounded-lg
    border
    border-zinc-700
    bg-zinc-950
    px-4
    py-3
  "
              />

              <textarea
                placeholder="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="
    rounded-lg
    border
    border-zinc-700
    bg-zinc-950
    px-4
    py-3
  "
              />

              <button
                onClick={handleSaveCustomer}
                className="
    rounded-xl
    bg-emerald-600
    px-5
    py-3
    font-medium
    hover:bg-emerald-700
  "
              >
                Save Customer
              </button>


            </div>

          </div>

        </div>

      </div>

    </div>
  );
}