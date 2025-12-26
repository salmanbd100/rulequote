import { createBrowserRouter } from 'react-router-dom';

import { CreateQuotePage } from '../pages/CreateQuotePage';
import { QuoteDetailPage } from '../pages/QuoteDetailPage';
import { QuotesListPage } from '../pages/QuotesListPage';

import { App } from './app';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <QuotesListPage />,
      },
      {
        path: 'quotes',
        element: <QuotesListPage />,
      },
      {
        path: 'quotes/new',
        element: <CreateQuotePage />,
      },
      {
        path: 'quotes/:id',
        element: <QuoteDetailPage />,
      },
    ],
  },
]);
