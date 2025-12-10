import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

interface HealthStatus {
    status: 'loading' | 'success' | 'error';
    message: string;
    details?: any;
}

const Diagnostics: React.FC = () => {
    const [health, setHealth] = useState<HealthStatus>({ status: 'loading', message: 'Checking connection...' });
    const [config, setConfig] = useState<any>(null);

    useEffect(() => {
        checkHealth();
    }, []);

    const checkHealth = async () => {
        try {
            // 1. Check basic connectivity
            const start = performance.now();
            await api.get('/health'); // Assuming a health endpoint exists or falling back to a known 404 that proves connectivity
            const duration = Math.round(performance.now() - start);

            setHealth({
                status: 'success',
                message: `Backend reachable (${duration}ms)`,
            });
        } catch (error: any) {
            console.error("Health check failed", error);

            let errorMsg = 'Unknown error';
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                errorMsg = `Server Error: ${error.response.status} ${error.response.statusText}`;
                if (error.response.status === 405) {
                    errorMsg += " (Method Not Allowed - Check if API Proxy is configured in Azure SWA)";
                } else if (error.response.status === 404) {
                    // If we get a 404 from the API, it effectively means we *reached* the server (or SWA), 
                    // but the specific route is missing. If it's the SWA default 404, backend might be unlinked.
                    errorMsg += " (Not Found - Verify Backend is linked in Azure SWA)";
                }
            } else if (error.request) {
                // The request was made but no response was received
                errorMsg = "No response received. Network error or Backend down.";
            } else {
                errorMsg = error.message;
            }

            setHealth({
                status: 'error',
                message: errorMsg,
                details: error
            });
        }

        // 2. Load config if possible
        try {
            const envInfo = {
                mode: import.meta.env.MODE,
                dev: import.meta.env.DEV,
                baseUrl: import.meta.env.VITE_API_BASE_URL,
                apiUrl: import.meta.env.VITE_API_URL
            };
            setConfig(envInfo);
        } catch (e) {
            console.warn("Could not load env info", e);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">System Diagnostics</h1>

            <div className={`p-4 rounded-lg border ${health.status === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                    health.status === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                        'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${health.status === 'success' ? 'bg-green-500' :
                            health.status === 'error' ? 'bg-red-500' :
                                'bg-blue-500 animate-pulse'
                        }`}></div>
                    <span className="font-medium">{health.message}</span>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-lg font-semibold mb-2">Environment Configuration</h2>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(config, null, 2)}
                </pre>
            </div>

            <div className="mt-8">
                <button
                    onClick={checkHealth}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                >
                    Retry Connection
                </button>
            </div>
        </div>
    );
};

export default Diagnostics;
