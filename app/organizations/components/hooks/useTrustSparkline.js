import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

/**
 * Renders an ECharts sparkline (tiny line chart) inside a DOM element.
 * Handles resize, disposal, and re-rendering when data changes.
 * 
 * @param {string} containerId - ID of the DOM element to render the chart into
 * @param {number[]} data - Array of trust scores (historical values)
 * @param {Object} options - Optional configuration (color, height, etc.)
 */
export function useTrustSparkline(containerId, data, options = {}) {
  const chartRef = useRef(null);
  const resizeObserverRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    // Dispose existing chart if any
    if (chartRef.current) {
      chartRef.current.dispose();
      chartRef.current = null;
    }

    // Initialize new chart
    const chart = echarts.init(container);
    chartRef.current = chart;

    // Default options with smooth line, area fill, and minimal styling
    const defaultOptions = {
      grid: { show: false, left: 0, right: 0, top: 4, bottom: 4, containLabel: false },
      xAxis: { show: false, type: 'category' },
      yAxis: { show: false, min: Math.min(...data, 0) * 0.9, max: Math.max(...data, 100) * 1.05 },
      series: [{
        type: 'line',
        data: data,
        smooth: true,
        lineStyle: { width: 1.5, color: options.color || '#6366f1' },
        areaStyle: { opacity: 0.2, color: options.color || '#6366f1' },
        showSymbol: false,
        symbol: 'none',
        step: false,
        connectNulls: true,
      }],
      tooltip: { show: false },
      animation: false,
    };

    chart.setOption(defaultOptions);

    // Handle window resize
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    // Also listen for container resize (if parent changes size)
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserverRef.current = new ResizeObserver(() => chart.resize());
      resizeObserverRef.current.observe(container);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (chartRef.current) {
        chartRef.current.dispose();
        chartRef.current = null;
      }
    };
  }, [containerId, data, options.color]);

  return chartRef.current;
}