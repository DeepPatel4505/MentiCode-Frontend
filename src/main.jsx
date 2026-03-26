import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {
    PersistedQueryProvider,
    queryClient,
    queryPersister,
} from './lib/queryClient.js'

createRoot(document.getElementById('root')).render(
    <PersistedQueryProvider
        client={queryClient}
        persistOptions={{ persister: queryPersister, maxAge: 24 * 60 * 60 * 1000 }}
    >
        <App />
    </PersistedQueryProvider>
)
