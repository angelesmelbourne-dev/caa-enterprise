"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Customer = { id: string; name: string; phone: string | null };

type Vehicle = {
  id: string;
  customer_id: string;
  plate_no: string;
  make: string | null;
  model: string | null;
  year: string | null;
};

type JobOrder = {
  id: string;
  customer_id: string;
  vehicle_id: string;
  status: string;
  complaint: string | null;
  notes: string | null;
  created_at: string;
  customers: { name: string } | null;
  vehicles: { plate_no: string; make: string | null; model: string | null } | null;
};

const STATUSES = ["pending", "in_progress", "completed", "cancelled"] as const;

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  in_progress: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

export default function JobOrdersPage() {
  // Tenant — TODO: replace with your real auth → tenant resolution.
  // Hardcoded to the first tenant row so this page runs standalone.
  const [tenantId, setTenantId] = useState<string | null>(null);

  // Form state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    plate_no: "",
    make: "",
    model: "",
    year: "",
    color: "",
  });
  const [complaint, setComplaint] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // List state
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    supabase
      .from("tenants")
      .select("id")
      .limit(1)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setTenantId(data.id);
      });
  }, []);

  useEffect(() => {
    if (!tenantId) return;
    supabase
      .from("customers")
      .select("id, name, phone")
      .order("name")
      .then(({ data, error }) => {
        if (!error) setCustomers(data ?? []);
      });
  }, [tenantId]);

  const loadJobOrders = async (tid: string) => {
    setLoadingList(true);
    const { data, error } = await supabase
      .from("job_orders")
      .select(
        "id, customer_id, vehicle_id, status, complaint, notes, created_at, customers!inner(name, tenant_id), vehicles(plate_no, make, model)"
      )
      .order("created_at", { ascending: false });

    if (!error) setJobOrders((data as unknown as JobOrder[]) ?? []);
    setLoadingList(false);
  };

  useEffect(() => {
    if (tenantId) loadJobOrders(tenantId);
  }, [tenantId]);

  // Vehicles for whichever customer is selected — this is the
  // Customer → Vehicle relationship.
  useEffect(() => {
    setSelectedVehicleId("");
    setAddingVehicle(false);
    if (!selectedCustomerId) {
      setVehicles([]);
      return;
    }
    supabase
      .from("vehicles")
      .select("id, customer_id, plate_no, make, model, year")
      .eq("customer_id", selectedCustomerId)
      .order("plate_no")
      .then(({ data, error }) => {
        if (!error) {
          setVehicles(data ?? []);
          setAddingVehicle((data ?? []).length === 0);
        }
      });
  }, [selectedCustomerId]);

  const saveNewVehicle = async (): Promise<string | null> => {
    if (!selectedCustomerId || !newVehicle.plate_no.trim()) {
      setFormError("Plate number is required to add a vehicle.");
      return null;
    }
    const { data, error } = await supabase
      .from("vehicles")
      .insert({
        customer_id: selectedCustomerId,
        plate_no: newVehicle.plate_no.trim(),
        make: newVehicle.make.trim() || null,
        model: newVehicle.model.trim() || null,
        year: newVehicle.year.trim() || null,
        color: newVehicle.color.trim() || null,
      })
      .select("id, customer_id, plate_no, make, model, year")
      .single();

    if (error || !data) {
      setFormError(error?.message ?? "Could not save vehicle.");
      return null;
    }
    setVehicles((prev) => [...prev, data]);
    setNewVehicle({ plate_no: "", make: "", model: "", year: "", color: "" });
    setAddingVehicle(false);
    return data.id as string;
  };

  // Save Job Order — this is the Vehicle → Job Order relationship plus
  // the actual insert.
  const handleSaveJobOrder = async () => {
    setFormError(null);

    if (!selectedCustomerId) {
      setFormError("Select a customer.");
      return;
    }
    if (!complaint.trim()) {
      setFormError("Describe the customer's complaint.");
      return;
    }

    setSaving(true);

    let vehicleId = selectedVehicleId;
    if (!vehicleId && addingVehicle) {
      const newId = await saveNewVehicle();
      if (!newId) {
        setSaving(false);
        return;
      }
      vehicleId = newId;
    }

    if (!vehicleId) {
      setFormError("Select or add a vehicle.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("job_orders").insert({
      customer_id: selectedCustomerId,
      vehicle_id: vehicleId,
      complaint: complaint.trim(),
      notes: notes.trim() || null,
      status: "pending",
    });

    setSaving(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    setSelectedCustomerId("");
    setSelectedVehicleId("");
    setComplaint("");
    setNotes("");
    if (tenantId) loadJobOrders(tenantId);
  };

  // Job Status workflow
  const handleStatusChange = async (jobOrderId: string, status: string) => {
    setJobOrders((prev) =>
      prev.map((jo) => (jo.id === jobOrderId ? { ...jo, status } : jo))
    );
    const { error } = await supabase
      .from("job_orders")
      .update({ status })
      .eq("id", jobOrderId);

    if (error && tenantId) {
      loadJobOrders(tenantId); // revert on failure
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold">Job Orders</h1>
        <p className="text-zinc-400 mt-2">
          Manage repair jobs and service requests.
        </p>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="grid gap-4">
            {formError && <p className="text-sm text-red-400">{formError}</p>}

            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Customer
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
              >
                <option value="">Select a customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.phone ? ` — ${c.phone}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomerId && (
              <div>
                <label className="block text-sm text-zinc-400 mb-1">
                  Vehicle
                </label>

                {vehicles.length > 0 && !addingVehicle && (
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
                  >
                    <option value="">Select a vehicle…</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.plate_no} —{" "}
                        {[v.make, v.model].filter(Boolean).join(" ") ||
                          "unspecified"}
                      </option>
                    ))}
                  </select>
                )}

                {!addingVehicle && (
                  <button
                    type="button"
                    onClick={() => setAddingVehicle(true)}
                    className="mt-2 text-sm text-emerald-400 hover:text-emerald-300"
                  >
                    + Add a new vehicle for this customer
                  </button>
                )}

                {addingVehicle && (
                  <div className="mt-2 grid grid-cols-2 gap-3 rounded-lg border border-zinc-800 p-4">
                    <input
                      placeholder="Plate number"
                      value={newVehicle.plate_no}
                      onChange={(e) =>
                        setNewVehicle({ ...newVehicle, plate_no: e.target.value })
                      }
                      className="col-span-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                    />
                    <input
                      placeholder="Make"
                      value={newVehicle.make}
                      onChange={(e) =>
                        setNewVehicle({ ...newVehicle, make: e.target.value })
                      }
                      className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                    />
                    <input
                      placeholder="Model"
                      value={newVehicle.model}
                      onChange={(e) =>
                        setNewVehicle({ ...newVehicle, model: e.target.value })
                      }
                      className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                    />
                    <input
                      placeholder="Year"
                      value={newVehicle.year}
                      onChange={(e) =>
                        setNewVehicle({ ...newVehicle, year: e.target.value })
                      }
                      className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                    />
                    <input
                      placeholder="Color"
                      value={newVehicle.color}
                      onChange={(e) =>
                        setNewVehicle({ ...newVehicle, color: e.target.value })
                      }
                      className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                    />
                    {vehicles.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setAddingVehicle(false)}
                        className="col-span-2 text-left text-sm text-zinc-400 hover:text-zinc-300"
                      >
                        Cancel — pick an existing vehicle instead
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <input
              type="text"
              placeholder="Customer Complaint"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
            />

            <textarea
              placeholder="Technician Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
            />

            <button
              onClick={handleSaveJobOrder}
              disabled={saving}
              className="rounded-xl bg-emerald-600 px-5 py-3 font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Job Order"}
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Job Order List</h2>

          {loadingList && <p className="text-zinc-500">Loading…</p>}
          {!loadingList && jobOrders.length === 0 && (
            <p className="text-zinc-500">No job orders yet.</p>
          )}

          <div className="grid gap-3">
            {jobOrders.map((jo) => (
              <div
                key={jo.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">
                      {jo.customers?.name ?? "Unknown customer"} —{" "}
                      {jo.vehicles?.plate_no ?? "no plate"}
                    </h3>
                    <p className="text-zinc-400">{jo.complaint}</p>
                    {jo.notes && (
                      <p className="mt-1 text-sm text-zinc-500">{jo.notes}</p>
                    )}
                    <p className="mt-2 text-xs text-zinc-600">
                      {new Date(jo.created_at).toLocaleString()}
                    </p>
                  </div>

                  <select
                    value={jo.status}
                    onChange={(e) => handleStatusChange(jo.id, e.target.value)}
                    className={`rounded-full border bg-transparent px-3 py-1 text-sm capitalize ${STATUS_STYLE[jo.status] ?? STATUS_STYLE.pending
                      }`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-zinc-900 text-white">
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}