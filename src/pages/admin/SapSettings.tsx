import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../components/ui/Elements';
import { Save, CheckCircle, XCircle, Server, Lock, FileKey, AlertCircle } from 'lucide-react';
import { SapService, SapConnectionConfig } from '../../services/sapService';

export const SapSettings: React.FC = () => {
    const [config, setConfig] = useState<SapConnectionConfig>({
        hostname: '',
        systemNumber: '00',
        client: '100',
        language: 'EN',
        connectionTimeout: 30,
        maxPoolSize: 10,
        authenticationType: 'BasicAuth',
        useMockConnection: true,
    });

    const [certificate, setCertificate] = useState<File | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [testMessage, setTestMessage] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadConfiguration();
    }, []);

    const loadConfiguration = async () => {
        try {
            const data = await SapService.getConfiguration();
            setConfig(data);
            setError(null);
        } catch (error) {
            console.error('Failed to load SAP configuration', error);
            setError('Failed to load configuration. Using default values.');
        } finally {
            setLoading(false);
        }
    };

    const handleTestConnection = async () => {
        setConnectionStatus('testing');
        setTestMessage('Testing connection...');
        try {
            const result = await SapService.testConnection(config);
            setConnectionStatus(result.success ? 'success' : 'error');
            setTestMessage(result.message);
        } catch (error) {
            setConnectionStatus('error');
            setTestMessage('Connection test failed: ' + (error as Error).message);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            await SapService.updateConfiguration(config);

            // Upload certificate if provided
            if (certificate) {
                await SapService.uploadCertificate(certificate);
                setCertificate(null);
            }

            alert('✅ SAP configuration saved successfully!');
        } catch (error) {
            const errorMsg = 'Failed to save configuration: ' + (error as Error).message;
            setError(errorMsg);
            alert('❌ ' + errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCertificate(e.target.files[0]);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">SAP Connection Settings</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Configure SAP connection parameters and authentication credentials.
                </p>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">{error}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Connection Status */}
            <Card className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Server className="h-8 w-8 text-gray-400 mr-3" />
                        <div>
                            <h3 className="text-lg font-medium">Connection Status</h3>
                            <p className="text-sm text-gray-500">
                                {connectionStatus === 'idle' && 'Not tested'}
                                {connectionStatus === 'testing' && 'Testing connection...'}
                                {connectionStatus === 'success' && testMessage}
                                {connectionStatus === 'error' && testMessage}
                            </p>
                        </div>
                    </div>
                    <div>
                        {connectionStatus === 'success' && <CheckCircle className="h-8 w-8 text-green-500" />}
                        {connectionStatus === 'error' && <XCircle className="h-8 w-8 text-red-500" />}
                        {connectionStatus === 'testing' && (
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
                        )}
                    </div>
                </div>
                <div className="mt-4">
                    <Button onClick={handleTestConnection} disabled={connectionStatus === 'testing'}>
                        Test Connection
                    </Button>
                </div>
            </Card>

            {/* Basic Configuration */}
            <Card title="Connection Parameters">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hostname</label>
                        <input
                            type="text"
                            value={config.hostname}
                            onChange={(e) => setConfig({ ...config, hostname: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                            placeholder="sap-prod.company.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">System Number</label>
                        <input
                            type="text"
                            value={config.systemNumber}
                            onChange={(e) => setConfig({ ...config, systemNumber: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                            placeholder="00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Client</label>
                        <input
                            type="text"
                            value={config.client}
                            onChange={(e) => setConfig({ ...config, client: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                            placeholder="100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Language</label>
                        <select
                            value={config.language}
                            onChange={(e) => setConfig({ ...config, language: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                        >
                            <option value="EN">English</option>
                            <option value="ES">Spanish</option>
                            <option value="DE">German</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Connection Timeout (seconds)</label>
                        <input
                            type="number"
                            value={config.connectionTimeout}
                            onChange={(e) => setConfig({ ...config, connectionTimeout: parseInt(e.target.value) })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Max Pool Size</label>
                        <input
                            type="number"
                            value={config.maxPoolSize}
                            onChange={(e) => setConfig({ ...config, maxPoolSize: parseInt(e.target.value) })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={config.useMockConnection}
                            onChange={(e) => setConfig({ ...config, useMockConnection: e.target.checked })}
                            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Use Mock Connection (for testing)</span>
                    </label>
                </div>
            </Card>

            {/* Authentication Type */}
            <Card title="Authentication">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Authentication Type</label>
                        <select
                            value={config.authenticationType}
                            onChange={(e) => setConfig({ ...config, authenticationType: e.target.value as 'BasicAuth' | 'SNC' })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                        >
                            <option value="BasicAuth">Basic Authentication (Username/Password)</option>
                            <option value="SNC">SNC (Single Sign-On with Certificate)</option>
                        </select>
                    </div>

                    {config.authenticationType === 'BasicAuth' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    <Lock className="inline h-4 w-4 mr-1" />
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={config.username || ''}
                                    onChange={(e) => setConfig({ ...config, username: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                                    placeholder="SAPVENDORPORTAL"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    <Lock className="inline h-4 w-4 mr-1" />
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={config.password || ''}
                                    onChange={(e) => setConfig({ ...config, password: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                                    placeholder="••••••••"
                                />
                                {config.password === '********' && (
                                    <p className="mt-1 text-xs text-gray-500">Leave unchanged to keep existing password</p>
                                )}
                            </div>
                        </div>
                    )}

                    {config.authenticationType === 'SNC' && (
                        <div className="space-y-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    <FileKey className="inline h-4 w-4 mr-1" />
                                    Upload Certificate (.p12 or .pfx)
                                </label>
                                <div className="mt-1 flex items-center">
                                    <input
                                        type="file"
                                        accept=".p12,.pfx,.pem"
                                        onChange={handleCertificateUpload}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                                    />
                                </div>
                                {certificate && (
                                    <p className="mt-2 text-sm text-green-600">
                                        ✓ Selected: {certificate.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">SNC Library Path</label>
                                <input
                                    type="text"
                                    value={config.sncLibraryPath || ''}
                                    onChange={(e) => setConfig({ ...config, sncLibraryPath: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                                    placeholder="/usr/sap/SNC/libsapcrypto.so"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">SNC Partner Name</label>
                                <input
                                    type="text"
                                    value={config.sncPartnerName || ''}
                                    onChange={(e) => setConfig({ ...config, sncPartnerName: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                                    placeholder="p:CN=SAP, O=Company"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">SNC Quality of Protection</label>
                                <select
                                    value={config.sncQop || '3'}
                                    onChange={(e) => setConfig({ ...config, sncQop: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                                >
                                    <option value="1">Authentication Only</option>
                                    <option value="2">Integrity Protection</option>
                                    <option value="3">Privacy Protection (Recommended)</option>
                                    <option value="9">Maximum</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Configuration'}
                </Button>
            </div>
        </div>
    );
};
