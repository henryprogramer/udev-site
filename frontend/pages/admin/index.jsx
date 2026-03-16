import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import SiteFooter from '../../components/SiteFooter';
import SiteHeader from '../../components/SiteHeader';
import { useAuth } from '../../context/AuthContext';

const initialForm = {
  name: '',
  description: '',
  price: '',
  video_url: ''
};

export default function AdminPage() {
  const router = useRouter();
  const { initializing, isAuthenticated, isManager, apiRequestWithAuth } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);

  const canAccess = useMemo(() => !initializing && isAuthenticated && isManager, [initializing, isAuthenticated, isManager]);

  useEffect(() => {
    if (!initializing && !isAuthenticated) {
      router.replace('/login?next=/admin');
      return;
    }

    if (!initializing && isAuthenticated && !isManager) {
      router.replace('/account');
    }
  }, [initializing, isAuthenticated, isManager, router]);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiRequestWithAuth('/admin/products');
      setProducts(Array.isArray(response) ? response : []);
    } catch (err) {
      setError(err.message || 'Falha ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canAccess) {
      loadProducts();
    }
  }, [canAccess]);

  const handleInput = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const createProduct = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await apiRequestWithAuth('/admin/products', {
        method: 'POST',
        body: {
          name: form.name,
          description: form.description || null,
          price: Number(form.price || 0),
          video_url: form.video_url || null
        }
      });
      setForm(initialForm);
      await loadProducts();
    } catch (err) {
      setError(err.message || 'Falha ao criar produto');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (productId) => {
    const shouldDelete = window.confirm('Remover produto da loja?');
    if (!shouldDelete) return;

    setError('');
    try {
      await apiRequestWithAuth(`/admin/products/${productId}`, { method: 'DELETE' });
      await loadProducts();
    } catch (err) {
      setError(err.message || 'Falha ao remover produto');
    }
  };

  if (!canAccess) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Portal Admin | Udev</title>
        <meta
          name="description"
          content="Portal restrito da equipe gestora Udev para lancamentos e manutencao de produtos da loja."
        />
      </Head>

      <SiteHeader />

      <main className="page">
        <section className="hero hero--compact" data-animate="fade-up">
          <h1 className="hero-title">Portal Admin - Equipe Gestora</h1>
          <p className="lead">Area isolada para lancamentos de produtos e operacao comercial da loja.</p>
        </section>

        <section className="section split-grid" data-animate="fade-up">
          <article className="card">
            <h2 className="section-title">Novo produto</h2>
            <form className="form-grid" onSubmit={createProduct}>
              <div className="form-grid__full">
                <label htmlFor="admin-name">Nome</label>
                <input
                  id="admin-name"
                  type="text"
                  value={form.name}
                  onChange={(event) => handleInput('name', event.target.value)}
                  required
                />
              </div>

              <div className="form-grid__full">
                <label htmlFor="admin-description">Descricao</label>
                <textarea
                  id="admin-description"
                  rows="4"
                  value={form.description}
                  onChange={(event) => handleInput('description', event.target.value)}
                />
              </div>

              <div>
                <label htmlFor="admin-price">Preco</label>
                <input
                  id="admin-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => handleInput('price', event.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="admin-video">URL do video</label>
                <input
                  id="admin-video"
                  type="url"
                  value={form.video_url}
                  onChange={(event) => handleInput('video_url', event.target.value)}
                />
              </div>

              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Publicar produto'}
              </button>
            </form>
          </article>

          <article className="card">
            <h2 className="section-title">Produtos cadastrados</h2>
            {loading && <p className="muted">Carregando...</p>}
            {!loading && products.length === 0 && <p className="muted">Nenhum produto cadastrado.</p>}

            <div className="admin-products">
              {products.map((product) => (
                <article key={product.id} className="admin-product-row">
                  <div>
                    <strong>{product.name}</strong>
                    <p className="muted">R$ {Number(product.price || 0).toFixed(2)}</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => deleteProduct(product.id)}
                    aria-label={`Remover ${product.name}`}
                  >
                    Remover
                  </button>
                </article>
              ))}
            </div>
          </article>
        </section>

        {error && (
          <section className="section" data-animate="fade-up">
            <p className="error-text">{error}</p>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
