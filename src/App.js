import React, { useState } from "react";
import FileUpload from "./FileUpload";
import ColumnSelection from "./ColumnSelection";
import PlotComponent from "./Plot";
import CustomXAxis from "./CustomXAxis";
import Export from "./Export";
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
        parsedData = parse(result, { header: true }).data;
      } else if (file.name.endsWith(".xlsx")) {
        const workbook = XLSX.read(result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        parsedData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      }

      if (!parsedData || parsedData.length === 0) {
        alert("The file is empty or could not be parsed.");
        return;
      }

      setData(parsedData);
      setColumns(Object.keys(parsedData[0]));
    };

    reader.readAsBinaryString(file);
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
        <CustomXAxis onApply={(min, max) => console.log("Apply X-Axis Range:", min, max)} />
        <Export onExportCSV={() => console.log("Export CSV")} onExportHTML={() => console.log("Export HTML")} />
      </div>
      <div className="plot">
        <PlotComponent data={data} selectedColumns={selectedColumns} indexColumn={indexColumn} />
      </div>
    </div>
  );
};

export default App;
