import React, { useState } from "react";
import FileUpload from "./FileUpload";
import ColumnSelection from "./ColumnSelection";
import PlotComponent from "./Plot";
// import CustomXAxis from "./CustomXAxis";
// import Export from "./Export";
import Analysis from "./Analysis";
import { parse } from "papaparse";
import * as XLSX from "xlsx";
import "./App.css";

const App = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [indexColumn, setIndexColumn] = useState("");
  const [showPlotter, setShowPlotter] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false); // NEW STATE for analysis

  const handleFileUpload = (files) => {
    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target.result;
      let parsedData;

      if (file.name.endsWith(".csv")) {
        const { data: rawData } = parse(result, { header: false });
        parsedData = handleRowDeletion(rawData, "csv");
      } else if (file.name.endsWith(".xlsx")) {
        const workbook = XLSX.read(result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        parsedData = handleRowDeletion(rawData, "xlsx");
      }

      if (!parsedData || parsedData.length <= 1) {
        alert("No data available after deletion.");
        return;
      }

      const headers = parsedData[0];
      const rows = parsedData.slice(1);

      const rowObjects = rows.map((row) =>
        headers.reduce((obj, header, index) => {
          obj[header] = row[index];
          return obj;
        }, {})
      );

      setData(rowObjects);
      setColumns(headers);
      setSelectedColumns([]);
      setIndexColumn("");
    };

    reader.readAsBinaryString(file);
  };

  const handleRowDeletion = (jsonData, type) => {
    if (!jsonData || jsonData.length === 0) {
      alert("File is empty!");
      return jsonData;
    }

    const confirmDelete = window.confirm(
      "Do you want to delete any row(s)?\n Delete the rows if the data is influx\n\nNote: Row numbers start from 1 (including header row)."
    );

    if (!confirmDelete) {
      return jsonData;
    }

    const rowNumInput = window.prompt(
      `Enter the row number(s) to delete (starting from 1).\nFor multiple rows, separate them by commas.\nExample: for influx remove row number 1, 3, 4, 5\n\nRow numbers:`
    );

    if (!rowNumInput) {
      alert("No rows entered. Proceeding with original data.");
      return jsonData;
    }

    let rowNums = rowNumInput
      .split(",")
      .map((num) => parseInt(num.trim(), 10))
      .filter((num) => !isNaN(num) && num >= 1 && num <= jsonData.length)
      .sort((a, b) => b - a);

    if (rowNums.length === 0) {
      alert("No valid rows to delete. Proceeding with original data.");
      return jsonData;
    }

    rowNums.forEach((excelRowNum) => {
      jsonData.splice(excelRowNum - 1, 1);
    });

    alert(`Deleted row(s): ${rowNums.join(", ")}`);

    return jsonData;
  };

  const handleColumnSelect = (col, isSelected) => {
    setSelectedColumns((prevSelected) =>
      isSelected ? [...prevSelected, col] : prevSelected.filter((c) => c !== col)
    );
  };

  const handleIndexColumnSelect = (column) => {
    setIndexColumn(column);
  };

  return (
    <div className="app-container">
      {!showPlotter && !showAnalysis ? (
        <div className="start-screen">
          <h1>Welcome to Data Plotter</h1>
          <div className="button-container">
            <button
              className="plot-button"
              onClick={() => {
                setShowPlotter(true);
                setShowAnalysis(false);
              }}
            >
              Plot Data
            </button>
            <button
              className="analysis-button"
              onClick={() => {
                setShowAnalysis(true);
                setShowPlotter(false);
              }}
            >
              Analysis
            </button>
          </div>
        </div>
      ) : null}

      {showPlotter && (
        <div className="controls-and-plot">
          <div className="controls">
            <div className="header">
              <h1>Data Plotter</h1>
              <button
                className="back-button"
                onClick={() => setShowPlotter(false)}
              >
                Back
              </button>
            </div>
            <FileUpload onFileUpload={handleFileUpload} />
            <ColumnSelection
              columns={columns}
              selectedColumns={selectedColumns}
              onColumnSelect={handleColumnSelect}
              onIndexColumnSelect={handleIndexColumnSelect}
            />
          </div>
          <div className="plot">
            <PlotComponent
              data={data}
              selectedColumns={selectedColumns}
              indexColumn={indexColumn}
            />
          </div>
        </div>
      )}

      {showAnalysis && (
        <Analysis goBack={() => setShowAnalysis(false)} />
      )}

    </div>
  );
};

export default App;
//end of Path: Plot_Software/src/App.js