"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";

export default function VehiclesPage() {
  const [plateNo, setPlateNo] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [vehicles, setVehicles] = useState<any[]>([]);

  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setVehicles(data || []);
  };
  
const handleSaveVehicle = async () => {

  if (!plateNo.trim()) {
    alert("Plate number is required.");
    return;
  }

  const { error } = await supabase
    .from("vehicles")
    .insert([
      {
        customer_id: null,
        plate_no: plateNo,
        make,
        model,
        year,
        color,
      },
    ]);

  if (error) {
  console.error(error);
  alert(JSON.stringify(error));
  return;
}

  alert("Vehicle saved!");

  fetchVehicles();

  setPlateNo("");
  setMake("");
  setModel("");
  setYear("");
  setColor("");
};

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      <div className="max-w-7xl mx-auto p-8">

        <h1 className="text-3xl font-bold">
          Vehicles
        </h1>

        <p className="text-zinc-400 mt-2">
          Manage customer vehicles.
        </p>

        <div
          className="
            mt-8
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-900
            p-6
          "
        >

          <div className="grid gap-4">

            <input
              type="text"
              placeholder="Plate Number"
              value={plateNo}
              onChange={(e) => setPlateNo(e.target.value)}
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
              placeholder="Make"
              value={make}
              onChange={(e) => setMake(e.target.value)}
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
              placeholder="Model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
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
              placeholder="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
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
              placeholder="Color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
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
            onClick={handleSaveVehicle}
              className="
                rounded-xl
                bg-emerald-600
                px-5
                py-3
                font-medium
                hover:bg-emerald-700
              "
            >
              Save Vehicle
            </button>
<div className="mt-8">

  <h2 className="text-xl font-semibold mb-4">
    Vehicle List
  </h2>

  <div className="space-y-4">

    {vehicles.map((vehicle) => (
      <div
        key={vehicle.id}
        className="
          rounded-xl
          border
          border-zinc-800
          bg-zinc-900
          p-4
        "
      >
        <h3 className="font-semibold">
          {vehicle.plate_no}
        </h3>

        <p className="text-zinc-400">
          {vehicle.make} {vehicle.model}
        </p>

        <p className="text-zinc-500 text-sm">
          {vehicle.year} • {vehicle.color}
        </p>
      </div>
    ))}

  </div>

</div>
          </div>

        </div>

      </div>

    </div>
  );
}