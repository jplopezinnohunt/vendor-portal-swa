// In Azure Static Web Apps, /api routes automatically to the backend
// For local dev, point to the ASP.NET Core API (port 5001)
const API_BASE_URL = import.meta.env.DEV
    ? (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001')
    : ''; // In prod, use relative paths to let SWA proxy handle it

export interface SapConnectionConfig {
    hostname: string;
    systemNumber: string;
    client: string;
    language: string;
    connectionTimeout: number;
    maxPoolSize: number;
    authenticationType: 'BasicAuth' | 'SNC';
    useMockConnection: boolean;
    username?: string;
    password?: string;
    sncLibraryPath?: string;
    sncPartnerName?: string;
    sncQop?: string;
}

export interface ConnectionTestResult {
    success: boolean;
    message: string;
    details?: any;
}

export const SapService = {
    async getConfiguration(): Promise<SapConnectionConfig> {
        const response = await fetch(`${API_BASE_URL}/api/admin/sap/configuration`, {
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to load SAP configuration');
        return response.json();
    },

    async updateConfiguration(config: SapConnectionConfig): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/api/admin/sap/configuration`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(config),
        });
        if (!response.ok) throw new Error('Failed to update SAP configuration');
    },

    async testConnection(config: SapConnectionConfig): Promise<ConnectionTestResult> {
        const response = await fetch(`${API_BASE_URL}/api/admin/sap/test-connection`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(config),
        });
        if (!response.ok) throw new Error('Connection test failed');
        return response.json();
    },

    async uploadCertificate(file: File): Promise<void> {
        const formData = new FormData();
        formData.append('certificate', file);

        const response = await fetch(`${API_BASE_URL}/api/admin/sap/certificate`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload certificate');
    },
};
