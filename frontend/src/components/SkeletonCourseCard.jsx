import React from 'react';

export default function SkeletonCourseCard() {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="h-48 bg-gray-200 rounded mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-2 bg-gray-100 rounded w-full"></div>
      <div className="mt-4 h-8 bg-gray-100 rounded w-1/3"></div>
    </div>
  );
}