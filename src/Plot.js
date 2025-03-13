import React, { useRef, useState, useEffect, useCallback } from "react";
import ReactECharts from "echarts-for-react";
import { saveAs } from "file-saver";

// Converts numeric timestamps to readable datetime string
const convertToDateTimeString = (value) => {
  // If it's already a valid date string, return as-is
  if (typeof value === "string" && isNaN(Number(value))) return value;

  // If it's a number (timestamp), convert to date string
  const date = new Date(Number(value) * 1000); // Assuming it's in seconds (Unix timestamp)
  if (isNaN(date.getTime())) return value;

  const pad = (num) => String(num).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};


const PlotComponent = ({ data, selectedColumns, indexColumn }) => {
  const chartRef = useRef(null);
  const zoomState = useRef({ startValue: null, endValue: null });
  const [zoomRange, setZoomRange] = useState({ start: "", end: "" });
  const [zoomedData, setZoomedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (action) => {
    action();         // Call the relevant download function
    setIsOpen(false); // Close dropdown after clicking
  };

  useEffect(() => {
    if (data.length > 0 && indexColumn) {
      const xValues = data
        .map((row) => row[indexColumn])
        .filter((val) => val !== null && val !== undefined && val !== "");

      if (xValues.length > 0) {
        setZoomRange((prev) => ({
          start: prev.start || convertToDateTimeString(xValues[0]),
          end: prev.end || convertToDateTimeString(xValues[xValues.length - 1]),
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
        const xValue = convertToDateTimeString(row[indexColumn]);
        return xValue >= zoomRange.start && xValue <= zoomRange.end;
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
      .map((xVal) => data.find((row) => convertToDateTimeString(row[indexColumn]) === xVal))
      .filter(Boolean);

    if (!visibleRows.length) {
      alert("No visible data to export!");
      return;
    }

    const allKeys = Object.keys(data[0]);
    const csvHeader = allKeys.join(",");
    const csvRows = visibleRows.map((row) =>
      allKeys
        .map((key) => {
          if (key === indexColumn) {
            return convertToDateTimeString(row[key]);
          }
          return row[key] ?? "";
        })
        .join(",")
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
        const row = data.find((item) => convertToDateTimeString(item[indexColumn]) === xVal);
        if (!row) return null;
        return [convertToDateTimeString(row[indexColumn]), ...selectedColumns.map((col) => row[col] ?? "")];
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

  // X-axis values converted to datetime strings
  const xAxisLabels = data.map((row) => convertToDateTimeString(row[indexColumn]));

  const yAxisConfig = selectedColumns.length
    ? selectedColumns.map((col, index) => ({
        type: "value",
        name: col,
        position: "right",
        alignTicks: true,
        offset: index * 60,
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
                .map((row) => convertToDateTimeString(row[indexColumn]))
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
      show: false,
      containLabel: false,
      left: "12%",
      right: "12%", // ❗ Fixed right margin
      bottom: "25%",
      top: "22%",
      backgroundColor: "transparent",
      borderWidth: 1,
    },
    xAxis: {
      type: "category",
      name: indexColumn,
      data: data.map((row) => row[indexColumn]),
      data: xAxisLabels,
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
    <div style={styles.container}>
      <div style={styles.controls}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Start:</label>
          <input
            style={styles.input}
            type="text"
            name="start"
            value={zoomRange.start}
            onChange={handleZoomInputChange}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>End:</label>
          <input
            style={styles.input}
            type="text"
            name="end"
            value={zoomRange.end}
            onChange={handleZoomInputChange}
          />
        </div>
        <button style={styles.button} onClick={applyZoom}>Apply Zoom</button>

        <div style={styles.dropdownWrapper}>
          <button
            style={styles.dropdownButton}
            onClick={() => setIsOpen(!isOpen)}
          >
            📥 Export Options
          </button>
          {isOpen && (
            <div style={styles.dropdown}>
              <button
                style={styles.dropdownItem}
                onClick={() => handleOptionClick(handleDownloadCSV)}
              >
                Export Selected Columns CSV
              </button>
              <button
                style={styles.dropdownItem}
                onClick={() => handleOptionClick(handleDownloadZoomedCSV)}
              >
                Export All Parameters CSV
              </button>
            </div>
          )}
        </div>
      </div>

      <ReactECharts
        ref={chartRef}
        option={options}
        style={{
          height: "600px",
          width: "100%",
          marginTop: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
        onEvents={handleChartEvents}
      />

    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  controls: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "bold",
  },
  input: {
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    width: "160px",
    transition: "border 0.3s ease",
  },
  button: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  dropdownWrapper: {
    position: "relative",
  },
  dropdownButton: {
    backgroundColor: "#2196F3",
    color: "white",
    padding: "10px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  dropdown: {
    position: "absolute",
    top: "42px",
    right: 0,
    backgroundColor: "white",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
    zIndex: 1,
  },
  dropdownItem: {
    padding: "10px 16px",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
    backgroundColor: "white",
    transition: "background-color 0.3s ease",
  },
};

export default PlotComponent;