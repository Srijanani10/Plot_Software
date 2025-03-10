import React, { useState } from "react";
import {
  Checkbox,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Typography,
  Divider,
} from "@mui/material";

const ColumnSelection = ({
  columns = [],
  selectedColumns = [],
  onColumnSelect,
  onIndexColumnSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredColumns = Array.isArray(columns)
    ? columns.filter((col) =>
        col.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const selectedSet = new Set(selectedColumns);

  return (
    <Box p={2}>
      {/* Search Box */}
      <TextField
        label="Search Columns"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        margin="normal"
      />

      {/* X-Axis Selector */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Select X-Axis Column</InputLabel>
        <Select
          value={selectedColumns.length > 0 ? selectedColumns[0] : ""}
          onChange={(e) => onIndexColumnSelect(e.target.value)}
        >
          {columns.map((col) => (
            <MenuItem key={col} value={col}>
              {col}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Y-Axis Parameters */}
      <Box mt={3}>
        <Typography variant="subtitle1" gutterBottom>
          Select Y-Axis Parameters
        </Typography>
        <Divider />

        <Box
          sx={{
            maxHeight: 300,
            overflowY: "auto",
            border: "1px solid #ddd",
            borderRadius: 1,
            p: 2,
            mt: 1,
          }}
        >
          {/* Organized in Column Layout */}
          <Box
            display="flex"
            flexDirection="column"
            gap={1} // spacing between items
          >
            {filteredColumns.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No columns found.
              </Typography>
            ) : (
              filteredColumns.map((col) => (
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
              ))
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ColumnSelection;
