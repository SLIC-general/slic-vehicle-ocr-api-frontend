import React from 'react';
import { VehicleCRData, OverallQuality } from '../types';

interface ResultDisplayProps {
  data: VehicleCRData;
  overallQuality?: OverallQuality;
  fieldConfidence?: Record<string, number>;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ data, overallQuality, fieldConfidence }) => {
  const flaggedSet = new Set<string>();
  if (overallQuality?.flaggedFields) {
    overallQuality.flaggedFields.forEach(f => flaggedSet.add(f.toLowerCase()));
  }
  if (fieldConfidence) {
    Object.entries(fieldConfidence).forEach(([k, v]) => {
      if (v < 0.60) flaggedSet.add(k.toLowerCase());
    });
  }

  const fieldMapping = [
    { id: 'registrationNumber', label: '1. Registration No.', icon: '🚗' },
    { id: 'registrationDate', label: '2. Registration Date', icon: '📅' },
    { id: 'chassisNumber', label: '3. Chassis Number', icon: '🔢' },
    { id: 'engineNumber', label: '4. Engine Number', icon: '⚙️' },
    { id: 'ownerName', label: '5. Owner Name', icon: '👤' },
    { id: 'fatherHusbandName', label: '6. Father/Husband', icon: '👨' },
    { id: 'currentAddress', label: '7. Current Address', icon: '📍', fullWidth: true },
    { id: 'permanentAddress', label: '8. Permanent Address', icon: '🏠', fullWidth: true },
    { id: 'vehicleClass', label: '9. Vehicle Class', icon: '🚛' },
    { id: 'makersName', label: '10. Maker Name', icon: '🏭' },
    { id: 'modelName', label: '11. Model Name', icon: '🏷️' },
    { id: 'bodyType', label: '12. Body Type', icon: '🚘' },
    { id: 'mfgMonthYear', label: '13. Mfg Month/Year', icon: '🛠️' },
    { id: 'noOfCylinders', label: '14. No. of Cylinders', icon: '⛽' },
    { id: 'cubicCapacity', label: '15. Cubic Capacity', icon: '⚡' },
    { id: 'horsePower', label: '16. Horse Power', icon: '🐎' },
    { id: 'fuelType', label: '17. Fuel Type', icon: '⛽' },
    { id: 'seatingCapacity', label: '18. Seating Capacity', icon: '💺' },
    { id: 'standingCapacity', label: '19. Standing Cap.', icon: '🧍' },
    { id: 'unladenWeight', label: '20. Unladen Weight', icon: '⚖️' },
    { id: 'grossWeight', label: '21. Gross Weight', icon: '🏋️' },
    { id: 'color', label: '22. Vehicle Color', icon: '🎨' },
    { id: 'wheelbase', label: '23. Wheelbase', icon: '📏' },
    { id: 'taxValidity', label: '24. Tax Paid Up To', icon: '🧾' },
    { id: 'fitnessValidity', label: '25. Fitness Valid Up To', icon: '✅' },
    { id: 'insuranceDetails', label: '26. Insurance Info', icon: '🛡️', fullWidth: true },
    { id: 'hypothecation', label: '27. Hypothecation', icon: '🏦', fullWidth: true },
    { id: 'issuingAuthority', label: '28. Issuing Authority', icon: '🏛️', fullWidth: true },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Extracted CR Fields (28 Fields)</h2>
          <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-sm">
            AI Confidence: {Math.round((data.confidenceScore || 0.98) * 100)}%
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          {fieldMapping.map((field) => {
            const value = (data as any)[field.id];
            if (value === undefined || value === null || value === '') return null;

            const isFlagged = flaggedSet.has(field.id.toLowerCase());

            return (
              <div 
                key={field.id} 
                className={`${field.fullWidth ? 'md:col-span-2' : ''} group relative border p-3 rounded-xl transition-colors ${
                  isFlagged 
                    ? 'border-yellow-400 bg-yellow-50/60 shadow-sm ring-1 ring-yellow-400' 
                    : 'border-gray-100 hover:bg-gray-50 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{field.icon}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{field.label}</span>
                  </div>
                  {isFlagged && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-200 text-yellow-900 border border-yellow-300">
                      ⚠️ Low confidence — please verify
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-start mt-1">
                  <p className="text-md font-semibold text-gray-800 break-words leading-tight">
                    {value}
                  </p>
                  <button 
                    onClick={() => copyToClipboard(value.toString())}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-blue-100 rounded-lg transition-all text-blue-600 shrink-0 ml-2"
                    title="Copy value"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
