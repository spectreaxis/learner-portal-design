import { formatPrice, type Price } from '@/lib/hooks/usePayment';

interface CertificatePriceProps {
  price: Price;
  listPrice: Price | null;
}

/**
 * The certificate's price, with the original (list) price struck through and
 * the saving when there is one
 */
export function CertificatePrice({ price, listPrice }: CertificatePriceProps) {
  if (!listPrice) {
    return <p className="text-4xl font-bold text-foreground">{formatPrice(price)}</p>;
  }

  // Rounded down so the saving is never overstated
  const percentOff = Math.floor((1 - price.amount / listPrice.amount) * 100);

  return (
    <div>
      {/* Screen readers don't announce strikethrough, so say it */}
      <p className="sr-only">
        Original price {formatPrice(listPrice)}, now {formatPrice(price)}
        {percentOff >= 1 && `, you save ${percentOff}%`}
      </p>
      <div aria-hidden="true" className="flex items-baseline justify-center gap-3">
        <s className="text-xl text-muted-foreground decoration-2">{formatPrice(listPrice)}</s>
        <span className="text-4xl font-bold text-foreground">{formatPrice(price)}</span>
      </div>
      {/* A saving that rounds down to 0% isn't worth a badge */}
      {percentOff >= 1 && (
        <span
          aria-hidden="true"
          className="inline-block mt-2 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-semibold"
        >
          Save {percentOff}%
        </span>
      )}
    </div>
  );
}
