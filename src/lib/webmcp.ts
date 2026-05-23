/**
 * WebMCP Integration for HyperCart Lab
 *
 * Registers HyperCart tools with the browser's navigator.modelContext API
 * so AI agents can interact with the cart, search, and navigation in a
 * structured, reliable way — without relying on DOM scraping.
 *
 * Spec: https://github.com/explainers-by-googlers/web-mcp
 */

const CART_KEY = 'hypercart-cart';

/** Read cart items from localStorage (matches use-cart.ts). */
function readCart(): { id: number; name: string; price: number; quantity: number; category: string }[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: any[] = JSON.parse(raw);
    return items.map((item) => ({
      id: item.product?.id ?? item.id,
      name: item.product?.name ?? item.name,
      price: item.product?.price ?? item.price,
      quantity: item.quantity,
      category: item.product?.category ?? item.category ?? '',
    }));
  } catch {
    return [];
  }
}

/** Write updated cart items back to localStorage and notify listeners. */
function writeCart(
  items: { id: number; name: string; price: number; quantity: number; category: string }[],
) {
  try {
    // Re-shape back to the CartItem format used by use-cart.ts
    const cartItems = items.map((item) => ({
      product: { id: item.id, name: item.name, price: item.price, category: item.category },
      quantity: item.quantity,
    }));
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    // Dispatch a StorageEvent so the React hook can pick up the change
    window.dispatchEvent(
      new StorageEvent('storage', { key: CART_KEY, newValue: JSON.stringify(cartItems) }),
    );
  } catch {
    // Silently ignore storage errors
  }
}

/** Initialise the WebMCP imperative API if the browser supports it. */
export function initWebMCP(
  navigateTo?: (page: string) => void,
  triggerSearch?: (query: string) => void,
) {
  if (!('modelContext' in navigator)) return;

  // @ts-expect-error – navigator.modelContext is a proposed API not yet in TS lib
  navigator.modelContext.provideContext({
    tools: [
      // ------------------------------------------------------------------ //
      // Tool 1 – get_active_cart                                            //
      // ------------------------------------------------------------------ //
      {
        name: 'get_active_cart',
        description:
          'Returns the current items, prices, and total amount in the HyperCart Lab shopping cart.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
        async execute() {
          const items = readCart();
          const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ items, total_usd: total, currency: 'USD' }),
              },
            ],
          };
        },
      },

      // ------------------------------------------------------------------ //
      // Tool 2 – add_to_cart                                                //
      // ------------------------------------------------------------------ //
      {
        name: 'add_to_cart',
        description:
          'Adds a product to the shopping cart by product ID. Returns the updated cart.',
        inputSchema: {
          type: 'object',
          properties: {
            product_id: {
              type: 'number',
              description: 'The numeric ID of the product to add to the cart.',
            },
            quantity: {
              type: 'number',
              description: 'The number of units to add (defaults to 1).',
            },
          },
          required: ['product_id'],
        },
        async execute(input: { product_id: number; quantity?: number }) {
          const { product_id, quantity = 1 } = input;

          // Dynamically import products to avoid a hard dependency in this module
          const { getAllProducts } = await import('./products');
          const allProducts = getAllProducts();
          const product = allProducts.find((p) => p.id === product_id);

          if (!product) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({ error: `Product with id ${product_id} not found.` }),
                },
              ],
              isError: true,
            };
          }

          const items = readCart();
          const existing = items.find((i) => i.id === product_id);

          if (existing) {
            existing.quantity += quantity;
          } else {
            items.push({
              id: product.id,
              name: product.name,
              price: product.price,
              quantity,
              category: product.category,
            });
          }

          writeCart(items);

          const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  added: { id: product.id, name: product.name, quantity },
                  cart: { items, total_usd: total, currency: 'USD' },
                }),
              },
            ],
          };
        },
      },

      // ------------------------------------------------------------------ //
      // Tool 3 – search_products                                            //
      // ------------------------------------------------------------------ //
      {
        name: 'search_products',
        description:
          'Searches the HyperCart Lab product catalog and returns matching products. ' +
          'Optionally navigates to the Search page and pre-fills the search query.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search terms to look for in product names, descriptions, and categories.',
            },
            navigate: {
              type: 'boolean',
              description:
                'When true, navigate to the Search page and pre-fill the query field (default: false).',
            },
          },
          required: ['query'],
        },
        async execute(input: { query: string; navigate?: boolean }) {
          const { query, navigate = false } = input;
          const { searchProducts } = await import('./products');
          const results = searchProducts(query).slice(0, 20);

          if (navigate && triggerSearch) {
            triggerSearch(query);
          } else if (navigate && navigateTo) {
            navigateTo('search');
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  query,
                  count: results.length,
                  results: results.map((p) => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    category: p.category,
                    rating: p.rating,
                    inStock: p.inStock,
                  })),
                }),
              },
            ],
          };
        },
      },

      // ------------------------------------------------------------------ //
      // Tool 4 – navigate_to_page                                           //
      // ------------------------------------------------------------------ //
      {
        name: 'navigate_to_page',
        description:
          'Navigates to a specific page of HyperCart Lab. ' +
          'Available pages: home, products, search, checkout.',
        inputSchema: {
          type: 'object',
          properties: {
            page: {
              type: 'string',
              enum: ['home', 'products', 'search', 'checkout'],
              description: 'The page to navigate to.',
            },
          },
          required: ['page'],
        },
        async execute(input: { page: string }) {
          const validPages = ['home', 'products', 'search', 'checkout'];
          if (!validPages.includes(input.page)) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({ error: `Unknown page "${input.page}". Valid pages: ${validPages.join(', ')}.` }),
                },
              ],
              isError: true,
            };
          }
          if (navigateTo) {
            navigateTo(input.page);
          }
          return {
            content: [{ type: 'text', text: JSON.stringify({ navigated_to: input.page }) }],
          };
        },
      },
    ],
  });
}
