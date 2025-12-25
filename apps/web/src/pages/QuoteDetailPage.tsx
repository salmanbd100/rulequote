import { useParams } from 'react-router-dom';
import { useGeneratePdf } from '@rulequote/data-access';

export function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const generatePdf = useGeneratePdf();

  const handleGeneratePdf = () => {
    if (id) {
      generatePdf.mutate({ quoteId: id });
    }
  };

  // TODO: Fetch quote data by ID
  const quote = null;

  if (!quote) {
    return <div>Loading quote...</div>;
  }

  return (
    <div>
      <h1>Quote #{id}</h1>
      <button onClick={handleGeneratePdf} disabled={generatePdf.isPending}>
        {generatePdf.isPending ? 'Generating...' : 'Generate PDF'}
      </button>
      {/* TODO: Display quote details */}
    </div>
  );
}
