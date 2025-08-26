'use client';

import React from 'react';

interface Report {
  id: string;
  name: string;
  generatedAt: string;
  totalCost: number;
  currency: string;
  items: Array<{
    description: string;
    cost: number;
  }>;
}

interface ReportListProps {
  reports?: Report[];
}

const ReportList: React.FC<ReportListProps> = ({ reports = [] }) => {
  if (reports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No hay reportes disponibles
          </h2>
          <p className="text-gray-500">
            Los reportes se generan automáticamente al procesar PDFs de Google Drive
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reportes de Costos
          </h1>
          <p className="text-gray-600">
            Reportes generados automáticamente desde PDFs de Google Drive
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {report.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(report.generatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-2xl font-bold text-green-600">
                    {report.currency} {report.totalCost.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Costo Total</div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Detalles:</h4>
                  {report.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate flex-1">
                        {item.description}
                      </span>
                      <span className="text-gray-900 font-medium ml-2">
                        {report.currency} {item.cost.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {report.items.length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{report.items.length - 3} items más
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportList;
