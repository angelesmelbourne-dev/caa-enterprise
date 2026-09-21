export default function CustomersPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">

      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-8">

          <h1 className="text-3xl font-bold">
            Customers
          </h1>

          <button
            className="
              px-4
              py-2
              rounded-xl
              bg-emerald-600
              hover:bg-emerald-700
            "
          >
            Add Customer
          </button>

        </div>

        <div
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-xl
            p-6
          "
        >
          No customers yet.
        </div>

      </div>

    </div>
  );
}