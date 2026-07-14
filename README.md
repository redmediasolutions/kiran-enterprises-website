# Kiran Enterprises

Astro storefront for Kiran Enterprises. Product data comes from a WordPress
site running WooCommerce; there's no cart — every product and category page
sends customers to the Kiran Enterprises Android app instead.

## Structure

```
src/
  components/   Header, Footer, ProductCard, CategoryCard
  layouts/      Layout.astro (single shared page shell)
  lib/          woocommerce.ts — REST API client
  pages/
    index.astro           Home
    products/index.astro  All products + search
    category/[slug].astro One page per WooCommerce category
    product/[slug].astro  One page per product
  styles/       global.css — design tokens, shared classes
public/         logo.svg, favicon.svg, hero.jpg (add your own hero photo)
```

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `WC_STORE_URL` — your WordPress site's URL
   - `WC_CONSUMER_KEY` / `WC_CONSUMER_SECRET` — from WooCommerce → Settings →
     Advanced → REST API (read-only permissions are enough)
   - `PUBLIC_APP_URL` — already set to the Play Store listing
3. Drop a hero photo at `public/hero.jpg` (any wide construction/site photo —
   it's shown at low opacity behind the headline).
4. `npm run dev`

Products, categories, and prices are fetched at build time, so re-run
`npm run build` (or redeploy) whenever the WooCommerce catalog changes.

## Notes

- Featured/"fast selling" products are pulled from WooCommerce's built-in
  `featured` flag — mark products as Featured in WooCommerce to control that row.
- The header search box submits to `/products?search=…`; that page filters
  its already-rendered product list client-side, so it works without a server.
- Social links in the footer only render if `PUBLIC_FACEBOOK_URL`,
  `PUBLIC_TWITTER_URL`, or `PUBLIC_YOUTUBE_URL` are set in `.env`.
- The footer's contact email is a placeholder (`info@thekiranenterprises.co`)
  — swap it for the real inbox before launch.
