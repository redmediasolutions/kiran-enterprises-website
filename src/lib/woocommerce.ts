const STORE_URL = import.meta.env.WC_STORE_URL;
const CONSUMER_KEY = import.meta.env.WC_CONSUMER_KEY;
const CONSUMER_SECRET = import.meta.env.WC_CONSUMER_SECRET;

export interface WCImage {
  src: string;
  alt: string;
}

export interface WCCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
  image: WCImage | null;
}

export interface WCProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  images: WCImage[];
  categories: { id: number; name: string; slug: string }[];
  featured: boolean;
  stock_status: "instock" | "outofstock" | "onbackorder";
}

async function wcFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  if (!STORE_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
    throw new Error(
      "Missing WooCommerce env vars. Copy .env.example to .env and fill in WC_STORE_URL, WC_CONSUMER_KEY and WC_CONSUMER_SECRET."
    );
  }

  const url = new URL(`${STORE_URL.replace(/\/$/, "")}/wp-json/wc/v3/${endpoint}`);
  url.searchParams.set("consumer_key", CONSUMER_KEY);
  url.searchParams.set("consumer_secret", CONSUMER_SECRET);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString());
  
  if (!res.ok) {
    // We now capture the exact server error message to make debugging easier
    let errorMessage = "";
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || JSON.stringify(errorData);
    } catch {
      errorMessage = await res.text();
    }
    throw new Error(`WooCommerce request failed (${res.status}): ${endpoint} -> ${errorMessage}`);
  }
  
  return res.json() as Promise<T>;
}

/** All product categories that have at least one product, ordered by menu order. */
export async function getCategories(): Promise<WCCategory[]> {
  const categories = await wcFetch<WCCategory[]>("products/categories", {
    per_page: "99", // Set to 99 to safely bypass strict <= 100 server limits
  });
  return categories.filter((c) => c.slug !== "uncategorized");
}

export async function getCategoryBySlug(slug: string): Promise<WCCategory | null> {
  const categories = await wcFetch<WCCategory[]>("products/categories", { slug });
  return categories[0] ?? null;
}

interface ProductQuery {
  category?: string;
  featured?: boolean;
  perPage?: number;
  search?: string;
}

export async function getProducts(query: ProductQuery = {}): Promise<WCProduct[]> {
  const params: Record<string, string> = {
    per_page: String(query.perPage ?? 20),
    status: "publish",
  };
  if (query.category) params.category = query.category;
  if (query.featured) params.featured = "true";
  if (query.search) params.search = query.search;

  return wcFetch<WCProduct[]>("products", params);
}

export async function getProductBySlug(slug: string): Promise<WCProduct | null> {
  const products = await wcFetch<WCProduct[]>("products", { slug });
  return products[0] ?? null;
}

export async function getRelatedProducts(product: WCProduct, limit = 4): Promise<WCProduct[]> {
  const categoryId = product.categories[0]?.id;
  if (!categoryId) return [];
  const products = await getProducts({ category: String(categoryId), perPage: limit + 1 });
  return products.filter((p) => p.id !== product.id).slice(0, limit);
}

export function formatPrice(price: string): string {
  const amount = Number(price || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}