// src/components/dashboard/CategoryPerformance.jsx
import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { FaChartPie, FaTrophy, FaFire, FaAward } from 'react-icons/fa';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const CategoryPerformance = ({ data = [] }) => {
  // Veri yoksa
  if (!data || data.length === 0) {
    return (
      <div className="h-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-600 border-b border-gray-100">
          <h3 className="text-lg font-bold text-white flex items-center">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3">
              <FaChartPie className="text-white text-sm" />
            </div>
            Kategori Performansı
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center h-56 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mb-4">
              <FaChartPie className="text-white text-2xl" />
            </div>
            <p className="text-gray-500 text-lg font-medium mb-2">Henüz veri bulunmuyor</p>
            <p className="text-gray-400 text-sm">Quiz çözerek performansını görmeye başla</p>
          </div>
        </div>
      </div>
    );
  }

  // Chart.js için verileri hazırla
  const labels = data.map(item => item.category_name);
  const performanceData = data.map(item => item.accuracy_rate || item.score || 0);
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Başarı Oranı (%)',
        data: performanceData,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(139, 92, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12,
            weight: 'bold',
          },
          color: '#374151',
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        bodyFont: {
          size: 14,
        },
        titleFont: {
          size: 14,
          weight: 'bold',
        },
      },
    },
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(156, 163, 175, 0.3)',
          lineWidth: 1,
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
          lineWidth: 1,
        },
        pointLabels: {
          color: '#374151',
          font: {
            size: 10,
            weight: 'bold',
          },
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 10,
          },
          backdropColor: 'transparent',
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  };

  // En iyi performans kategorisini bul
  const bestCategory = data.reduce((best, current) => 
    (current.accuracy_rate || current.score || 0) > (best.accuracy_rate || best.score || 0) ? current : best, 
    data[0]
  );

  return (
    <div className="h-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-600 border-b border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-16 translate-x-16"></div>
        <div className="relative">
          <h3 className="text-lg font-bold text-white flex items-center">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3">
              <FaChartPie className="text-white text-sm" />
            </div>
            Kategori Performansı
          </h3>
          {bestCategory && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <FaTrophy className="text-yellow-300 text-xs" />
                <span className="text-white/90 text-xs font-medium">
                  En İyi: {bestCategory.category_name} (%{Math.round(bestCategory.accuracy_rate || bestCategory.score || 0)})
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart Container */}
      <div className="p-6">
        <div className="h-80 relative">
          <Radar data={chartData} options={options} />
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 text-center border border-blue-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-2">
              <FaAward className="text-white text-xs" />
            </div>
            <p className="text-xs text-gray-600">Toplam</p>
            <p className="text-lg font-bold text-gray-900">{data.length}</p>
            <p className="text-xs text-gray-500">Kategori</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 text-center border border-green-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-2">
              <FaTrophy className="text-white text-xs" />
            </div>
            <p className="text-xs text-gray-600">Ortalama</p>
            <p className="text-lg font-bold text-gray-900">
              %{Math.round(data.reduce((sum, item) => sum + (item.accuracy_rate || item.score || 0), 0) / data.length)}
            </p>
            <p className="text-xs text-gray-500">Başarı</p>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 text-center border border-orange-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-2">
              <FaFire className="text-white text-xs" />
            </div>
            <p className="text-xs text-gray-600">En İyi</p>
            <p className="text-lg font-bold text-gray-900">
              %{Math.round(Math.max(...data.map(item => item.accuracy_rate || item.score || 0)))}
            </p>
            <p className="text-xs text-gray-500">Puan</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 text-center border border-purple-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-2">
              <FaChartPie className="text-white text-xs" />
            </div>
            <p className="text-xs text-gray-600">Toplam</p>
            <p className="text-lg font-bold text-gray-900">
              {data.reduce((sum, item) => sum + (item.total_questions || 0), 0)}
            </p>
            <p className="text-xs text-gray-500">Soru</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPerformance;