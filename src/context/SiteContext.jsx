import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';

// Public site configuration, loaded once: business settings (contact info, delivery charges) and
// domain metadata (statuses, time slots, categories) from GET /api/settings and GET /api/meta.
const EMPTY_META = {
  bookingStatuses: [], paymentStatuses: [], orderStatuses: [], pujaCategories: [], reviewTypes: [], reviewStatuses: [], timeSlots: [], contactSubjects: [], paymentMethods: [],
  pandit: { weekDays: [], defaultTimeSlots: [], documentTypes: [] },
};

const SiteContext = createContext(null);
export const useSite = () => useContext(SiteContext);

export function SiteProvider({ children }) {
  const [state, setState] = useState({ settings: {}, meta: EMPTY_META, ready: false });

  useEffect(() => {
    Promise.all([api.get('/settings'), api.get('/meta')])
      .then(([s, m]) => setState({ settings: s.data, meta: { ...EMPTY_META, ...m.data }, ready: true }))
      .catch(() => setState((prev) => ({ ...prev, ready: true })));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      // delivery charge for a given subtotal, per admin settings (mirrors the server calculation)
      deliveryFor: (subtotal) => (!subtotal || subtotal >= (state.settings.freeDeliveryAbove ?? Infinity) ? 0 : state.settings.deliveryCharge || 0),
    }),
    [state]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
