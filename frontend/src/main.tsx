import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";

import { router } from "@/router/app-router";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#121212",
            color: "#f4f1ea",
            borderRadius: "999px",
            fontSize: "14px",
          },
          success: { iconTheme: { primary: "#d4ff3a", secondary: "#121212" } },
        }}
      />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
