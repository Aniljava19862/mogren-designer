import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Headphones,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
  Mail,
  Instagram,
  Facebook,
  Shirt,
} from "lucide-react";

import { catalogApi } from "@/services/api";

const slides = [
  {
    id: 1,
    eyebrow: "NEW SEASON",
    title: "Wear your idea.",
    subtitle:
      "Create something that's completely yours with our custom T-shirt designer.",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1800&q=90",
    buttonText: "Design Your T-Shirt",
    link: "/designer",
  },
  {
    id: 2,
    eyebrow: "PREMIUM ESSENTIALS",
    title: "Everyday style. Elevated.",
    subtitle:
      "Discover premium tees, hoodies and streetwear designed for comfort and confidence.",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=90",
    buttonText: "Shop Collection",
    link: "/shop",
  },
  {
    id: 3,
    eyebrow: "CUSTOM COLLECTION",
    title: "Your design. Your identity.",
    subtitle:
      "Add text, artwork and graphics and preview your creation in 3D before ordering.",
    image:
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1800&q=90",
    buttonText: "Start Creating",
    link: "/designer",
  },
];

const features = [
  {
    icon: Truck,
    title: "Fast Delivery",
    text: "Reliable shipping across India",
  },
  {
    icon: PackageCheck,
    title: "Easy Returns",
    text: "Simple and hassle-free returns",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    text: "100% protected checkout",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    text: "We're here when you need us",
  },
];

const collections = [
  {
    title: "Custom T-Shirts",
    subtitle: "Create something unique",
    button: "Start Designing",
    link: "/designer",
    image:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "New Arrivals",
    subtitle: "Fresh styles. New attitude.",
    button: "Shop Now",
    link: "/shop",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Street Collection",
    subtitle: "Made to stand out",
    button: "Discover",
    link: "/shop",
    image:
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=1000&q=85",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [productError, setProductError] = useState("");
  const [email, setEmail] = useState("");

  const nextSlide = () => {
    setCurrentSlide((current) => (current + 1) % slides.length);
  };

  const previousSlide = () => {
    setCurrentSlide(
      (current) => (current - 1 + slides.length) % slides.length
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((current) => (current + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductError("");

        const response = await catalogApi.getProducts();

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.content || [];

        setProducts(data.slice(0, 4));
      } catch (error) {
        console.error("Unable to load homepage products", error);
        setProductError("Unable to load trending products.");
      }
    };

    loadProducts();
  }, []);

  const subscribe = (event) => {
    event.preventDefault();

    if (!email.trim()) {
      return;
    }

    alert(`Thanks for subscribing with ${email}`);
    setEmail("");
  };

  const slide = slides[currentSlide];

  return (
    <main className="bg-white text-zinc-900">
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden bg-black">
        <div className="relative h-[520px] md:h-[650px] lg:h-[720px]">
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 h-full w-full object-cover transition-all duration-700"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />

          <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6 md:px-10 lg:px-12">
            <div className="max-w-2xl text-white">
              <div className="mb-5 flex items-center gap-2">
                <span className="h-[1px] w-8 bg-white/70" />
                <span className="text-xs font-semibold tracking-[0.32em] md:text-sm">
                  {slide.eyebrow}
                </span>
              </div>

              <h1 className="max-w-xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
                {slide.title}
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-white/80 md:text-lg">
                {slide.subtitle}
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  to={slide.link}
                  className="inline-flex items-center gap-3 bg-white px-7 py-4 text-sm font-bold uppercase tracking-wider text-black transition hover:bg-zinc-200"
                >
                  {slide.buttonText}
                  <ArrowUpRight size={17} />
                </Link>

                <Link
                  to="/shop"
                  className="inline-flex items-center gap-3 border border-white/60 px-7 py-4 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-white hover:text-black"
                >
                  Browse Shop
                </Link>
              </div>
            </div>
          </div>

          {/* slider controls */}
          <div className="absolute bottom-8 right-6 z-20 flex gap-2 md:right-12">
            <button
              onClick={previousSlide}
              className="flex h-12 w-12 items-center justify-center border border-white/30 bg-black/30 text-white backdrop-blur transition hover:bg-white hover:text-black"
              aria-label="Previous slide"
            >
              <ArrowLeft size={19} />
            </button>

            <button
              onClick={nextSlide}
              className="flex h-12 w-12 items-center justify-center border border-white/30 bg-black/30 text-white backdrop-blur transition hover:bg-white hover:text-black"
              aria-label="Next slide"
            >
              <ArrowRight size={19} />
            </button>
          </div>

          {/* dots */}
          <div className="absolute bottom-9 left-6 z-20 flex gap-2 md:left-12">
            {slides.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setCurrentSlide(index)}
                className={`h-1 transition-all ${
                  index === currentSlide
                    ? "w-10 bg-white"
                    : "w-5 bg-white/40"
                }`}
                aria-label={`Show slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          SERVICE BENEFITS
      ========================================================= */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }, index) => (
            <div
              key={title}
              className={`flex items-center gap-4 px-7 py-8 ${
                index !== features.length - 1
                  ? "lg:border-r lg:border-zinc-200"
                  : ""
              }`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                <Icon size={22} strokeWidth={1.7} />
              </div>

              <div>
                <h3 className="font-bold">{title}</h3>
                <p className="mt-1 text-sm text-zinc-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          CUSTOM DESIGN PROMO
      ========================================================= */}
      <section className="bg-zinc-950 py-20 text-white md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 md:px-10 lg:grid-cols-2 lg:px-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]">
              <Sparkles size={15} />
              Custom Studio
            </div>

            <h2 className="mt-7 max-w-xl text-4xl font-black leading-tight md:text-6xl">
              Turn your idea into something you can wear.
            </h2>

            <p className="mt-6 max-w-lg leading-7 text-zinc-400">
              Add graphics, text and artwork to your T-shirt and preview your
              creation in 3D before adding it to your cart.
            </p>

            <div className="mt-8">
              <Link
                to="/designer"
                className="inline-flex items-center gap-3 bg-white px-7 py-4 font-bold text-black transition hover:bg-zinc-200"
              >
                <Shirt size={20} />
                Open T-Shirt Designer
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden bg-zinc-800">
              <img
                src="https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1200&q=90"
                alt="Custom fashion"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="absolute -bottom-6 -left-4 bg-white p-5 text-black shadow-xl md:-left-8 md:p-7">
              <div className="text-3xl font-black">3D</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Live Preview
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          TRENDING PRODUCTS
      ========================================================= */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-12">
          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
                Selected for you
              </span>

              <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
                Trending Products
              </h2>

              <p className="mt-4 max-w-xl text-zinc-500">
                Explore the styles customers are loving right now.
              </p>
            </div>

            <Link
              to="/shop"
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:underline"
            >
              View all products
              <ArrowRight size={17} />
            </Link>
          </div>

          {productError && (
            <div className="mb-6 rounded-lg bg-red-50 px-5 py-4 text-sm text-red-700">
              {productError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <Link
                key={product.id || product.slug}
                to={`/product/${product.slug}`}
                className="group"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-x-4 bottom-4 translate-y-5 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="bg-white px-4 py-3 text-center text-sm font-bold shadow-lg">
                      View Product
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                    {product.category}
                  </p>

                  <h3 className="mt-2 text-lg font-bold">{product.name}</h3>

                  <p className="mt-2 font-semibold">
                    ₹{Number(product.price || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {!productError && products.length === 0 && (
            <div className="py-12 text-center text-zinc-500">
              Loading products...
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          COLLECTIONS
      ========================================================= */}
      <section className="bg-zinc-100 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-12">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
              Explore
            </span>

            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Shop by Collection
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {collections.map((collection) => (
              <Link
                key={collection.title}
                to={collection.link}
                className="group relative min-h-[470px] overflow-hidden bg-zinc-900"
              >
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 z-10 p-8 text-white">
                  <p className="text-sm text-white/70">
                    {collection.subtitle}
                  </p>

                  <h3 className="mt-2 text-3xl font-black">
                    {collection.title}
                  </h3>

                  <div className="mt-5 inline-flex items-center gap-2 border-b border-white pb-1 text-sm font-bold">
                    {collection.button}
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          NEWSLETTER
      ========================================================= */}
      <section className="bg-black py-20 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 px-6 md:px-10 lg:flex-row lg:items-center lg:px-12">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
              MOGREN WEAR
            </p>

            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Join the community.
            </h2>

            <p className="mt-4 text-zinc-400">
              Subscribe for new drops, custom design ideas and exclusive
              offers.
            </p>
          </div>

          <form
            onSubmit={subscribe}
            className="flex w-full max-w-lg border-b border-zinc-600"
          >
            <Mail className="my-auto shrink-0 text-zinc-500" size={20} />

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email address"
              className="w-full bg-transparent px-4 py-4 text-white outline-none placeholder:text-zinc-500"
            />

            <button
              type="submit"
              className="shrink-0 px-4 text-sm font-bold uppercase tracking-wider"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="bg-zinc-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 md:px-10 lg:grid-cols-4 lg:px-12">
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="text-2xl font-black uppercase tracking-tight"
            >
              MOGREN WEAR
            </Link>

            <p className="mt-5 max-w-md leading-7 text-zinc-500">
              Premium apparel and custom T-shirts designed around your ideas.
              Create it, preview it and wear it.
            </p>

            <div className="mt-7 flex gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center border border-zinc-800 transition hover:border-white"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center border border-zinc-800 transition hover:border-white"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.18em]">
              Shopping
            </h4>

            <div className="mt-5 flex flex-col gap-3 text-sm text-zinc-500">
              <Link className="hover:text-white" to="/shop">
                All Products
              </Link>

              <Link className="hover:text-white" to="/designer">
                Custom T-Shirt
              </Link>

              <Link className="hover:text-white" to="/shop">
                New Arrivals
              </Link>

              <Link className="hover:text-white" to="/cart">
                Shopping Cart
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.18em]">
              Customer
            </h4>

            <div className="mt-5 flex flex-col gap-3 text-sm text-zinc-500">
              <Link className="hover:text-white" to="/login">
                My Account
              </Link>

              <a className="hover:text-white" href="#">
                Contact Us
              </a>

              <a className="hover:text-white" href="#">
                Shipping & Delivery
              </a>

              <a className="hover:text-white" href="#">
                Returns
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-900">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-7 text-xs text-zinc-600 md:flex-row md:items-center md:justify-between md:px-10 lg:px-12">
            <p>© 2026 MOGREN Wear. All rights reserved.</p>

            <p>Designed for custom fashion.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}