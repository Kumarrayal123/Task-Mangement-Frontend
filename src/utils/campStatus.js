import React from 'react';

export const getCampStatus = (date, isHidden) => {
  if (isHidden) return 'Hidden';
  if (!date) return 'Upcoming';
  const campDate = new Date(date);
  const today = new Date();
  today.setHours(0,0,0,0);
  campDate.setHours(0,0,0,0);
  if (campDate.getTime() === today.getTime()) return 'Active Today';
  if (campDate.getTime() < today.getTime()) return 'Completed';
  return 'Upcoming';
};

export const CampStatusBadge = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'Active Today': return 'bg-emerald-100 text-emerald-700';
      case 'Completed': return 'bg-blue-100 text-blue-700';
      case 'Hidden': return 'bg-slate-100 text-slate-600';
      default: return 'bg-amber-100 text-amber-700';
    }
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStyle()}`}>
      {status}
    </span>
  );
};

const campStatusUtils = { getCampStatus, CampStatusBadge };
export default campStatusUtils;
