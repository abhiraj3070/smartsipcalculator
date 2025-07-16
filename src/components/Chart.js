import React, { useEffect, useRef } from 'react';

const Chart = ({ data, width = 600, height = 300 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size based on container
    const container = canvas.parentElement;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    // Use responsive dimensions
    const canvasWidth = Math.min(containerWidth, width);
    const canvasHeight = Math.min(containerHeight, height);
    
    // Set canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    if (!data || data.length === 0) {
      // Show "No data" message
      ctx.fillStyle = '#666';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No data available', canvasWidth / 2, canvasHeight / 2);
      return;
    }
    
    // Set up margins and dimensions - responsive margins
    const margin = {
      top: 20,
      right: 20,
      bottom: 40,
      left: canvasWidth < 400 ? 40 : 60
    };
    const chartWidth = canvasWidth - margin.left - margin.right;
    const chartHeight = canvasHeight - margin.top - margin.bottom;
    
    // Find max values for scaling
    const maxValue = Math.max(...data.map(d => d.value));
    const maxInvestment = Math.max(...data.map(d => d.investment));
    const maxY = Math.max(maxValue, maxInvestment);
    
    // Helper functions
    const xScale = (index) => margin.left + (index / (data.length - 1)) * chartWidth;
    const yScale = (value) => margin.top + chartHeight - (value / maxY) * chartHeight;
    
    // Draw grid lines
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = margin.top + (i / 5) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
    }
    
    // Vertical grid lines
    for (let i = 0; i < data.length; i++) {
      const x = xScale(i);
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + chartHeight);
      ctx.stroke();
    }
    
    // Draw investment line (blue)
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = xScale(i);
      const y = yScale(d.investment);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Draw value line (green)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = xScale(i);
      const y = yScale(d.value);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Draw points
    data.forEach((d, i) => {
      const x = xScale(i);
      
      // Investment point
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(x, yScale(d.investment), 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Value point
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(x, yScale(d.value), 4, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw axes
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + chartHeight);
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartHeight);
    ctx.stroke();
    
    // Draw labels - responsive font size
    ctx.fillStyle = '#6b7280';
    ctx.font = canvasWidth < 400 ? '10px Inter' : '12px Inter';
    ctx.textAlign = 'center';
    
    // X-axis labels (years)
    data.forEach((d, i) => {
      const x = xScale(i);
      ctx.fillText(`Y${d.year}`, x, margin.top + chartHeight + 20);
    });
    
    // Y-axis labels (amounts)
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = (maxY / 5) * (5 - i);
      const y = margin.top + (i / 5) * chartHeight;
      const label = canvasWidth < 400 ? `₹${(value / 100000).toFixed(1)}L` : `₹${(value / 100000).toFixed(1)}L`;
      ctx.fillText(label, margin.left - 10, y + 4);
    }
    
  }, [data, width, height]);

  return (
    <div className="chart-container bg-white p-4 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Investment Growth Chart</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm">Investment</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm">Returns</span>
          </div>
        </div>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="chart-canvas w-full h-64 border border-gray-200 rounded"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
    </div>
  );
};

export default Chart;
