import { useQuotes } from '@rulequote/data-access';

export function QuotesListPage() {
  const { data: quotes, isLoading, error } = useQuotes();

  if (isLoading) {
    return <div>Loading quotes...</div>;
  }

  if (error) {
    return <div>Error loading quotes: {error.message}</div>;
  }

  return (
    <div>
      <h1>Quotes</h1>
      {quotes && quotes.length > 0 ? (
        <ul>
          {quotes.map((quote) => (
            <li key={quote.id}>
              <a href={`/quotes/${quote.id}`}>
                {quote.customerName} - {quote.id}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No quotes found</p>
      )}
    </div>
  );
}
