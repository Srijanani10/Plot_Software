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

  // 📥 CSV Export Function
  // ✅ Download All Parameters CSV (based on visible zoom range)
  const handleDownloadZoomedCSV = () => {
    if (!chartRef.current) return;

    const echartsInstance = chartRef.current.getEchartsInstance();
    const model = echartsInstance.getModel();
    const option = model.option;

    const xAxisData = option.xAxis[0].data;
    const dataZoom = option.dataZoom && option.dataZoom[0];

    let startIndex = 0;
    let endIndex = xAxisData.length - 1;

    if (dataZoom) {
      const zoomStart = dataZoom.start != null ? dataZoom.start : 0;
      const zoomEnd = dataZoom.end != null ? dataZoom.end : 100;

      startIndex = Math.floor((zoomStart / 100) * xAxisData.length);
      endIndex = Math.floor((zoomEnd / 100) * xAxisData.length);
    }

    const visibleXAxis = xAxisData.slice(startIndex, endIndex + 1);

    if (!visibleXAxis.length) {
      alert("No visible data to export!");
      return;
    }

    const visibleRows = visibleXAxis
      .map((xVal) => data.find((row) => row[indexColumn] === xVal))
      .filter(Boolean);

    if (!visibleRows.length) {
      alert("No visible data to export!");
      return;
    }

    const allKeys = Object.keys(data[0]);
    const csvHeader = allKeys.join(",");
    const csvRows = visibleRows.map((row) =>
      allKeys.map((key) => row[key] ?? "").join(",")
    );

    const csvContent = [csvHeader, ...csvRows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "visible_data_all_parameters.csv");
  };

  // ✅ Download Selected Columns CSV (based on visible zoom range)
  const handleDownloadCSV = () => {
    if (!chartRef.current) return;

    const echartsInstance = chartRef.current.getEchartsInstance();
    const model = echartsInstance.getModel();
    const option = model.option;

    const xAxisData = option.xAxis[0].data;
    const dataZoom = option.dataZoom && option.dataZoom[0];

    let startIndex = 0;
    let endIndex = xAxisData.length - 1;

    if (dataZoom) {
      const zoomStart = dataZoom.start != null ? dataZoom.start : 0;
      const zoomEnd = dataZoom.end != null ? dataZoom.end : 100;

      startIndex = Math.floor((zoomStart / 100) * xAxisData.length);
      endIndex = Math.floor((zoomEnd / 100) * xAxisData.length);
    }

    const visibleXAxis = xAxisData.slice(startIndex, endIndex + 1);

    if (!visibleXAxis.length) {
      alert("No data available to export! Please zoom or check your data.");
      return;
    }

    const visibleRows = visibleXAxis
      .map((xVal) => {
        const row = data.find((item) => item[indexColumn] === xVal);
        if (!row) return null;
        return [row[indexColumn], ...selectedColumns.map((col) => row[col] ?? "")];
      })
      .filter(Boolean);

    if (!visibleRows.length) {
      alert("No data available to export! Please zoom or check your data.");
      return;
    }

    const csvHeaders = [indexColumn, ...selectedColumns];
    const csvRows = visibleRows.map((row) => row.join(","));
    const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "visible_plot_data.csv");
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
      <div
        style={{
          marginBottom: "10px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontWeight: "bold" }}>Custom Zooming with X-Axis:</span>
        <input
          type="text"
          name="start"
          value={zoomRange.start || ""}
          onChange={handleZoomInputChange}
          placeholder="Start"
        />
        <span>to</span>
        <input
          type="text"
          name="end"
          value={zoomRange.end || ""}
          onChange={handleZoomInputChange}
          placeholder="End"
        />
        <button
          onClick={applyZoom}
          style={{
            padding: "8px 15px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Apply Zoom
        </button>
        <button
          onClick={handleDownloadCSV}
          style={{
            marginBottom: "10px",
            padding: "8px 16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Download Visible Plot as CSV
        </button>
        <button
          onClick={handleDownloadZoomedCSV}
          style={{
            marginBottom: "10px",
            padding: "8px 16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Download all Plot as CSV
        </button>
      </div>
      <ReactECharts
        ref={chartRef}
        option={options}
        style={{ height: "650px", width: "100%" }}
        onEvents={handleChartEvents}
      />
    </div>
  );
};

export default PlotComponent;
