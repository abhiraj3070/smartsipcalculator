import React, { useEffect, useRef } from 'react';

const SWPChart = ({ data, width = 600, height = 300 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Chart dimensions
    const padding = 60;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // Find max values for scaling
    const maxCorpus = Math.max(...data.map(d => d.remainingValue));
    const maxWithdrawn = Math.max(...data.map(d => d.totalWithdrawn));
    const maxYear = Math.max(...data.map(d => d.year));
    
    // Create gradients
    const corpusGradient = ctx.createLinearGradient(0, 0, 0, chartHeight);
    corpusGradient.addColorStop(0, '#f59e0b');
    corpusGradient.addColorStop(1, '#dc2626');
    
    const withdrawnGradient = ctx.createLinearGradient(0, 0, 0, chartHeight);
    withdrawnGradient.addColorStop(0, '#10b981');
    withdrawnGradient.addColorStop(1, '#059669');
    
    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i * chartWidth) / 10;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + chartHeight);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * chartHeight) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding + chartHeight);
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.stroke();
    
    // Draw corpus line (area chart)
    ctx.fillStyle = corpusGradient;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(padding, padding + chartHeight);
    
    data.forEach((point, index) => {
      const x = padding + (index * chartWidth) / (data.length - 1);
      const y = padding + chartHeight - (point.remainingValue / maxCorpus) * chartHeight;
      
      if (index === 0) {
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.fill();
    
    // Draw corpus line (stroke)
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((point, index) => {
      const x = padding + (index * chartWidth) / (data.length - 1);
      const y = padding + chartHeight - (point.remainingValue / maxCorpus) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw withdrawn line
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((point, index) => {
      const x = padding + (index * chartWidth) / (data.length - 1);
      const y = padding + chartHeight - (point.totalWithdrawn / maxWithdrawn) * chartHeight * 0.6; // Scale to 60% of chart
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw data points
    data.forEach((point, index) => {
      const x = padding + (index * chartWidth) / (data.length - 1);
      const corpusY = padding + chartHeight - (point.remainingValue / maxCorpus) * chartHeight;
      
      // Corpus points
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(x, corpusY, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Withdrawn points
      const withdrawnY = padding + chartHeight - (point.totalWithdrawn / maxWithdrawn) * chartHeight * 0.6;
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(x, withdrawnY, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Draw labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // X-axis labels (years)
    data.forEach((point, index) => {
      if (index % Math.ceil(data.length / 8) === 0) {
        const x = padding + (index * chartWidth) / (data.length - 1);
        ctx.fillText(`Y${point.year}`, x, padding + chartHeight + 20);
      }
    });
    
    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = (maxCorpus * i) / 5;
      const y = padding + chartHeight - (i * chartHeight) / 5;
      ctx.fillText(formatCurrency(value), padding - 10, y + 4);
    }
    
    // Chart title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Corpus Depletion Over Time', width / 2, 30);
    
    // Legend
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    
    // Corpus legend
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(padding, 40, 12, 12);
    ctx.fillStyle = '#374151';
    ctx.fillText('Remaining Corpus', padding + 20, 50);
    
    // Withdrawn legend
    ctx.fillStyle = '#10b981';
    ctx.fillRect(padding + 150, 40, 12, 12);
    ctx.fillStyle = '#374151';
    ctx.fillText('Total Withdrawn', padding + 170, 50);
    
  }, [data, width, height]);

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  return (
    <div className="swp-chart-container chart-container bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform hover:scale-105 transition-transform duration-300">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="swp-chart-canvas chart-canvas w-full h-auto"
      />
    </div>
  );
};

export default SWPChart;
