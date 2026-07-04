# Kent & Holloway — Shopify Theme

A custom Shopify Online Store 2.0 theme for a men's clothing brand selling **casual wear, suits, and footwear**. Dark charcoal-and-gold "modern luxury" styling, built with Liquid, JSON templates, and section groups so everything is customizable from the Shopify theme editor. It ships with no hardcoded products — all product and collection content comes from your live Shopify catalog.

## 1. Connect this repo to your Shopify store

Requires the **Shopify** plan or higher (GitHub integration isn't available on Starter).

1. In Shopify admin, go to **Online Store > Themes**.
2. Click **Add theme > Connect from GitHub**.
3. Authorize the Shopify GitHub app if prompted, then select this repository (`mosreaty1/repo_mr-ahmed-shopify`) and the branch `claude/shopify-menswear-store-4kzml9` (or `main`, once merged).
4. Shopify pulls in the theme and lists it under **Themes**. Click **Customize** to preview it, or **Publish** to make it live.
5. Every push to the connected branch automatically syncs to that theme in Shopify — no manual upload needed.

## 2. Add your products

Since you already have product images, add them directly in Shopify:

1. Go to **Products > Add product** for each item (or **Import** a CSV under Products if you have one).
2. Upload images, set price/compare-at price, and add variants (e.g. Size, Color) — the product page's variant picker and "Add to cart" button work automatically off whatever options you define.
3. Assign each product to a collection (see next step) so it shows up in the right category on the site.

## 3. Set up collections (Casual / Suits / Footwear)

The homepage and navigation are built around three core categories:

1. Go to **Products > Collections > Create collection**.
2. Create at minimum: **Casual Wear**, **Suits**, **Footwear** (add more, e.g. Accessories or New Arrivals, as needed).
3. Use automated conditions (by product tag/type) or manually select products for each.
4. Set a featured image on each collection — it's used on the homepage category cards.

## 4. Set up navigation

1. Go to **Online Store > Navigation**.
2. Edit (or create) the **Main menu** — add links to Casual Wear, Suits, Footwear, and any pages (About, Contact).
3. Edit the **Footer menu** for the footer link columns.
4. In the theme editor, the header section's "Menu" setting defaults to `main-menu` — change it if you used a different handle.

## 5. Customize branding

In **Online Store > Themes > Customize > Theme settings**:

- **Logo**: upload your logo (falls back to store name text if none set).
- **Colors**: three swatch-able color schemes (Charcoal & Gold / Ivory / Gold accent block) — every section lets you pick which scheme it uses.
- **Typography**: heading font defaults to Playfair Display, body to Assistant — both changeable via Shopify's font picker.
- **Product grid**: columns per row, image ratio, hover image, vendor visibility.
- **Cart**: drawer or full page.
- **Social media**: add your Instagram/Facebook/TikTok/Pinterest/X URLs to populate the footer icons.

On the homepage (`Customize`), the **Shop by category** section ships with 3 empty category blocks (Casual Wear / Suits / Footwear) — pick a collection for each in the sidebar. Featured-collection sections need a collection selected too, or they'll show a placeholder.

## Theme structure

```
config/            Theme settings schema + saved values
layout/             theme.liquid (main wrapper), password.liquid
locales/            en.default.json (all UI text, editable for wording changes)
sections/           Homepage, header/footer, product, collection, cart, account, etc.
snippets/           product-card, price, icons, cart-drawer, pagination, etc.
templates/          JSON templates wiring sections to page types; templates/customers/ for account pages
assets/             theme.css, theme.js
```

## Local development (optional)

If you use the [Shopify CLI](https://shopify.dev/docs/api/shopify-cli):

```bash
shopify theme dev --store your-store.myshopify.com
```

This previews the theme locally against your live store data without publishing.
