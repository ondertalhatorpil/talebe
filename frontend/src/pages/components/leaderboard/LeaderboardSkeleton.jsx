import React from 'react';

const LeaderboardSkeleton = ({ 
  showMyRanking = true,
  showTabs = true,
  showFilters = true,
  showTable = true,
  rowCount = 10 
}) => {
  // Pulse animation class
  const pulseClass = "animate-pulse bg-gray-200 rounded";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <div className={`${pulseClass} h-8 sm:h-12 w-3/4 mx-auto mb-4`} />
          <div className={`${pulseClass} h-4 w-1/2 mx-auto`} />
        </div>

        {/* My Ranking Card Skeleton */}
        {showMyRanking && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`${pulseClass} w-12 h-12 rounded-full`} />
                  <div>
                    <div className={`${pulseClass} h-6 w-40 mb-2`} />
                    <div className={`${pulseClass} h-4 w-32`} />
                  </div>
                </div>
                <div className="text-right">
                  <div className={`${pulseClass} h-8 w-24 mb-1`} />
                  <div className={`${pulseClass} h-4 w-20`} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`${pulseClass} w-6 h-6 rounded`} />
                      <div className={`${pulseClass} w-8 h-6 rounded-full`} />
                    </div>
                    <div className={`${pulseClass} h-4 w-20 mb-1`} />
                    <div className={`${pulseClass} h-6 w-16 mb-1`} />
                    <div className={`${pulseClass} h-3 w-24`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation Skeleton */}
        {showTabs && (
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`${pulseClass} h-14 w-32 sm:w-40 rounded-xl`} />
            ))}
          </div>
        )}

        {/* Filters Skeleton */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className={`${pulseClass} h-4 w-20 mb-2`} />
                  <div className={`${pulseClass} h-10 w-full rounded-lg`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table Skeleton */}
        {showTable && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Table Header Skeleton */}
            <div className="bg-gray-50 p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`${pulseClass} w-8 h-8 rounded`} />
                  <div>
                    <div className={`${pulseClass} h-5 w-32 mb-1`} />
                    <div className={`${pulseClass} h-3 w-24`} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`${pulseClass} w-4 h-4 rounded-full`} />
                  <div className={`${pulseClass} h-4 w-24`} />
                </div>
              </div>
            </div>

            {/* Table Headers */}
            <div className="bg-gray-50">
              <div className="grid grid-cols-6 gap-4 p-4">
                {['Sıra', 'İsim', 'Okul', 'Şehir', 'Puan', 'Detay'].map((_, i) => (
                  <div key={i} className={`${pulseClass} h-4 w-full`} />
                ))}
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-200">
              {[...Array(rowCount)].map((_, i) => (
                <div key={i} className="p-4">
                  <div className="grid grid-cols-6 gap-4 items-center">
                    {/* Rank */}
                    <div className="flex items-center gap-2">
                      <div className={`${pulseClass} w-10 h-10 rounded-full`} />
                      {i < 3 && <div className={`${pulseClass} w-6 h-6 rounded`} />}
                    </div>
                    
                    {/* Student Info */}
                    <div className="flex items-center gap-3">
                      <div className={`${pulseClass} w-12 h-12 rounded-full`} />
                      <div>
                        <div className={`${pulseClass} h-4 w-24 mb-1`} />
                        <div className={`${pulseClass} h-3 w-16`} />
                      </div>
                    </div>
                    
                    {/* School */}
                    <div>
                      <div className={`${pulseClass} h-4 w-32 mb-1`} />
                      <div className={`${pulseClass} h-3 w-20`} />
                    </div>
                    
                    {/* City */}
                    <div className={`${pulseClass} h-4 w-20`} />
                    
                    {/* Points */}
                    <div>
                      <div className={`${pulseClass} h-6 w-16 mb-1`} />
                      <div className={`${pulseClass} h-3 w-12`} />
                    </div>
                    
                    {/* Action */}
                    <div className={`${pulseClass} w-8 h-8 rounded`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Table Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className={`${pulseClass} h-4 w-32`} />
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`${pulseClass} w-4 h-4 rounded`} />
                    <div className={`${pulseClass} h-3 w-12`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`${pulseClass} w-4 h-4 rounded`} />
                    <div className={`${pulseClass} h-3 w-12`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Skeleton Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`${pulseClass} w-10 h-10 rounded-lg`} />
                <div className={`${pulseClass} h-5 w-32`} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className={`${pulseClass} h-4 w-24`} />
                  <div className={`${pulseClass} h-4 w-16`} />
                </div>
                <div className="flex justify-between items-center">
                  <div className={`${pulseClass} h-4 w-20`} />
                  <div className={`${pulseClass} h-4 w-12`} />
                </div>
                <div className="flex justify-between items-center">
                  <div className={`${pulseClass} h-4 w-28`} />
                  <div className={`${pulseClass} h-4 w-20`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Indicator */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-3 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-lg">Veriler yükleniyor...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardSkeleton;