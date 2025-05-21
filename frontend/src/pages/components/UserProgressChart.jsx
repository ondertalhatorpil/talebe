// src/components/dashboard/UserProgressChart.jsx
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Chart.js bileşenlerini kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const UserProgressChart = ({ data = [] }) => {
  // Veri yoksa
  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-48 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-400">Henüz veri bulunmuyor</p>
      </div>
    );
  }

  // Chart.js için verileri hazırla
  const labels = data.map(item => item.date);
  const pointsData = data.map(item => item.points);
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Puanlar',
        data: pointsData,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.4,
      }
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function(tooltipItems) {
            return tooltipItems[0].label;
          },
          label: function(context) {
            return `Puan: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default UserProgressChart;