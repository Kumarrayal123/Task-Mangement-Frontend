import React from 'react';

const VolunteerDisplay = ({ volunteers = [] }) => {
  return (
    <div className="flex flex-wrap gap-1 text-xs text-slate-600">
      {volunteers.length > 0 ? (
        volunteers.map((v, i) => (
          <span key={i} className="px-2 py-0.5 bg-slate-100 rounded-md">
            {typeof v === 'object' ? (v.name || v.label || 'Volunteer') : v}
          </span>
        ))
      ) : (
        <span className="text-slate-400">No volunteers assigned</span>
      )}
    </div>
  );
};

export default VolunteerDisplay;
