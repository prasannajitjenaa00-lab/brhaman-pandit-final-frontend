import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const KEY = 'bp_cart_v1';
// Stored lines hold only { id, quantity }; display data (price, stock) is always re-fetched
// from the server so stale/tampered local data can't affect what is shown or charged.
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [lines, setLines] = useState(load);
  const [products, setProducts] = useState({});

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable */
    }
  }, [lines]);

  const idsKey = lines.map((l) => l.id).join(',');
  useEffect(() => {
    if (!idsKey) return;
    api
      .get('/products/by-ids', { params: { ids: idsKey } })
      .then((r) => {
        const map = {};
        r.data.items.forEach((p) => (map[p._id] = p));
        setProducts(map);
        // drop lines whose product no longer exists
        setLines((ls) => ls.filter((l) => map[l.id]));
      })
      .catch(() => {});
  }, [idsKey]);

  const add = useCallback((product, quantity = 1) => {
    if (product.stock <= 0) return toast.error('This item is out of stock');
    setProducts((p) => ({ ...p, [product._id]: product }));
    setLines((ls) => {
      const found = ls.find((l) => l.id === product._id);
      const next = Math.min(product.stock, (found?.quantity || 0) + quantity);
      if (found) return ls.map((l) => (l.id === product._id ? { ...l, quantity: next } : l));
      return [...ls, { id: product._id, quantity: next }];
    });
    toast.success('Added to cart');
  }, []);

  const setQty = useCallback((id, quantity) => {
    setLines((ls) =>
      ls.map((l) => {
        if (l.id !== id) return l;
        const max = products[id]?.stock ?? 99;
        return { ...l, quantity: Math.max(1, Math.min(max, quantity)) };
      })
    );
  }, [products]);

  const remove = useCallback((id) => setLines((ls) => ls.filter((l) => l.id !== id)), []);
  const clear = useCallback(() => setLines([]), []);

  const items = useMemo(
    () => lines.filter((l) => products[l.id]).map((l) => ({ ...l, product: products[l.id], unit: products[l.id].sellingPrice ?? products[l.id].price })),
    [lines, products]
  );
  const count = lines.reduce((n, l) => n + l.quantity, 0);
  const subtotal = items.reduce((n, i) => n + i.unit * i.quantity, 0);

  return <CartContext.Provider value={{ items, count, subtotal, add, setQty, remove, clear }}>{children}</CartContext.Provider>;
}
