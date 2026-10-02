import Link from "next/link";
import ScrollRevealInit from "@/components/scroll-reveal-init";
import Navbar from "@/components/navbar";


export default function StorePage() {
    return (
        <>
            <Navbar />
            <ScrollRevealInit />
            {/* =========================================
   SECTION 01 - HERO
========================================= */}
            <section className="relative min-h-screen bg-[#f8faf7] text-[#17251d] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#eef4ed] via-[#f8faf7] to-white" />

                <div className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-32 md:pt-36">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        {/* LEFT */}
                        <div>
                            <div className="mb-6 inline-flex rounded-full border border-[var(--border)] bg-[var(--brand-lime-soft)] px-4 py-2 text-sm font-medium text-[var(--brand-forest)]">
                                Premium Retail Technology Solutions
                            </div>

                            <h1 className="text-4xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                                Modern POS
                                <span className="block text-[var(--brand-forest)]">Solutions</span>
                                For Growing Businesses
                            </h1>

                            <p className="mt-8 max-w-xl text-lg text-[var(--text-muted)]">
                                Premium POS terminals, receipt printers, barcode scanners,
                                customer displays, and business technology solutions.
                            </p>

                            <div className="mt-10 flex gap-4">
                                <button  className="orbit-cta">
                                    Browse Products
                                </button>
                                <Link
                                    href="https://m.me/YOUR_FACEBOOK_PAGE"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="orbit-cta"
                                >
                                    Request Quote
                                </Link>
                            </div>
                        </div>

                        {/* RIGHT */}
                        <div className="rounded-3xl border border-[var(--border)] bg-gradient-to-br from-white to-[var(--surface-muted)] p-10 shadow-2xl">
                            <div className="mb-3 text-sm uppercase tracking-widest text-[var(--brand-forest)]">
                                Retail Technology
                            </div>
                            <h2 className="text-xl font-black tracking-tight">POS Hardware</h2>
                            <p className="mt-4 text-[var(--text-muted)]">
                                POS terminals, receipt printers, barcode scanners, customer
                                displays, and business technology solutions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================
   SECTION 02 - FEATURED POS BUNDLE
========================================= */}
            <section
                id="products"
                className="bg-white py-24 text-[#17251d]"
            >

                <div className="mx-auto max-w-7xl px-6">
                    <div className="mb-12 text-center">
                        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-[var(--text-muted)]">
                            Most Popular Solution
                        </p>
                        <h2 className="text-5xl font-bold md:text-6xl">
                            Everything You Need
                            <span className="block text-[var(--brand-forest)]">To Start Selling</span>
                        </h2>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--text-muted)]">
                            Complete POS setup designed for retail stores, cafés,
                            restaurants and growing businesses.
                        </p>
                    </div>

                    <div
                        className="
    overflow-hidden
    rounded-3xl
    border
    border-zinc-200
    bg-white
    shadow-sm
    transition-all
    duration-300
    hover:-translate-y-1
    hover:shadow-xl
  "
                    >

                        <div className="grid gap-10 p-10 lg:grid-cols-2">
                            <div>
                                <h3 className="text-4xl font-bold">
                                    POS Complete Business Bundle
                                </h3>
                                <p className="mt-4 text-[var(--text-muted)]">
                                    Start accepting sales immediately with POS software,
                                    receipt printing, barcode scanning and inventory tracking.
                                </p>
                                <div className="mt-8">
                                    <Link
                                        href="https://m.me/YOUR_FACEBOOK_PAGE"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="orbit-cta"
                                    >
                                        Request Quote
                                    </Link>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-xl border border-[var(--border)] p-4 text-[var(--text-muted)]">
                                    POS Software
                                </div>
                                <div className="rounded-xl border border-[var(--border)] p-4 text-[var(--text-muted)]">
                                    Receipt Printer Ready
                                </div>
                                <div className="rounded-xl border border-[var(--border)] p-4 text-[var(--text-muted)]">
                                    Barcode Scanner Ready
                                </div>
                                <div className="rounded-xl border border-[var(--border)] p-4 text-[var(--text-muted)]">
                                    Inventory Tracking
                                </div>
                                <div className="rounded-xl border border-[var(--border)] p-4 text-[var(--text-muted)]">
                                    Setup Assistance
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================
   SECTION 03 - FEATURED SOLUTIONS
========================================= */}
            <section
                id="solutions"

                className="bg-white py-16 text-[#17251d]"
            >
                <div className="mx-auto max-w-7xl px-6">
                    <div className="mb-16">
                        <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-muted)]">
                            Featured Solutions
                        </p>
                        <h2 className="mt-4 text-5xl font-bold">
                            Explore The Hardware
                            <span className="block">Behind Every Sale.</span>
                        </h2>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div
                            className="
    overflow-hidden
    rounded-3xl
    border
    border-zinc-200
    bg-white
    shadow-sm
    transition-all
    duration-300
    hover:-translate-y-1
    hover:shadow-xl
  "
                        >
                            <video
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                className="h-60 w-full object-cover"
                            >
                                <source src="/videos/receipt-printer.mp4" type="video/mp4" />
                            </video>
                            <div className="p-8">
                                <h2 className="text-3xl font-black tracking-tight">Receipt Printer</h2>
                                <p className="mt-3 text-zinc-600">
                                    Fast and reliable printing designed for daily business use.
                                </p>
                            </div>
                        </div>

                        <div
                            className="
    overflow-hidden
    rounded-3xl
    border
    border-zinc-200
    bg-white
    shadow-sm
    transition-all
    duration-300
    hover:-translate-y-1
    hover:shadow-xl
  "
                        >
                            <video
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                className="h-60 w-full object-cover"
                            >
                                <source src="/videos/barcode-scanner.mp4" type="video/mp4" />
                            </video>
                            <div className="p-8">
                                <h2 className="text-3xl font-black tracking-tight">Barcode Scanner</h2>
                                <p className="mt-3 text-zinc-600">
                                    Speed up checkout and keep inventory organized.
                                </p>
                            </div>
                        </div>

                        <div
                            className="
    overflow-hidden
    rounded-3xl
    border
    border-zinc-200
    bg-white
    shadow-sm
    transition-all
    duration-300
    hover:-translate-y-1
    hover:shadow-xl
  "
                        >
                            <video
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                className="h-60 w-full object-cover"
                            >
                                <source src="/videos/cash-drawer.mp4" type="video/mp4" />
                            </video>
                            <div className="p-8">
                                <h2 className="text-3xl font-black tracking-tight">Cash Drawer</h2>
                                <p className="mt-3 text-zinc-600">
                                    Keep cash transactions secure and organized at checkout.
                                </p>
                            </div>
                        </div>

                        <div
                            className="
    overflow-hidden
    rounded-3xl
    border
    border-zinc-200
    bg-white
    shadow-sm
    transition-all
    duration-300
    hover:-translate-y-1
    hover:shadow-xl
  "
                        >
                            <video
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                className="h-60 w-full object-cover"
                            >
                                <source src="/videos/pos-demo.mp4" type="video/mp4" />
                            </video>
                            <div className="p-8">
                                <h2 className="text-3xl font-black tracking-tight">Customer Display</h2>
                                <p className="mt-3 text-zinc-600">
                                    Give customers a clear view of their items and transaction total.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* =========================================
   SECTION 04 - HOW IT WORKS
========================================= */}
            <section className="bg-[#f8faf7] py-16 text-[#17251d]">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="mb-16 text-center">
                        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[var(--brand-forest)]">
                            How It Works
                        </p>
                        <h2 className="text-4xl font-bold md:text-6xl">
                            Getting Started Is Easy.
                            <span className="block text-[var(--brand-forest)]">
                                From setup to support.
                            </span>
                        </h2>
                        <p className="mx-auto mt-6 max-w-3xl text-lg text-[var(--text-muted)]">
                            We help businesses choose, deploy, and maintain the right
                            retail technology from POS systems to receipt printers and
                            barcode scanners.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-3xl border border-[var(--border)] bg-white p-8">
                            <div className="mb-4 text-5xl font-bold text-[var(--brand-forest)]">01</div>
                            <h3 className="mb-3 text-xl font-bold">Consultation</h3>
                            <p className="text-[var(--text-muted)]">
                                We identify the right hardware and technology requirements
                                for your business.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-[var(--border)] bg-white p-8">
                            <div className="mb-4 text-5xl font-bold text-[var(--brand-forest)]">02</div>
                            <h3 className="mb-3 text-xl font-bold">Product Matching</h3>
                            <p className="text-[var(--text-muted)]">
                                Get the best hardware bundle that fits your workflow and
                                budget.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-[var(--border)] bg-white p-8">
                            <div className="mb-4 text-5xl font-bold text-[var(--brand-forest)]">03</div>
                            <h3 className="mb-3 text-xl font-bold">Installation</h3>
                            <p className="text-[var(--text-muted)]">
                                Fast deployment and setup to get your business running.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-[var(--border)] bg-white p-8">
                            <div className="mb-4 text-5xl font-bold text-[var(--brand-forest)]">04</div>
                            <h3 className="mb-3 text-xl font-bold">Support</h3>
                            <p className="text-[var(--text-muted)]">
                                Ongoing after-sales support whenever you need assistance.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/*SECTION 05 - PRODUCT DEMOS*/}

            {/* =========================================
   SECTION 06 - TRUST METRICS
========================================= */}

            <section data-reveal className="bg-white py-24 text-[#17251d]">
                <div className="mx-auto max-w-7xl px-6">

                    <div className="mb-16 text-center">
                        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-[var(--brand-forest)]">
                            Trusted By Businesses
                        </p>

                        <h2 className="text-5xl font-bold">
                            Proven By Real
                            <span className="block text-[var(--brand-forest)]">
                                Business Owners
                            </span>
                        </h2>

                        <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--text-muted)]">
                            Helping businesses succeed with reliable
                            POS hardware and business solutions.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

                        <div className="rounded-3xl border border-[var(--border)] bg-white p-8 text-center">
                            <div className="text-5xl font-bold text-[var(--brand-forest)]">
                                4.9★
                            </div>

                            <p className="mt-3 text-[var(--text-muted)]">
                                Customer Rating
                            </p>
                        </div>

                        <div className="rounded-3xl border border-[var(--border)] bg-white p-8 text-center">
                            <div className="text-5xl font-bold text-[var(--brand-forest)]">
                                681+
                            </div>

                            <p className="mt-3 text-[var(--text-muted)]">
                                Reviews
                            </p>
                        </div>

                        <div className="rounded-3xl border border-[var(--border)] bg-white p-8 text-center">
                            <div className="text-5xl font-bold text-[var(--brand-forest)]">
                                705+
                            </div>

                            <p className="mt-3 text-[var(--text-muted)]">
                                Followers
                            </p>
                        </div>

                        <div className="rounded-3xl border border-[var(--border)] bg-white p-8 text-center">
                            <div className="text-5xl font-bold text-[var(--brand-forest)]">
                                9
                            </div>

                            <p className="mt-3 text-[var(--text-muted)]">
                                Years Serving Businesses
                            </p>
                        </div>

                    </div>

                </div>
            </section>
            {/* =========================================
   SECTION 07 - FAQ
========================================= */}

            <section
                id="faq"
                className="bg-[#eef4ed] py-24 text-[#17251d]"
            >
                <div className="mx-auto max-w-4xl px-6">

                    <div className="mb-16 text-center">
                        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-[var(--text-muted)]">
                            Questions, Answered
                        </p>

                        <h2 className="text-5xl font-bold">
                            Frequently Asked
                            <span className="block text-[var(--brand-forest)]">
                                Questions
                            </span>
                        </h2>

                        <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--text-muted)]">
                            Everything you need to know before getting started.
                        </p>
                    </div>

                    <div className="space-y-4">

                        <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
                            <h3 className="text-xl font-semibold">
                                Do I need internet to use the system?
                            </h3>

                            <p className="mt-3 text-[var(--text-muted)]">
                                Some POS setups can continue operating even during temporary
                                internet interruptions depending on your configuration.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
                            <h3 className="text-xl font-semibold">
                                Can I accept GCash payments?
                            </h3>

                            <p className="mt-3 text-[var(--text-muted)]">
                                Yes. We can recommend payment-ready setups that support
                                modern payment workflows.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
                            <h3 className="text-xl font-semibold">
                                Is setup assistance included?
                            </h3>

                            <p className="mt-3 text-[var(--text-muted)]">
                                We provide guidance and assistance to help you get started
                                quickly and efficiently.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
                            <h3 className="text-xl font-semibold">
                                Do you deliver nationwide?
                            </h3>

                            <p className="mt-3 text-[var(--text-muted)]">
                                Delivery options depend on your location and selected products.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
                            <h3 className="text-xl font-semibold">
                                What warranty do I get?
                            </h3>

                            <p className="mt-3 text-[var(--text-muted)]">
                                Warranty coverage varies by product and manufacturer.
                            </p>
                        </div>

                    </div>

                </div>
            </section>
            {/* =========================================
   SECTION 08 - FINAL CTA
========================================= */}

            <section data-reveal className="bg-[#f8faf7] py-32 text-[#17251d] overflow-hidden">
                <div className="mx-auto max-w-5xl px-6 text-center">

                    <p className="mb-6 text-sm uppercase tracking-[0.3em] text-[var(--brand-forest)]">
                        Ready To Get Started?
                    </p>

                    <h2 className="text-3xl font-bold leading-tight md:text-7xl">
                        Build A Better
                        <span className="block text-[var(--brand-forest)]">
                            Business Today.
                        </span>
                    </h2>

                    <p className="mx-auto mt-8 max-w-2xl text-lg text-[var(--text-muted)]">
                        Get the right POS setup, hardware,
                        and support to help your business
                        operate more efficiently.
                    </p>

                    <div className="mt-12 flex flex-wrap justify-center gap-4">


                        <Link
                            href="https://m.me/YOUR_FACEBOOK_PAGE"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="orbit-cta"
                        >
                            Request Quote
                        </Link>


                        <button className="orbit-cta">
                            Browse Products
                        </button>

                    </div>

                </div>
            </section>

            {/* =========================================
   SECTION 09 - FOOTER
========================================= */}

            <footer className="border-t border-[#d9e4d8] bg-white text-[#17251d]">
                <div className="mx-auto max-w-7xl px-6 py-16">

                    <div className="grid gap-12 md:grid-cols-4">

                        {/* Brand */}
                        <div className="md:col-span-2">
                            <h2 className="text-3xl font-black tracking-tight">
                                CA&A Enterprise
                            </h2>

                            <p className="mt-4 max-w-md text-[var(--text-muted)]">
                                Helping businesses start, manage,
                                and grow with reliable POS systems,
                                receipt printers, barcode scanners,
                                and retail technology solutions.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="mb-4 font-semibold">
                                Quick Links
                            </h4>

                            <ul className="space-y-3 text-[var(--text-muted)]">
                                <li>Products</li>
                                <li>Solutions</li>
                                <li>Videos</li>
                                <li>FAQ</li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="mb-4 font-semibold">
                                Contact
                            </h4>

                            <ul className="space-y-3 text-[var(--text-muted)]">
                                <li>Facebook Page</li>
                                <li>Shopee Store</li>
                                <li>Email Address</li>
                                <li>Mobile Number</li>
                            </ul>
                        </div>

                    </div>

                    <div className="mt-16 border-t border-[var(--border)] pt-8">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                            <p className="text-sm text-[var(--text-muted)]">
                                © 2026 CA&A Enterprise. All Rights Reserved.
                            </p>

                            <p className="text-sm text-[var(--text-muted)]">
                                Trusted by Filipino business owners for 9 years.
                            </p>

                        </div>
                    </div>

                </div>
            </footer>
        </>
    );
}
