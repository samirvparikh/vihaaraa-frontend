import { createContext, useContext, useMemo } from 'react';
import useApi from '../hooks/useApi';

// Store-wide content managed from the admin panel: offer bar, menus, footer pages and cart rules.
const DEFAULT_SETTINGS = {
  freeShippingMin: 499,
  shippingFee: 79,
  codLimit: 5000,
  maxQty: 10,
  b1g1Enabled: true,
  contactEmail: 'care@vihaaraa.com',
  contactWhatsapp: '+91-90000 00000',
  contactHours: 'For any queries, please reach out to us between 10:30 AM to 5:30 PM, Monday to Saturday.',
  social: {},
};

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const { data, error } = useApi('/site');

  const value = useMemo(() => {
    const menu = data?.menu || [];
    const titles = Object.fromEntries(menu.flatMap((g) => g.links).map((l) => [l.handle, l.title]));
    return {
      ready: !!data,
      error,
      announcements: data?.announcements || [],
      menu,
      footerPages: data?.footerPages || [],
      settings: { ...DEFAULT_SETTINGS, ...(data?.settings || {}) },
      collectionTitle: (handle) => titles[handle],
    };
  }, [data, error]);

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside <SiteProvider>');
  return ctx;
}
