import React from 'react';
import { HealthCheck } from '../features/health';

const ConnectionTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Backend Connection Test</h1>
          <p className="text-gray-600">This page tests the connection between the frontend and backend.</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <HealthCheck />
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">How It Works</h2>
            <ul className="space-y-2 text-gray-700">
              <li>✅ Frontend makes an API call to <code>/api/health</code></li>
              <li>✅ Request is proxied to <code>http://localhost:5000/health</code></li>
              <li>✅ Backend responds with status and database connection info</li>
              <li>✅ Response is displayed above</li>
            </ul>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-medium text-blue-800 mb-2">Troubleshooting</h3>
              <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
                <li>Ensure the backend server is running on port 5000</li>
                <li>Check the browser's developer console for detailed error messages</li>
                <li>Verify CORS settings in the backend if you see CORS errors</li>
                <li>Make sure MongoDB is running and accessible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTestPage;
