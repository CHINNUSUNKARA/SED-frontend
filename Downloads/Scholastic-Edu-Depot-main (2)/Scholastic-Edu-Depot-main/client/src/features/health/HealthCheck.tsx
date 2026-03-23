import React, { useState, useEffect } from 'react';
import api from '../../lib/api';

interface HealthCheckResponse {
  status: string;
  message: string;
  timestamp?: string;
  uptime?: number;
  database?: string;
}

export const HealthCheck: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [healthData, setHealthData] = useState<Partial<HealthCheckResponse>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setStatus('checking');
        const response = await api.get<HealthCheckResponse>('/health');
        setStatus('connected');
        setHealthData(response.data);
        setError('');
      } catch (error) {
        setStatus('error');
        setError('Failed to connect to the backend server');
        console.error('Backend connection error:', error);
      }
    };

    checkConnection();
  }, []);

  if (status === 'checking') {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
        <h2 className="font-bold">Checking Backend Connection...</h2>
        <p>Please wait while we verify the connection to the server.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h2 className="font-bold">❌ Connection Error</h2>
        <p>{error}</p>
        <p className="mt-2 text-sm">
          Make sure the backend server is running on {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
      <h2 className="font-bold">✅ {healthData.message || 'Backend Connection Successful!'}</h2>
      {healthData.status && <p><strong>Status:</strong> {healthData.status}</p>}
      {healthData.database && <p><strong>Database:</strong> {healthData.database}</p>}
      {healthData.uptime !== undefined && <p><strong>Uptime:</strong> {healthData.uptime} seconds</p>}
      {healthData.timestamp && (
        <p><strong>Last Checked:</strong> {new Date(healthData.timestamp).toLocaleString()}</p>
      )}
    </div>
  );
};

export default HealthCheck;
