import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from './api';

export function usePublicProducts(fallbackProducts = []) {
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await apiRequest('/api/products');
        if (!active || !Array.isArray(data) || data.length === 0) {
          return;
        }

        const normalized = data.map((item) => ({
          id: String(item.id),
          title: item.name,
          description: item.description || 'Produto da loja Udev',
          priceFrom: `R$ ${Number(item.price || 0).toFixed(2).replace('.', ',')}`
        }));
        setProducts(normalized);
      } catch (_error) {
        if (active) {
          setProducts(fallbackProducts);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      active = false;
    };
  }, [fallbackProducts]);

  return useMemo(() => ({ products, loading }), [products, loading]);
}
