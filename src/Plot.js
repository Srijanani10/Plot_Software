import React, { useRef, useState, useEffect, useCallback } from "react";
import ReactECharts from "echarts-for-react";
import { saveAs } from "file-saver";

const PlotComponent = ({ data, selectedColumns, indexColumn }) => {
  const chartRef = useRef(null);
  const zoomState = useRef({ startValue: null, endValue: null });
  const [zoomRange, setZoomRange] = useState({ start: "", end: "" });
  const [zoomedData, setZoomedData] = useState([]);

  useEffect(() => {
    if (data.length > 0 && indexColumn) {
      const xValues = data
        .map((row) => row[indexColumn])
        .filter((val) => val !== null && val !== undefined && val !== "");

      if (xValues.length > 0) {
        setZoomRange((prev) => ({
          start: prev.start || xValues[0],
          end: prev.end || xValues[xValues.length - 1],
        }));
      }
    }
  }, [data, indexColumn]);

  const applyZoom = useCallback(() => {
    if (chartRef.current) {
      const echartsInstance = chartRef.current.getEchartsInstance();
      echartsInstance.dispatchAction({
        type: "dataZoom",
        startValue: zoomRange.start,
        endValue: zoomRange.end,
      });

      zoomState.current = { startValue: zoomRange.start, endValue: zoomRange.end };
    }
  }, [zoomRange]);

  useEffect(() => {
    if (chartRef.current && zoomState.current.startValue && zoomState.current.endValue) {
      applyZoom();
    }
  }, [selectedColumns, applyZoom]);

  useEffect(() => {
    if (data && zoomRange.start && zoomRange.end) {
      const filteredData = data.filter((row) => {
        const xValue = new Date(row[indexColumn]).getTime();
        return xValue >= new Date(zoomRange.start).getTime() && xValue <= new Date(zoomRange.end).getTime();
      });

      setZoomedData(filteredData);
    }
  }, [data, zoomRange, indexColumn]);

  const handleZoomInputChange = (e) => {
    const { name, value } = e.target;
    setZoomRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const downloadZoomedIndexCSV = () => {
    if (!zoomedData || zoomedData.length === 0) {
      alert("No zoomed data available to export.");
      return;
    }

    const csvContent = [indexColumn, ...zoomedData.map((row) => row[indexColumn])].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "zoomed_index.csv");
  };

  const downloadAllParametersInZoomedCSV = () => {
    if (!zoomedData || zoomedData.length === 0) {
      alert("No zoomed data available to export.");
      return;
    }

    const headers = [indexColumn, ...selectedColumns];
    const csvRows = zoomedData.map((row) =>
      [row[indexColumn], ...selectedColumns.map((col) => row[col] ?? "")].join(",")
    );

    const csvContent = [headers.join(","), ...csvRows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "all_parameters_zoomed.csv");
  };

  const handleChartEvents = {
    dataZoom: (params) => {
      if (params.batch && params.batch.length > 0) {
        const { startValue, endValue } = params.batch[0];
        if (startValue !== undefined && endValue !== undefined) {
          setZoomRange({ start: startValue, end: endValue });
        }
      }
    },
  };

  if (!data || !indexColumn || data.length === 0) {
    return <div style={{ textAlign: "center", color: "#888", marginTop: "20px" }}>📉 No data to plot.</div>;
  }

  const yAxisConfig = selectedColumns.length
    ? selectedColumns.map((col, index) => ({
        type: "value",
        name: col,
        position: index % 2 === 0 ? "left" : "right",
        alignTicks: true,
        offset: index * 50,
        axisLine: { show: true },
        splitLine: { show: index === 0 },
      }))
    : [{ type: "value", name: "Default Axis" }];

  const series = selectedColumns.map((col, index) => ({
    name: col,
    type: "line",
    data: data.map((row) => row[col] ?? null),
    yAxisIndex: index,
    smooth: true,
    symbol: "circle",
    symbolSize: 6,
    showSymbol: true,
    hoverAnimation: true,
    animationEasing: "elasticOut",
    animationDelay: (idx) => idx * 10 + index * 100,
    animationDuration: 2000,
  }));

  const options = {
    title: { text: "📊 Interactive Data Plot", left: "center", top: "10px" },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      confine: true,
      extraCssText: "z-index: 1000;",
    },
    toolbox: {
      show: true,
      top: 40,
      feature: {
        saveAsImage: {},
        restore: {
          show: true,
          title: "Restore Zoom",
          icon: "path://M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
          onclick: () => {
            if (chartRef.current) {
              const echartsInstance = chartRef.current.getEchartsInstance();
          
              echartsInstance.dispatchAction({
                type: "dataZoom",
                startValue: null,
                endValue: null,
              });
          
              // Optionally reset zoomRange to the full x range:
              const xValues = data
                .map((row) => row[indexColumn])
                .filter((val) => val !== null && val !== undefined && val !== "");
          
              if (xValues.length > 0) {
                setZoomRange({
                  start: xValues[0],
                  end: xValues[xValues.length - 1],
                });
              }
          
              zoomState.current = { startValue: null, endValue: null };
            }
          },                   
        },
        dataZoom: { yAxisIndex: "none" },
        magicType: { type: ["line", "bar"] },
      },
    },
    grid: {
      show: true,
      containLabel: true,
      left: "12%",
      right: "12%",
      bottom: "25%",
      top: "22%",
      backgroundColor: "transparent",
      borderWidth: 1,
    },
    xAxis: {
      type: "category",
      name: indexColumn,
      data: data.map((row) => row[indexColumn]),
    },
    yAxis: yAxisConfig,
    series: series,
    dataZoom: [
      { type: "inside", xAxisIndex: [0] },
      { type: "slider", xAxisIndex: [0], bottom: 60 },
    ],
    legend: {
      data: selectedColumns,
      bottom: 10,
    },
    animationDuration: 800,
  };

  return (
    <div
      style={{
        width: "100%",
        height: "750px",
        padding: "15px",
        backgroundColor: "#fff",
        borderRadius: "10px",
        boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ marginBottom: "10px", display: "flex", gap: "10px", alignItems: "center" }}>
        <span style={{ fontWeight: "bold" }}>Custom Zooming with X-Axis:</span>
        <input type="text" name="start" value={zoomRange.start || ""} onChange={handleZoomInputChange} />
        <span>to</span>
        <input type="text" name="end" value={zoomRange.end || ""} onChange={handleZoomInputChange} />
        <button onClick={applyZoom} style={{ padding: "8px 15px", backgroundColor: "#28a745", color: "white" }}>
          Apply Zoom
        </button>
      </div>

      <button onClick={downloadZoomedIndexCSV}>Download Zoomed Index CSV</button>
      <button onClick={downloadAllParametersInZoomedCSV}>Download All Parameters in Zoomed CSV</button>

      <ReactECharts ref={chartRef} option={options} style={{ height: "650px", width: "100%" }} onEvents={handleChartEvents} />
    </div>
  );
};

export default PlotComponent;
