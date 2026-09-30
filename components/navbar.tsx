"use client";

export default function Navbar() {
  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="w-full max-w-7xl rounded-full border border-white/30 bg-zinc-200/80 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-6">
          <div className="text-xl font-black">CA&amp;A</div>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#products" className="hover:text-red-600">
              Products
            </a>
            <a href="#solutions" className="hover:text-red-600">
              Solutions
            </a>
            <a href="#videos" className="hover:text-red-600">
              Videos
            </a>
            <a href="#faq" className="hover:text-red-600">
              FAQ
            </a>
          </div>

          <button
            type="button"
            className="rounded-full bg-black px-6 py-3 text-white hover:bg-teal-500"
          >
            Request Quote
          </button>
        </div>
      </nav>
    </div>
  );
}
