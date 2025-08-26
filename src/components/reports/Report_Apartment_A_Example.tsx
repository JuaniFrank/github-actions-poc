'use client';

import React from 'react';

interface ReportProps {
  data: {
    name: string;
    totalCost: number;
    currency: string;
    items: Array<{ description: string; cost: number; category?: string }>;
    summary?: string;
    sourcePdf: string;
  };
}

const Report_Apartment_A_Example: React.FC<ReportProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{data.name}</h2>
            <p className="text-blue-100 text-sm">Generado desde: {data.sourcePdf}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {data.currency} {data.totalCost.toLocaleString()}
            </div>
            <div className="text-blue-100 text-sm">Costo Total</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Summary */}
        {data.summary && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Resumen</h3>
            <p className="text-gray-600 text-sm">{data.summary}</p>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Detalle de Costos
          </h3>
          
          {data.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">{item.description}</div>
                {item.category && (
                  <div className="text-sm text-gray-500">{item.category}</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {data.currency} {item.cost.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Reporte generado automáticamente</span>
            <span>Claude AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report_Apartment_A_Example;
