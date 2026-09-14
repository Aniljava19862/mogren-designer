import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  Filter,
  Grid2X2,
  LayoutGrid,
  Search,
  SlidersHorizontal,
  Sparkles,
  Shirt,
  X,
} from "lucide-react";

import { catalogApi } from "@/services/api";

export default function Shop() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [gridColumns, setGridColumns] = useState(4);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setErr("");

      const response = await catalogApi.getProducts();

      if (Array.isArray(response)) {
        setItems(response);
      } else if (Array.isArray(response?.content)) {
        setItems(response.content);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
      setErr(
        error?.message ||
          "Unable to load products from the server."
      );
    } finally {
      setLoading(false);
    }
  };

  const activeItems = useMemo(
    () => items.filter((item) => item.active !== false),
    [items]
  );

  const categories = useMemo(() => {
    const unique = [
      ...new Set(
        activeItems
          .map((item) => item.category)
          .filter(Boolean)
      ),
    ];

    return ["All", ...unique];
  }, [activeItems]);

  const filteredItems = useMemo(() => {
    let result = [...activeItems];

    if (selectedCategory !== "All") {
      result = result.filter(
        (item) =>
          item.category?.toLowerCase() ===
          selectedCategory.toLowerCase()
      );
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();

      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(search) ||
          item.category?.toLowerCase().includes(search) ||
          item.description?.toLowerCase().includes(search)
      );
    }

    switch (sortBy) {
      case "name-asc":
        result.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        );
        break;

      case "name-desc":
        result.sort((a, b) =>
          (b.name || "").localeCompare(a.name || "")
        );
        break;

      case "price-low-high":
        result.sort(
          (a, b) =>
            Number(a.price || 0) - Number(b.price || 0)
        );
        break;

      case "price-high-low":
        result.sort(
          (a, b) =>
            Number(b.price || 0) - Number(a.price || 0)
        );
        break;

      default:
        break;
    }

    return result;
  }, [
    activeItems,
    selectedCategory,
    searchTerm,
    sortBy,
  ]);

  const clearFilters = () => {
    setSelectedCategory("All");
    setSearchTerm("");
    setSortBy("featured");
  };

  return (
    <main className="min-h-screen bg-[#f8f8f6] text-zinc-950">
      {/* HERO */}
      <section className="relative overflow-hidden bg-black">
        <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[1fr_1.15fr]">
          <div className="relative z-10 flex min-h-[520px] flex-col justify-center px-8 py-16 text-white md:px-14 lg:min-h-[620px] lg:px-20">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-10 bg-white/50" />

              <span className="MOGREN-eyebrow text-white/60">
                MOGREN Wear / Shop
              </span>
            </div>

            <h1 className="font-display max-w-xl text-5xl font-extrabold leading-[0.92] tracking-[-0.045em] md:text-7xl lg:text-[88px]">
              Everyday
              <br />
              essentials,
              <br />
              elevated.
            </h1>

            <p className="mt-7 max-w-lg text-base leading-7 text-white/65 md:text-lg">
              Premium cotton, clean silhouettes, modern streetwear
              and custom pieces made to feel personal.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#shop-products"
                className="inline-flex items-center gap-3 bg-white px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-black transition hover:bg-zinc-200"
              >
                Explore Collection
                <ArrowRight size={17} />
              </a>

              <Link
                to="/designer"
                className="inline-flex items-center gap-3 border border-white/30 px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-black"
              >
                <Shirt size={17} />
                Customize
              </Link>
            </div>

            <div className="mt-10 flex gap-8 text-sm text-white/55">
              <div>
                <div className="font-display text-2xl font-bold text-white">
                  {activeItems.length}
                </div>
                Styles
              </div>

              <div>
                <div className="font-display text-2xl font-bold text-white">
                  {Math.max(categories.length - 1, 0)}
                </div>
                Categories
              </div>

              <div>
                <div className="font-display text-2xl font-bold text-white">
                  3D
                </div>
                Customizer
              </div>
            </div>
          </div>

          <div className="relative min-h-[520px] lg:min-h-[620px]">
            <img
              src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1600&q=90"
              alt="MOGREN Wear"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent lg:hidden" />

            <div className="absolute bottom-6 right-6 bg-white px-5 py-4 shadow-2xl">
              <div className="MOGREN-eyebrow text-zinc-400">
                Collection
              </div>

              <div className="font-display mt-1 text-lg font-bold">
                New Season 2026
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY STRIP */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-[1500px] overflow-x-auto px-6 md:px-10 lg:px-14">
          <div className="hide-scrollbar flex min-w-max gap-2 py-5">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-black text-white shadow-sm"
                    : "border border-transparent text-zinc-600 hover:border-zinc-200 hover:bg-zinc-50 hover:text-black"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TOOLBAR */}
      <section className="sticky top-0 z-30 border-b border-zinc-200 bg-[#f8f8f6]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-6 py-4 md:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center gap-2 border border-zinc-300 bg-white px-4 py-3 text-sm font-bold transition hover:border-black lg:hidden"
            >
              <Filter size={17} />
              Filters
            </button>

            <div className="relative w-full min-w-[280px] max-w-md">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              />

              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search T-shirts, hoodies..."
                className="w-full border border-zinc-300 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-black"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm font-medium text-zinc-500">
              <span className="font-semibold text-black">
                {filteredItems.length}
              </span>{" "}
              styles
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <button
                onClick={() => setGridColumns(3)}
                className={`flex h-11 w-11 items-center justify-center border transition ${
                  gridColumns === 3
                    ? "border-black bg-black text-white"
                    : "border-zinc-300 bg-white text-zinc-500 hover:border-black hover:text-black"
                }`}
              >
                <Grid2X2 size={16} />
              </button>

              <button
                onClick={() => setGridColumns(4)}
                className={`flex h-11 w-11 items-center justify-center border transition ${
                  gridColumns === 4
                    ? "border-black bg-black text-white"
                    : "border-zinc-300 bg-white text-zinc-500 hover:border-black hover:text-black"
                }`}
              >
                <LayoutGrid size={16} />
              </button>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none border border-zinc-300 bg-white py-3.5 pl-4 pr-11 text-sm font-semibold outline-none transition focus:border-black"
              >
                <option value="featured">Featured</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="price-low-high">
                  Price Low to High
                </option>
                <option value="price-high-low">
                  Price High to Low
                </option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SHOP */}
      <section
        id="shop-products"
        className="mx-auto max-w-[1500px] px-6 py-12 md:px-10 lg:px-14"
      >
        <div className="grid gap-10 lg:grid-cols-[250px_1fr]">
          {/* DESKTOP FILTER */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <div className="border-b border-zinc-200 pb-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} />

                  <h2 className="font-display text-xl font-bold">
                    Filters
                  </h2>
                </div>

                <p className="mt-2 text-sm text-zinc-500">
                  Browse by category
                </p>
              </div>

              <div className="py-6">
                <div className="MOGREN-eyebrow text-zinc-400">
                  Categories
                </div>

                <div className="mt-4 space-y-1">
                  {categories.map((category) => {
                    const count =
                      category === "All"
                        ? activeItems.length
                        : activeItems.filter(
                            (item) =>
                              item.category?.toLowerCase() ===
                              category.toLowerCase()
                          ).length;

                    return (
                      <button
                        key={category}
                        onClick={() =>
                          setSelectedCategory(category)
                        }
                        className={`flex w-full items-center justify-between py-3 text-left text-sm transition ${
                          selectedCategory === category
                            ? "font-bold text-black"
                            : "text-zinc-500 hover:text-black"
                        }`}
                      >
                        <span>{category}</span>

                        <span className="text-xs text-zinc-400">
                          {String(count).padStart(2, "0")}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {(selectedCategory !== "All" || searchTerm) && (
                  <button
                    onClick={clearFilters}
                    className="MOGREN-link mt-4 text-sm font-semibold"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              {/* CUSTOM PROMO */}
              <div className="relative mt-8 overflow-hidden bg-black text-white">
                <img
                  src="https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=800&q=85"
                  alt="Custom design"
                  className="h-72 w-full object-cover opacity-55"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <div className="MOGREN-eyebrow text-white/60">
                    Custom Studio
                  </div>

                  <h3 className="font-display mt-2 text-3xl font-bold leading-tight">
                    Make it yours.
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Create your own T-shirt and preview it in 3D.
                  </p>

                  <Link
                    to="/designer"
                    className="mt-5 inline-flex w-fit items-center gap-2 bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
                  >
                    Start Designing
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* PRODUCTS */}
          <div>
            {loading && (
              <ProductSkeleton gridColumns={gridColumns} />
            )}

            {!loading && err && (
              <div className="border border-red-200 bg-red-50 p-8">
                <h3 className="font-display font-bold text-red-700">
                  Unable to load products
                </h3>

                <p className="mt-2 text-sm text-red-600">
                  {err}
                </p>

                <button
                  onClick={loadProducts}
                  className="mt-5 bg-black px-5 py-3 text-sm font-bold text-white"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading &&
              !err &&
              filteredItems.length === 0 && (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                    <Search size={24} />
                  </div>

                  <h2 className="font-display mt-5 text-3xl font-bold">
                    Nothing here yet.
                  </h2>

                  <p className="mt-3 max-w-md text-zinc-500">
                    Try a different category or search phrase.
                  </p>

                  <button
                    onClick={clearFilters}
                    className="mt-6 bg-black px-6 py-3 text-sm font-bold text-white"
                  >
                    Reset Shop
                  </button>
                </div>
              )}

            {!loading &&
              !err &&
              filteredItems.length > 0 && (
                <div
                  className={`grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 ${
                    gridColumns === 3
                      ? "xl:grid-cols-3"
                      : "xl:grid-cols-4"
                  }`}
                >
                  {filteredItems.map((product, index) => (
                    <ProductCard
                      key={product.id || product.slug}
                      product={product}
                      index={index}
                    />
                  ))}
                </div>
              )}
          </div>
        </div>
      </section>

      {/* EDITORIAL BANNER */}
      <section className="mx-auto max-w-[1500px] px-6 pb-16 md:px-10 lg:px-14">
        <div className="grid overflow-hidden bg-[#171717] text-white lg:grid-cols-2">
          <div className="flex flex-col justify-center p-10 md:p-14 lg:p-16">
            <div className="MOGREN-eyebrow flex items-center gap-2 text-white/50">
              <Sparkles size={14} />
              MOGREN Custom
            </div>

            <h2 className="font-display mt-5 max-w-lg text-4xl font-extrabold leading-tight md:text-5xl">
              Your idea deserves better than a basic T-shirt.
            </h2>

            <p className="mt-5 max-w-md leading-7 text-white/60">
              Personalize front, back and sides. Preview everything
              in 3D before you order.
            </p>

            <Link
              to="/designer"
              className="mt-7 inline-flex w-fit items-center gap-2 bg-white px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] text-black transition hover:bg-zinc-200"
            >
              Create Your Design
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="min-h-[400px]">
            <img
              src="https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=1200&q=90"
              alt="Custom fashion"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* MOBILE FILTER */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close filters"
          />

          <div className="absolute left-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto bg-white p-6">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
              <div>
                <h2 className="font-display text-2xl font-bold">
                  Filter Shop
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Choose a category
                </p>
              </div>

              <button
                onClick={() => setSidebarOpen(false)}
                className="flex h-10 w-10 items-center justify-center border border-zinc-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="pt-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSidebarOpen(false);
                  }}
                  className={`mb-2 w-full px-4 py-3 text-left text-sm ${
                    selectedCategory === category
                      ? "bg-black font-bold text-white"
                      : "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {category}
                </button>
              ))}

              <button
                onClick={() => {
                  clearFilters();
                  setSidebarOpen(false);
                }}
                className="mt-5 w-full border border-black px-5 py-3 text-sm font-bold"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ProductCard({ product, index }) {
  const [imageError, setImageError] = useState(false);

  const price = Number(product.price || 0);

  const fallbackImage =
    "https://placehold.co/800x1000/f4f4f4/111111?text=MOGREN+Wear";

  const showNew = index < 4;

  const customizable =
    product.slug?.includes("custom") ||
    product.name?.toLowerCase().includes("custom");

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block"
    >
      <article className="MOGREN-product-card">
        <div className="MOGREN-product-image">
          <img
            src={
              imageError
                ? fallbackImage
                : product.imageUrl || fallbackImage
            }
            alt={product.name}
            onError={() => setImageError(true)}
            className="aspect-[3/4] w-full object-cover"
          />

          <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
            {showNew && (
              <span className="bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-black shadow-sm">
                New
              </span>
            )}

            {customizable && (
              <span className="bg-black px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                Customizable
              </span>
            )}

            {product.stock > 0 && product.stock <= 10 && (
              <span className="bg-amber-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-800">
                Low stock
              </span>
            )}
          </div>

          <div className="absolute inset-x-4 bottom-4 translate-y-5 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="bg-white px-4 py-3 text-center text-sm font-bold text-black shadow-xl">
              View Product
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="MOGREN-eyebrow text-zinc-400">
                {product.category || "Clothing"}
              </p>

              <h3 className="font-display mt-2 text-[17px] font-bold leading-6 text-zinc-950">
                {product.name}
              </h3>
            </div>

            <div className="shrink-0 text-base font-bold">
              ₹{price.toLocaleString("en-IN")}
            </div>
          </div>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
            {product.description}
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4">
            <div className="text-xs font-medium text-zinc-500">
              {product.stock > 0
                ? `${product.stock} available`
                : "Sold out"}
            </div>

            {Array.isArray(product.colors) &&
              product.colors.length > 0 && (
                <div className="text-xs font-medium text-zinc-500">
                  {product.colors.length} colors
                </div>
              )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function ProductSkeleton({ gridColumns }) {
  return (
    <div
      className={`grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 ${
        gridColumns === 3
          ? "xl:grid-cols-3"
          : "xl:grid-cols-4"
      }`}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
        <div key={item}>
          <div className="aspect-[3/4] animate-pulse bg-zinc-200" />
          <div className="mt-4 h-3 w-20 animate-pulse bg-zinc-200" />
          <div className="mt-3 h-5 w-36 animate-pulse bg-zinc-200" />
          <div className="mt-3 h-4 w-20 animate-pulse bg-zinc-200" />
        </div>
      ))}
    </div>
  );
}
