import React from 'react';

const PartnerDisplay = ({ partners = [] }) => {
  return (
    <div className="flex flex-wrap gap-1 text-xs text-slate-600">
      {partners.length > 0 ? (
        partners.map((p, i) => (
          <span key={i} className="px-2 py-0.5 bg-slate-100 rounded-md">
            {typeof p === 'object' ? (p.name || p.label || 'Partner') : p}
          </span>
        ))
      ) : (
        <span className="text-slate-400">No partners assigned</span>
      )}
    </div>
  );
};

export default PartnerDisplay;
