import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 3 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 1,
        },
    },
});

export const queryPersister = createAsyncStoragePersister({
    storage: window.localStorage,
    key: "menticode-react-query-cache",
});

export const PersistedQueryProvider = PersistQueryClientProvider;
