// src/components/dashboard/DashboardSkeleton.jsx
import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-2/4 animate-pulse"></div>
      </div>
      
      {/* İstatistik Kartları Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div className="w-full">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
              <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="mt-4 flex items-center">
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Ana İçerik Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
            <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
            <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start space-x-3 p-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="w-full">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="h-5 bg-gray-200 rounded w-2/3 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;