export default function CustomersPage() {
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