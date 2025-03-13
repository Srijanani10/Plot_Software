import React, { useState } from "react";
import FileUpload from "./FileUpload";
import ColumnSelection from "./ColumnSelection";
import PlotComponent from "./Plot";
// import CustomXAxis from "./CustomXAxis";
// import Export from "./Export";
import { parse } from "papaparse";
import * as XLSX from "xlsx";
import "./App.css";

const App = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [indexColumn, setIndexColumn] = useState("");

  const handleFileUpload = (files) => {
    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target.result;
      let parsedData;

      if (file.name.endsWith(".csv")) {
        // Parse CSV as 2D array for row manipulation
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

      // After deletion, parse header and rows
      const headers = parsedData[0];
      const rows = parsedData.slice(1);

      // Convert rows back to objects for easier plotting
      const rowObjects = rows.map((row) =>
        headers.reduce((obj, header, index) => {
          obj[header] = row[index];
          return obj;
        }, {})
      );

      setData(rowObjects);
      setColumns(headers);
      setSelectedColumns([]); // Reset selected columns on new upload
      setIndexColumn("");     // Reset index column
    };

    reader.readAsBinaryString(file);
  };

  // Handles deleting rows and returns cleaned data (2D array)
  const handleRowDeletion = (jsonData, type) => {
    if (!jsonData || jsonData.length === 0) {
      alert("File is empty!");
      return jsonData;
    }

    // Prompt the user to delete any rows
    const confirmDelete = window.confirm(
      "Do you want to delete any row(s)?\n\nNote: Row numbers start from 1 (including header row)."
    );

    if (!confirmDelete) {
      return jsonData; // No deletion requested
    }

    const rowNumInput = window.prompt(
      `Enter the row number(s) to delete (as in Excel, starting from 1).\nFor multiple rows, separate them by commas.\nExample: 2,4`
    );

    if (!rowNumInput) {
      alert("No rows entered. Proceeding with original data.");
      return jsonData;
    }

    // Convert input to row numbers
    let rowNums = rowNumInput
      .split(",")
      .map((num) => parseInt(num.trim(), 10))
      .filter((num) => !isNaN(num) && num >= 1 && num <= jsonData.length)
      .sort((a, b) => b - a); // Descending order for safe splicing

    if (rowNums.length === 0) {
      alert("No valid rows to delete. Proceeding with original data.");
      return jsonData;
    }

    // Delete rows based on row numbers
    rowNums.forEach((excelRowNum) => {
      jsonData.splice(excelRowNum - 1, 1); // Subtract 1 because array index starts at 0
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
      <div className="controls">
        <h1>Data Plotter</h1>
        <FileUpload onFileUpload={handleFileUpload} />
        <ColumnSelection
          columns={columns}
          selectedColumns={selectedColumns}
          onColumnSelect={handleColumnSelect}
          onIndexColumnSelect={handleIndexColumnSelect}
        />
        {/* <CustomXAxis onApply={(min, max) => console.log("Apply X-Axis Range:", min, max)} />
        <Export onExportCSV={() => console.log("Export CSV")} onExportHTML={() => console.log("Export HTML")} /> */}
      </div>
      <div className="plot">
        <PlotComponent
          data={data}
          selectedColumns={selectedColumns}
          indexColumn={indexColumn}
        />
      </div>
    </div>
  );
};

export default App;
