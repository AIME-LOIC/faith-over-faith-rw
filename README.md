# Faith Over Fear RW — concept storefront

An independent, responsive React/Vite redesign concept with a clean white editorial theme for Faith Over Fear RW. This is a standalone prototype and does not modify the existing production website.

## Run locally

```bash
npm install
npm run dev
```

Vite will print a local URL, usually `http://localhost:5173`.

## Build for deployment

```bash
npm run build
```

The production output is written to `dist/`. Deploy the project to Netlify by importing the Git repository, with build command `npm run build` and publish directory `dist`.

## Replace the concept assets

Place approved brand imagery in `public/images/` and update the `image` fields in `src/main.jsx`. Product images should be real product photos supplied or approved by the brand. Do not present AI-generated shirt artwork as actual inventory.

## Current prototype scope

- Responsive landing page and product collection grid
- Category filters and product detail modal
- Cart drawer with quantity controls and subtotal in Rwandan francs
- Login and create-account interface (demo-only; no real authentication)
- Mobile navigation and custom-order call to action

## Before real customers use it

This is a frontend concept. Authentication, inventory, orders, payment verification, and MTN MoMo integration are not connected. Do not collect real passwords or payment information in this demo. Add a secure backend and confirm all product/pricing details with the brand before production.
# faith-over-faith-rw
