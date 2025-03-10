import React, { useState } from "react";
import {
  Checkbox,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";

const ColumnSelection = ({ columns = [], selectedColumns = [], onColumnSelect, onIndexColumnSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredColumns = Array.isArray(columns)
    ? columns.filter((col) => col.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const selectedSet = new Set(selectedColumns);

  return (
    <div>
      <TextField
        label="Search Columns"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        margin="normal"
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Select X-Axis Column</InputLabel>
        <Select
          value={selectedColumns.length > 0 ? selectedColumns[0] : ""} // Ensure single value
          onChange={(e) => onIndexColumnSelect(e.target.value)}
        >
          {columns.map((col) => (
            <MenuItem key={col} value={col}>
              {col}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {filteredColumns.map((col) => (
        <FormControlLabel
          key={col}
          control={
            <Checkbox
              checked={selectedSet.has(col)}
              onChange={(e) => onColumnSelect(col, e.target.checked)}
            />
          }
          label={col}
        />
      ))}
    </div>
  );
};

export default ColumnSelection;
