import Link from 'next/link';

export default function ProductCard({ product }) {
  if (!product) return null;

  return (
    <article className="product-card card" data-animate="fade-up">
      <img src="/assets/products/placeholder.png" alt={`Produto ${product.title}`} className="product-card__img" />
      <h3>{product.title}</h3>
      <p>{product.description}</p>
      <p className="muted">Preco a partir de {product.priceFrom}</p>
      <div className="product-card__actions">
        <Link
          href={`/product/${product.id}`}
          className="btn btn-secondary"
          title={`Saiba mais sobre ${product.title}`}
          aria-label={`Saiba mais sobre ${product.title}`}
        >
          Saiba mais
        </Link>
        <Link
          href="/checkout"
          className="btn btn-primary"
          title={`Comprar ou contratar ${product.title}`}
          aria-label={`Comprar ou contratar ${product.title}`}
        >
          Comprar/Contratar
        </Link>
      </div>
    </article>
  );
}
