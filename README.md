# Vihaaraa — Imitation Jewellery Storefront (React + Vite)

All products, banners, home sections, coupons, orders and settings come from the Laravel backend in
`../admin` and are managed in its admin panel (`http://vihaaraa.local/admin`).

```bash
# start the backend first (see ../admin/README.md), then:
npm install
# API URL: .env.development (npm run dev -> http://vihaaraa.local/admin/api), .env.production (npm run build -> /admin/api on the same domain)
npm run dev            # http://localhost:5173
npm run build          # production build in dist/
```

## Features
- Home: offer bar, image slider, category circles, Handpicked For You, Our Best Sellers, Shop The Look (all from the admin panel)
- Collections and categories (`/collections/:handle`) with filters and sorting; live search
- Product page: photo gallery (or illustration fallback), sizes, stock, wishlist, pincode check
- Cart: guests keep it in the browser; after sign-in it is stored on the server and the guest cart is merged in
- Buy 1 Get 1, coupon codes, free-shipping threshold, COD limit and max quantity, all set in the admin panel
- Customer accounts: register, sign in, profile, password, order history, order tracking and cancellation
- Checkout requires sign-in; the order is priced and stock-checked on the server

**Deploying on WAMP/Apache:** set `VITE_API_URL` to your live API, run `npm run build`, copy `dist/` to the web root;
`public/.htaccess` handles SPA routes. Set the backend `FRONTEND_URL` so the admin's "View storefront" links work.
