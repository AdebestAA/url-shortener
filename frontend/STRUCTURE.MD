# STRUCTURE.md: How this React project is built

This file describes the conventions this codebase actually follows. It covers routes, the API layer, hooks, stores, modals, pages, forms and tables. Follow it when you add or change features. If this file and the code disagree, the code wins: re-read the nearest similar feature and copy it.

Golden rule: **find the most similar existing feature and mirror it**, including file names, function shapes, comment style and Tailwind classes. Don't add new abstractions, helpers or libraries unless asked.

---

## 1. Stack

| Concern        | Library                                                                   |
| -------------- | ------------------------------------------------------------------------- |
| Build          | Vite + React 19 + TypeScript                                              |
| Styling        | Tailwind v4 through the `@tailwindcss/vite` plugin, plus `tw-animate-css` |
| UI primitives  | shadcn/ui (`radix-ui` umbrella package) in `src/components/ui/`           |
| Routing        | `react-router-dom` v7, `createBrowserRouter`                              |
| Server state   | `@tanstack/react-query` v5 (+ devtools)                                   |
| Tables         | `@tanstack/react-table` through the shared `DataTable`                    |
| UI/modal state | `zustand`                                                                 |
| Forms          | `react-hook-form` + `zod` (v4) + `@hookform/resolvers/zod`                |
| HTTP           | `axios`, one shared instance                                              |
| Toasts         | `react-hot-toast`                                                         |
| Charts         | `recharts`                                                                |
| Dates          | `date-fns`                                                                |
| Icons          | `lucide-react`                                                            |
| CSV            | `papaparse` through `exportToCsv`                                         |
| Font           | `@fontsource-variable/geist`                                              |

- Path alias: `@/*` → `src/*`. Import with `@/...` everywhere. The only exception is a few relative imports in `app-router.tsx` and `global-modals.tsx`.
- `verbatimModuleSyntax` is on, so type-only imports **must** use `import type { ... }` or `type X` inline.
- Env: `VITE_API_BASE_URL` in `.env`, read through `import.meta.env.VITE_API_BASE_URL`.
- Static images live in `public/images/` and are referenced as `/images/logo-dark.png`.

---

## 2. Folder layout (`src/`)

```
axios-instances/        <project>-instance.ts — the single axios client (apiClient)
services/<feature>.ts   one object of plain async API functions per feature
hooks/<feature>/useX.ts one TanStack Query hook per file (default export)
hooks/use-*.ts          generic hooks (use-csv-export.ts, use-mobile.ts)
store/<feature>/useXModal.ts   zustand stores, mostly modal open/close + payload
modals/<feature>/x-modal.tsx   modal components, mounted once in modals/global-modals.tsx
modals/global-modals.tsx       renders every global modal
pages/<feature>/x-page.tsx     route-level pages (+ colocated mock-*.ts, row components)
layouts/                auth-layout, shared-layout (root-layout.tsx exists but is NOT used)
router/app-router.tsx   the one createBrowserRouter definition
components/ui/          shadcn primitives — do not hand-edit casually
components/<feature>-components/  feature UI (actions menus, forms, tabs/)
components/<feature>/   (some features use this shorter name: admin-accounts, feed-monitoring, job-postings)
components/data-table/  DataTable, pagination, date-range filter dialog + types
components/*.tsx        app-wide pieces: app-sidebar, dashboard-header, auth-guard, stat-card,
                        status-text, info-field, collapsible-section, step-tracker, skeletons/
validations/<name>-validation.ts  zod schemas + inferred FormValues types
providers/react-query-provider.tsx
lib/                    utils.ts (cn, getInitials), query-client.ts, status-labels.ts
utils/types.ts          ALL shared API request/response types
utils/error-handler.ts  handleError(err) → toast
utils/helpers/          auth-storage, params-helper, format-currency, format-date-time,
                        export-csv, capitalize
```

File naming:

- Components, pages, modals and helpers use **kebab-case** (`provider-profile-page.tsx`, `suspend-provider-modal.tsx`).
- Hooks and stores use **camelCase starting with `use`** (`useProviderListings.ts`, `useSuspendProviderModal.ts`).
- Feature folders use kebab-case (`feed-monitoring`, `admin-accounts`).
- Don't fix existing typos. `singin-validation.ts`, for example, is imported by that name.

---

## 3. Bootstrapping

`src/main.tsx`:

```tsx
<StrictMode>
  <ReactQueryProvider>
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: { background: "#0a363c", color: "#fff", fontWeight: "semibold" },
      }}
    />
    <RouterProvider router={router} />
  </ReactQueryProvider>
</StrictMode>
```

- `lib/query-client.ts` exports a plain `new QueryClient()` with no global defaults. Per-hook options are set in each hook.
- `providers/react-query-provider.tsx` wraps `QueryClientProvider` and `ReactQueryDevtools`.

---

## 4. Routing (`src/router/app-router.tsx`)

There is a single `createBrowserRouter([...])` exported as `router`. It has these groups:

1. `/` → `<App />`, which immediately navigates to `/drivers`.
2. `/auth` → `<AuthLayout />` (just an `<Outlet />`), with `errorElement: <NotFoundPage />`. Children use **relative** paths: `signin`, `forgot-password`, `forgot-password/otp`, `forgot-password/new-password`, `password-change-confirm`.
3. A pathless route with `element: <SharedLayout />` and `errorElement: <NotFoundPage />`. All app pages are its children, written with **absolute** paths (`"/providers/:providerId"`).
4. `*` → `<NotFoundPage />`.

Every child route carries `handle: { title: "..." }`. `DashboardHeader` reads this through `useMatches()` and uses it as the page heading, so **always set `handle.title`** on new routes.

```tsx
{
  path: "/providers/:providerId/listings/new",
  handle: { title: "Add New Listing" },
  element: <AddListingPage />,
},
```

URL conventions:

- List: `/<feature>`. Create: `/<feature>/new`. Detail: `/<feature>/:<feature>Id`. Edit: `/<feature>/:<id>/edit`. Nested create: `/providers/:providerId/listings/new`.
- Status-filtered list pages reuse **one page component with a prop and a `key`**, so state resets between routes:
  ```tsx
  { path: "/drivers/pending", handle: { title: "Drivers" },
    element: <DriverStatusPage key="PENDING" status="PENDING" /> },
  ```
  The same applies to `OperatorStatusPage status=...`, `SubscriptionStatusPage kind=...` and `FeedMonitoringPage tab=...`.
- Static segments go **before** `/:id` routes in the array (`/drivers/in-verification` comes before `/drivers/:driverId`).
- Page imports at the top of the router are default imports of `pages/<feature>/<x>-page.tsx`.

**Adding a page:** create `pages/<feature>/<x>-page.tsx` (default export), import it in `app-router.tsx`, add the route inside the SharedLayout children with `handle.title`, and add a sidebar entry in `components/app-sidebar.tsx` (`navItems`; sub-items go in `items: [...]`, as Finance does) if it's top-level.

### Layouts & auth

- `layouts/shared-layout.tsx`:
  ```tsx
  <AuthGuard>
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 min-w-0 bg-[#F7F9FA]">
          <Outlet />
        </main>
      </SidebarInset>
      <GlobalModals />
    </SidebarProvider>
  </AuthGuard>
  ```
- `components/auth-guard.tsx`: if `getToken()` returns nothing, render `<Navigate to="/auth/signin" replace />`. Otherwise render `children`.
- `GlobalModals` is mounted inside `SharedLayout`, which keeps modals inside Router context. Auth pages don't get global modals.
- Logout: `hooks/auth/useLogout.ts` → `clearSession()`, `queryClient.clear()`, `window.location.replace("/auth/signin")`.

---

## 5. API layer

### 5.1 Axios instance: `axios-instances/<project>-instance.ts`

- Name the file `<project>-instance.ts` (after your project) and export the client as `apiClient`.
- `apiClient = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL, timeout: 10000 })`.
- A request interceptor adds `Authorization: Bearer <token>` from `getToken()`.
- A response interceptor handles 401s from any URL except `/auths/login`: it calls `clearSession()` and `queryClient.clear()`, then sets `window.location.href = "/auth/signin"`.
- Don't create additional instances unless a new API domain appears.

### 5.2 Auth storage: `utils/helpers/auth-storage.ts`

It contains only `getToken()` (`localStorage.getItem("token")`) and `clearSession()`. The token is **set inline in the hook** with `localStorage.setItem("token", ...)`. Don't add `saveSession`-style helpers.

### 5.3 Services: `services/<feature>.ts`

Each service file exports one object named `<feature>Service` (`authService`, `tripService`, `providerService`, `driverService`, `marketplaceService`, `feedService`, `operatorService`, `subscriptionService`, `dashboardService`). Every method:

- is `async`, calls `apiClient`, and **returns `res.data`**;
- has an explicit return type `Promise<typeResponse<XResponseType>>`;
- is preceded by a comment with the HTTP verb, path and query params, plus a one-line purpose.

```ts
import apiClient from "@/axios-instances/<project>-instance";
import paramsHelper from "@/utils/helpers/params-helper";
import type {
  tripListItemResponseType,
  tripStatsResponseType,
  typeParams,
  typeResponse,
} from "@/utils/types";

export const tripService = {
  // GET /admins/trips?component=count-status[&driver_id][&operator_id]
  // Trip stat cards — pass driverId / operatorId to scope to one driver or operator.
  getStats: async (
    params?: typeParams,
  ): Promise<typeResponse<tripStatsResponseType>> => {
    const res = await apiClient.get("/admins/trips", {
      params: paramsHelper({ ...params, component: "count-status" }),
    });
    return res.data;
  },

  // GET /admins/trips?page&item_per_page&payment_status&q&start_date&end_date
  // Paginated trips list — the "Trips Log" table.
  getTrips: async (
    params?: typeParams,
  ): Promise<typeResponse<tripListItemResponseType[]>> => {
    const res = await apiClient.get("/admins/trips", {
      params: paramsHelper(params),
    });
    return res.data;
  },

  // GET /admins/trips?component=count + same filters
  // Total trips matching the filters — drives server pageCount.
  getTripsCount: async (params?: typeParams): Promise<typeResponse<number>> => {
    const res = await apiClient.get("/admins/trips", {
      params: paramsHelper({ ...params, component: "count" }),
    });
    return res.data;
  },

  // GET /admins/trips/:tripId
  getTrip: async (
    tripId: string,
  ): Promise<typeResponse<tripDetailResponseType>> => {
    const res = await apiClient.get(`/admins/trips/${tripId}`);
    return res.data;
  },
};
```

Backend conventions the services rely on:

- All admin endpoints live under `/admins/...`.
- **One list URL serves three things**, switched by `component`:
  - no `component` → paginated rows (`typeResponse<Row[]>`)
  - `component: "count"` → total matching rows (`typeResponse<number>`), used for `pageCount`
  - `component: "count-status"` → stat-card aggregates (`typeResponse<xStatsResponseType>`)
- Method names follow `getStats`, `getX` (list), `getXCount`, `getX` (detail by id), `createX`, `updateX`, `updateStatus`, and `deleteX`.
- Status changes are usually `PATCH /admins/<feature>/:id` with body `{ action, reason? }`. Ids that belong in the URL are destructured out of the payload and never sent in the body:
  ```ts
  updateStatus: async (payload: updateProviderStatusType) => {
    const { providerId, ...body } = payload;
    const res = await apiClient.patch(`/admins/providers/${providerId}`, body);
    return res.data;
  },
  ```
- **camelCase → snake_case mapping happens in the service**, in a private `mapXPayload()` function at the top of the file. Optional fields are spread only when filled: `...(phoneNumber ? { phone_number: phoneNumber } : {})`. Pages and hooks work in camelCase.

### 5.4 Query params: `utils/helpers/params-helper.ts`

Always pass list params through `paramsHelper(params)`. It converts the camelCase `typeParams` to API keys (`itemsPerPage → item_per_page`, `startDate → start_date`, `endDate → end_date`, `driverId → driver_id`, `operatorId → operator_id`, `authId → auth_id`, `paymentStatus → payment_status`, and so on) and drops empty values. `status` is kept even when it is `0`. If you need a new filter, **add it to `typeParams` in `utils/types.ts` and to `paramsHelper`**.

### 5.5 Types: `utils/types.ts`

All API types go in this one file. Naming rules:

- Envelope: `typeResponse<T> = { status: string; data: T }`. Success is checked with `data.status == "ok"`.
- Request bodies: `<action>Type`, e.g. `signinType`, `createListingType`, `updateProviderStatusType`.
- Responses: `<endpoint>ResponseType`, e.g. `signinResponseType`, `providerStatsResponseType`, `tripListItemResponseType`, `providerDetailResponseType`.
- List params: `typeParams`.
- UI status unions use PascalCase, e.g. `ProviderStatus = "PENDING" | "ACTIVE" | "SUSPENDED"`.
- Use `type`, not `interface`, for API shapes. Response fields keep the API's **snake_case** exactly. Request types are camelCase and are mapped in the service.
- Document numeric codes with JSDoc on the field: `/** 0 = pending, 1 = active, 2 = suspended. */ account_status: 0 | 1 | 2;`
- Request types contain **only API fields**, never UI-only values like "remember me".
- Derive variants with `Partial<>`/`Omit<>`: `updateProviderType = Partial<createProviderType>`.

### 5.6 Errors: `utils/error-handler.ts`

`handleError(err)` shows `err.response.data.message || .msg || "Network error"` for axios errors, `err.message` for other Errors, and otherwise "Something went wrong". Use it as `onError: handleError` in every mutation.

---

## 6. Hooks (`hooks/<feature>/useX.ts`)

Each hook lives in its own file as a **default export** `const useX = (...) => { return useQuery/useMutation({...}) }`, with an optional one-line JSDoc above it.

### 6.1 Queries

```ts
import { useQuery } from "@tanstack/react-query";
import { tripService } from "@/services/trips";
import type { typeParams } from "@/utils/types";

/** Trips list: page, search (q), dates, payment_status, driver/operator scope. */
const useTrips = (params: typeParams) => {
  return useQuery({
    queryKey: ["trips", "list", params],
    queryFn: () => tripService.getTrips(params),
    placeholderData: (previousData) => previousData,
    retry: 1,
  });
};

export default useTrips;
```

Options by kind of query:

| Kind                   | queryKey                                                | Extra options                                                                                    |
| ---------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Stats (`count-status`) | `["<feature>", "stats", params?]`                       | `staleTime: 60_000, retry: 1`                                                                    |
| List                   | `["<feature>", "list", params]`                         | `placeholderData: (prev) => prev, retry: 1`                                                      |
| Count                  | `["<feature>", "count", params]`                        | same as list. Params type is `Omit<typeParams, "page" \| "itemsPerPage">`                        |
| Detail                 | `["<feature>", "detail" \| "profile", id]`              | `enabled: !!id, retry: 1`. The id param is optional (`id?: string`) and passed as `id as string` |
| Nested resource        | `["providers", "listings", "list", providerId, params]` | parent id comes before params                                                                    |

- Query keys always **start with the feature name** so a mutation can invalidate the whole feature with `["<feature>"]` or a sub-tree with `["providers", "listings"]`.
- Hook names: `useXStats`, `useXs` (list), `useXsCount`, `useX` / `useXProfile` / `useXDetail` (single item).
- Hooks that feed modals receive `undefined` while the modal is closed, e.g. `useTrip(isOpen ? tripId ?? undefined : undefined)`.

### 6.2 Mutations (user-specified shape; keep it exactly)

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { providerService } from "@/services/providers";
import { handleError } from "@/utils/error-handler";
import type { createListingType, typeResponse } from "@/utils/types";

/** POST /admins/providers/:providerId/listings — create, then back to the profile's Listings tab. */
const useCreateListing = (providerId?: string) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: createListingType) =>
      providerService.createListing(providerId as string, payload),
    onSuccess: (data: typeResponse<{ listing_id: string }>) => {
      if (data.status == "ok") {
        toast.success("Listing added");
        queryClient.invalidateQueries({ queryKey: ["providers", "listings"] });
        navigate(
          providerId ? `/providers/${providerId}?tab=Listings` : "/providers",
        );
      } else {
        toast.error("sorry, something went wrong");
      }
    },
    onError: handleError,
  });
};

export default useCreateListing;
```

Rules:

- When the service fn already takes the right single argument, pass it **directly**: `mutationFn: authService.signin`. Only wrap it when an extra arg such as a URL id is needed.
- Type the response with an annotation on the **`onSuccess` param**, not as a hook return type. Use `onSuccess: (data, variables)` when you need the input.
- Check `if (data.status == "ok") { toast.success(...); ... } else { toast.error("sorry, something went wrong"); }`.
- Call `onError: handleError` every time.
- After success, invalidate the feature key, then close the modal (`useXModal((s) => s.closeModal)` grabbed inside the hook) and/or `navigate(...)`.
- Action-specific success messages go in a `Record<Action, string>` map at the top of the file (see `useUpdateDriverStatus`).
- Pages call it as `const { mutate: createProvider, isPending: isCreating } = useCreateProvider();`. Per-call side effects use the second argument: `mutate(vars, { onSuccess: () => setReason("") })`.
- UI-only values such as remember-me are handled in the **page** (`localStorage.setItem("remember-me", ...)`), not in hook or request types.

### 6.3 Generic hooks

- `useCsvExport()` → `{ isExporting, run(filename, fetcher, columns) }`. The fetcher returns `{ data: Row[] }`, and `run` toasts "No data to export" when there are no rows.
- `useIsMobile()` (shadcn sidebar).

---

## 7. Zustand stores (`store/<feature>/useXModal.ts`)

Stores mostly hold **modal visibility and the target entity**. They're named exports, `export const useXModal = create<XModalState>((set) => ({...}))`, with the state typed as a local `type XModalState`.

```ts
import { create } from "zustand";

type ListingAction = "SUSPEND" | "ACTIVATE" | "DELETE";

type ListingActionModalState = {
  isOpen: boolean;
  providerId: string | null;
  listingId: string | null;
  listingName: string | null;
  action: ListingAction;
  openModal: (
    providerId: string,
    listingId: string,
    listingName: string,
    action: ListingAction,
  ) => void;
  closeModal: () => void;
};

export const useListingActionModal = create<ListingActionModalState>((set) => ({
  isOpen: false,
  providerId: null,
  listingId: null,
  listingName: null,
  action: "SUSPEND",
  openModal: (providerId, listingId, listingName, action) =>
    set({ isOpen: true, providerId, listingId, listingName, action }),
  closeModal: () =>
    set({
      isOpen: false,
      providerId: null,
      listingId: null,
      listingName: null,
    }),
}));
```

- Use `isOpen`, `openModal(...)` and `closeModal()`. Entity fields are `string | null` and get reset on close.
- Create/edit modals take `mode: "create" | "edit"` plus the optional entity: `openModal(mode, job?)`.
- A store can carry a row summary object for instant display while the detail query loads (`useViewTripModal` stores `trip: ViewTripModalTrip`).
- **Always read with selectors**, one per field: `const isOpen = useXModal((state) => state.isOpen);`. Never destructure the whole store.
- Non-modal shared UI state also goes here, e.g. `store/dashboard/useDashboardAlerts.ts`.

---

## 8. Modals (`modals/<feature>/x-modal.tsx`)

Modals are **global, not routed and not rendered inside pages**.

1. Store: `store/<feature>/useXModal.ts`.
2. Component: `modals/<feature>/x-modal.tsx`, a **named export** `export function XModal()` that takes no props and reads everything from its store.
3. Mount it once in `modals/global-modals.tsx`. Alias the import on name clashes: `import { RejectDocumentModal as OperatorRejectDocumentModal } from "./operator/reject-document-modal";`.
4. Trigger: a row's actions menu or a button calls `useXModal((s) => s.openModal)(...)`.

Modal body pattern:

```tsx
export function SuspendProviderModal() {
  const isOpen = useSuspendProviderModal((state) => state.isOpen);
  const closeModal = useSuspendProviderModal((state) => state.closeModal);
  const providerId = useSuspendProviderModal((state) => state.providerId);
  const { mutate: updateStatus, isPending } = useUpdateProviderStatus();
  const [reason, setReason] = useState("");

  function handleClose() { setReason(""); closeModal(); }
  function handleConfirm() { if (!providerId) return; updateStatus({ providerId, action: "suspend", reason }); }

  return (
    <ReasonConfirmModal
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      title={`Suspend ${name}?`} ... isConfirming={isPending}
    />
  );
}
```

- Confirm and reason dialogs reuse the shells in `components/driver-components/`. `ConfirmModal` takes title, description, confirm/cancel, and `isConfirming`. `ReasonConfirmModal` adds a reason textarea.
- Custom modals use shadcn `Dialog` / `DialogContent` / `DialogTitle` with `open={isOpen} onOpenChange={(open) => !open && closeModal()}`. Typical content classes are `max-h-[85vh] w-full max-w-md overflow-y-auto p-6 sm:max-w-md` (or `max-w-2xl` for detail views).
- The mutation hook closes the modal on success, or the modal passes a call-level `onSuccess`.

---

## 9. Pages

### 9.1 List page (server-paginated): canonical shape

See `pages/trips/trips-page.tsx`, `pages/marketplace/marketplace-page.tsx` and `components/provider-components/tabs/provider-listings-tab.tsx`.

```tsx
const PAGE_SIZE = 8;
const URL_DATE_FORMAT = "d-M-yyyy";      // date filter in the URL (?start-date=&end-date=)
const API_DATE_FORMAT = "yyyy-MM-dd";    // what the API expects

interface TripRow { id: string; ... }                       // UI row shape
function mapRow(item: tripListItemResponseType): TripRow {}  // API → row (format dates/currency here)
const columns: ColumnDef<TripRow, unknown>[] = [ ... ];      // module-level

export default function TripsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterValue, setFilterValue] = useState<DateRangeFilterValue>(/* from URL or { preset: "all-time" } */);

  // Debounced search — 400ms, resets to page 1
  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search.trim()); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { from, to } = resolveDateRange(filterValue);
  const baseFilterParams: Omit<typeParams, "page" | "itemsPerPage"> = {
    ...(debouncedSearch ? { q: debouncedSearch } : {}),
    ...(from && to ? { startDate: format(from, API_DATE_FORMAT), endDate: format(to, API_DATE_FORMAT) } : {}),
  };
  const listParams: typeParams = { ...baseFilterParams, page, itemsPerPage: PAGE_SIZE };

  const { data: statsData } = useXStats();
  const { data: listData, isPending } = useXs(listParams);
  const { data: countData } = useXsCount(baseFilterParams);

  const rows = (listData?.data ?? []).map(mapRow);
  const pageCount = Math.max(1, Math.ceil((countData?.data ?? 0) / PAGE_SIZE));
  ...
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-[#03181A]">Trips</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Trips" value={stats ? stats.total_trips.toLocaleString() : "—"} />
      </div>
      <div className="rounded-xl bg-white">
        <DataTable title="Trips Log" searchValue={search} onSearchChange={setSearch}
          onExport={handleExport} filterSlot={<DateRangeFilterDialog value={filterValue} onApply={handleApplyFilter} />}
          columns={columns} data={rows} page={page} pageCount={pageCount} pageSize={PAGE_SIZE}
          onPageChange={setPage} getRowId={(row) => row.id} onRowClick={...}
          isLoading={isPending} emptyState="No trips found." />
      </div>
    </div>
  );
}
```

Key points:

- Pagination, search (`q`) and date range are **server-side**. The count is fetched separately with the same filters but without page/itemsPerPage.
- **Every filter or search change resets `page` to 1.**
- The date filter syncs to URL params `start-date` / `end-date` in `d-M-yyyy` and is initialized from them. Use `new URLSearchParams(searchParams)` and **merge**; never `setSearchParams({ tab })`, which wipes other params.
- Numeric API status codes map to UI strings through a `STATUS_BY_CODE: Record<number, XStatus>` constant in the page or tab.
- Use "—" for missing values.
- Export: `handleExport` builds `CsvColumn<Row>[]` and calls `runExport(filename, fetcher, columns)`. The fetcher calls the **service directly** with `page: 1, itemsPerPage: total` to export the full filtered set.

### 9.2 Detail/profile page with tabs

See `pages/providers/provider-profile-page.tsx`.

- `const { providerId } = useParams();` → `useProviderProfile(providerId)`.
- `isPending` shows `animate-pulse` skeleton blocks. `!detail` shows a "Not found" state with a back link.
- Breadcrumb: back arrow (`navigate(-1)`) › list link › entity name.
- Dark profile header: `rounded-xl bg-[#0A363C] p-6 text-white` with `InfoField variant="dark"` and `StatusPill`.
- Tabs are **hand-rolled pill buttons** (there is no shadcn Tabs). They come from `const TABS = [...]`, with the active tab in state initialized from `?tab=` and merged into search params on change.
- Each tab is its own component in `components/<feature>-components/tabs/<feature>-<tab>-tab.tsx`. It owns its own queries, filters and DataTable.

### 9.3 Form page (create/edit)

- RHF + zod: `useForm<XFormValues>({ resolver: zodResolver(xSchema), defaultValues: {...} })`, rendered with shadcn `Form` / `FormField` / `FormItem` / `FormLabel` / `FormControl` / `FormMessage`.
- Add and edit pages that share a layout use a shared form component (`components/provider-components/provider-form.tsx`, `components/admin-accounts/role-form.tsx`) taking `title`, `submitLabel`, `submittingLabel`, `isSubmitting`, `backTo`, `onSubmit`, and default values for edit.
- The page's `onSubmit` maps form values (trimmed, blank → `undefined`) to the camelCase request type, then calls `mutate(...)`.
- The submit button uses `disabled={isPending}` and shows `<Loader2 className="size-4 animate-spin" />` with "Adding..." while pending.
- Local field helpers (`IconInput`, `SelectField`, `fieldClassName`) are **defined per file**. This duplication is intentional, so don't extract them into shared components.
- Selects are `DropdownMenu` plus a button trigger showing the value. There is no shadcn Select.

### 9.4 Mock-driven pages (not yet wired to the API)

Some modules (setup, finance, broadcast, job-postings, admin-accounts, notifications, activity-log, reports, parts of dashboard) still read from a colocated `pages/<feature>/mock-*.ts`. That file exports both the TS interface and `MOCK_X` arrays, marked `// TODO: replace with real data from the <feature> service`. Their mutations are `console.log` stubs. When wiring one up, replace the mock with service → hook → page, one endpoint at a time, and only use the fields the API actually provides.

---

## 10. Validations (`validations/<name>-validation.ts`)

```ts
import { z } from "zod";

const optionalText = z.string().optional();
const optionalEmail = z
  .email("Enter a valid email")
  .optional()
  .or(z.literal(""));

export const addProviderSchema = z.object({
  providerName: z.string().min(1, "Provider name is required"),
  email: z.email("Enter a valid email"),
  phoneNumber: optionalText,
  contactPerson: z.object({ fullName: optionalText, email: optionalEmail }),
});

export type AddProviderFormValues = z.infer<typeof addProviderSchema>;
```

- Use zod v4 syntax (`z.email(...)`). Schemas are named `<thing>Schema`, inferred types `<Thing>FormValues`, both exported from the same file.
- Required fields mirror what the API requires. Put a comment above the schema when it reflects an API rule (e.g. password: min 6, upper, lower, number).

---

## 11. Shared components to reuse

| Need                                                                                 | Use                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Table with toolbar, search, export, filter, pagination, skeleton rows, row selection | `components/data-table/data-table.tsx` → `DataTable`                                                                                                                                                                                                                          |
| Date range filter                                                                    | `DateRangeFilterDialog` + `resolveDateRange`, `DateRangeFilterValue` from `date-range-filter.types.ts`                                                                                                                                                                        |
| Stat tile                                                                            | `components/stat-card.tsx` → `StatCard { title, value, delta?, tooltip?, link?, tone? }`                                                                                                                                                                                      |
| Status text/pill                                                                     | `components/status-text.tsx` → `StatusText`, `StatusPill`; labels in `lib/status-labels.ts`. Add new statuses to these maps; don't create a Badge component                                                                                                                   |
| Label/value field                                                                    | `components/info-field.tsx` → `InfoField`                                                                                                                                                                                                                                     |
| Collapsible card section                                                             | `components/collapsible-section.tsx`                                                                                                                                                                                                                                          |
| Stepper                                                                              | `components/step-tracker.tsx`                                                                                                                                                                                                                                                 |
| Skeletons                                                                            | `components/skeletons/skeletons.tsx` → `StatsSkeleton`, `TableSkeleton`, `SectionSkeleton`                                                                                                                                                                                    |
| Confirm dialogs                                                                      | `ConfirmModal`, `ReasonConfirmModal` in `components/driver-components/`                                                                                                                                                                                                       |
| Row "..." menu                                                                       | `<Feature>ActionsMenu` in `components/<feature>-components/`: `DropdownMenu` with a `MoreHorizontal` trigger, `event.stopPropagation()` on trigger and content, and `DropdownMenuItem onSelect={() => openXModal(...)}`. Disable items that don't apply to the current status |
| Class merging                                                                        | `cn()` from `@/lib/utils`; `getInitials(name)` for avatar fallbacks                                                                                                                                                                                                           |
| Formatting                                                                           | `formatCurrency` (₦, en-NG), `formatLogDateTime`, `formatRelativeDateTime`, `formatDob`, `capitalize` from `utils/helpers/`                                                                                                                                                   |
| CSV                                                                                  | `useCsvExport` + `CsvColumn<T>`                                                                                                                                                                                                                                               |
| Charts                                                                               | recharts components in `components/dashboard-components/` and `components/subscription-components/`                                                                                                                                                                           |

---

## 12. Styling conventions

- Tailwind utilities inline. Brand colors are mostly arbitrary hex values:
  - dark teal `#0A363C` (headers, primary)
  - text `#03181A`
  - page background `#F7F9FA`
  - input/field background `#F6F8F9`
  - lime CTA `#E3FFCC` (hover `#d7f5bb`)
  - otherwise `slate-*`, with `emerald-600`/`red-600`/`amber-600` for status
- Page wrapper: `space-y-4 p-4 sm:p-6`. Page heading: `text-2xl font-bold text-[#03181A]`.
- Cards: `rounded-xl bg-white` (p-5). Inner info panels: `rounded-xl bg-[#F6F8F9] divide-y divide-slate-200`.
- Buttons are often `rounded-full`. Clickable elements get `cursor-pointer`.
- Layouts must be responsive: `grid-cols-1 sm:grid-cols-3`, `flex-col sm:flex-row`.

---

## 13. Code style

- Function components. Pages use `export default function XPage()`. Components and modals use named `export function X()`. Hooks are `const useX = () => {}` + `export default useX`. Stores are a named `export const useX = create(...)`.
- Import order: react / third-party → `@/components` → `@/hooks` → `@/services` / `@/store` → `@/utils`, `@/lib`, types. Leave a blank line between external and internal groups.
- Small closed option sets are **plain string union types**: `type Period = "Last 7 Days" | "Last 30 Days"`. **Don't** use the `as const` array + `(typeof X)[number]` pattern.
- Comments are short and explain _why_ or the endpoint mapping, e.g. `// GET /admins/x?component=count`, `/** 0 = pending, 1 = active */`. Don't narrate obvious code.
- Use `==` for the `data.status == "ok"` check, to match existing hooks.
- **Don't improvise.** Wire only fields that exactly match the API spec. Literal design placeholders ("Lorem") stay literal until the real label is given. Anything unmatched gets flagged (see `Fix.md`), not invented.

---

## 14. Checklist: adding a new API-backed feature

1. **Types** → `utils/types.ts`: `xStatsResponseType`, `xListItemResponseType`, `xDetailResponseType`, `createXType`, `updateXStatusType`; add any new filter keys to `typeParams` and `paramsHelper`.
2. **Service** → `services/x.ts`: `xService` with `getStats` / `getXs` / `getXsCount` / `getX` / mutations, each with an endpoint comment, plus `mapXPayload` for snake_case.
3. **Hooks** → `hooks/x/`: one file per query or mutation in the shapes from section 6, with query keys prefixed `["x", ...]`.
4. **Validation** → `validations/x-validation.ts`, if there's a form.
5. **Store + modal** → `store/x/useXModal.ts` + `modals/x/x-modal.tsx`, registered in `modals/global-modals.tsx`.
6. **Components** → `components/x-components/`: actions menu, tabs, form.
7. **Page** → `pages/x/x-page.tsx`, following section 9.
8. **Route** → `router/app-router.tsx` with `handle.title`; **sidebar** → `components/app-sidebar.tsx`.
9. Run `npm run build` (tsc + vite) and `npm run lint`.
