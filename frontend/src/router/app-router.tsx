import { createBrowserRouter } from "react-router-dom";

import NotFoundPage from "@/pages/not-found/not-found-page";
import ShortUrlDetailPage from "@/pages/urls/short-url-detail-page";
import ShortenUrlPage from "@/pages/urls/shorten-url-page";

export const router = createBrowserRouter([
  { path: "/", element: <ShortenUrlPage />, errorElement: <NotFoundPage /> },
  { path: "/not-found", element: <NotFoundPage /> },
  {
    path: "/:id",
    element: <ShortUrlDetailPage />,
    errorElement: <NotFoundPage />,
  },
]);
