import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Styled container for sections
const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
}));

// Scrollable list for parameters
const ParameterList = styled(Box)(({ theme }) => ({
  maxHeight: "300px",
  overflowY: "auto",
  padding: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "#fafafa",
}));

const ParameterItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  transition: "background-color 0.3s",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

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

  const allFilteredSelected =
    filteredColumns.length > 0 &&
    filteredColumns.every((col) => selectedSet.has(col));

  const handleSelectAll = (checked) => {
    filteredColumns.forEach((col) => {
      onColumnSelect(col, checked);
    });
  };

  return (
    <Box>
      <Typography variant="h5" color="primary" fontWeight={600} gutterBottom>
        Column Selection
      </Typography>

      {/* X-Axis Selector */}
      <SectionPaper>
        <Typography variant="subtitle1" fontWeight={500} gutterBottom>
          Select X-Axis Column
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel>X-Axis Column</InputLabel>
          <Select
            value={selectedColumns.length > 0 ? selectedColumns[0] : ""}
            onChange={(e) => onIndexColumnSelect(e.target.value)}
            label="X-Axis Column"
          >
            {columns.map((col) => (
              <MenuItem key={col} value={col}>
                {col}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </SectionPaper>

      {/* Search Section */}
      <SectionPaper>
        <Typography variant="subtitle1" fontWeight={500} gutterBottom>
          Search Columns
        </Typography>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="Search columns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SectionPaper>

      

      {/* Y-Axis Parameter Selection */}
      <SectionPaper>
        <Typography variant="subtitle1" fontWeight={500} gutterBottom>
          Select Y-Axis Parameters
        </Typography>

        {filteredColumns.length > 0 && (
          <FormControlLabel
            control={
              <Checkbox
                checked={allFilteredSelected}
                indeterminate={
                  !allFilteredSelected &&
                  filteredColumns.some((col) => selectedSet.has(col))
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            }
            label="Select All Filtered"
          />
        )}

        <Divider sx={{ my: 1 }} />

        <ParameterList>
          {filteredColumns.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 2 }}
            >
              No parameters found.
            </Typography>
          ) : (
            filteredColumns.map((col) => (
              <ParameterItem key={col}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedSet.has(col)}
                      onChange={(e) =>
                        onColumnSelect(col, e.target.checked)
                      }
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" color="text.primary">
                      {col}
                    </Typography>
                  }
                  sx={{ width: "100%" }}
                />
              </ParameterItem>
            ))
          )}
        </ParameterList>
      </SectionPaper>
    </Box>
  );
};

export default ColumnSelection;
