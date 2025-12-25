import { createBrowserRouter } from 'react-router-dom';
import { QuotesListPage } from '../pages/QuotesListPage';
import { CreateQuotePage } from '../pages/CreateQuotePage';
import { QuoteDetailPage } from '../pages/QuoteDetailPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <div>Home</div>,
  },
  {
    path: '/quotes',
    element: <QuotesListPage />,
  },
  {
    path: '/quotes/new',
    element: <CreateQuotePage />,
  },
  {
    path: '/quotes/:id',
    element: <QuoteDetailPage />,
  },
]);
