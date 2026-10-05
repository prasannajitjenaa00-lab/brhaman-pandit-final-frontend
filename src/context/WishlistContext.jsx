import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);
export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ids, setIds] = useState([]);

  useEffect(() => {
    if (!user) return setIds([]);
    api.get('/me/wishlist/ids').then((r) => setIds(r.data.ids)).catch(() => {});
  }, [user]);

  const toggle = useCallback(
    async (productId) => {
      if (!user) {
        toast('Please log in to save items');
        return navigate('/login');
      }
      try {
        const r = await api.post(`/me/wishlist/${productId}`);
        setIds((cur) => (r.data.wishlisted ? [...cur, productId] : cur.filter((i) => i !== productId)));
        toast.success(r.data.wishlisted ? 'Saved to wishlist' : 'Removed from wishlist');
      } catch {
        toast.error('Could not update wishlist');
      }
    },
    [user, navigate]
  );

  return <WishlistContext.Provider value={{ ids, has: (id) => ids.includes(id), toggle, count: ids.length }}>{children}</WishlistContext.Provider>;
}
