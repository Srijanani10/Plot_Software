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
  Button,
  Collapse,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
}));

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
  const [visibleGroup, setVisibleGroup] = useState(null); // 'motor' | 'battery' | null

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

  const motorErrors = [
    "DriveError_Motor_hall [SA: 02]",
    "Motor_Stalling [SA: 02]",
    "Motor_Phase_loss [SA: 02]",
    "Controller_Over_Temeprature [SA: 02]",
    "Motor_Over_Temeprature [SA: 02]",
    "Throttle_Error [SA: 02]",
    "MOSFET_Protection [SA: 02]",
    "DriveError_Controller_OverVoltag [SA: 02]",
    "Controller_Undervoltage [SA: 02]",
    "Overcurrent_Fault [SA: 02]",
    "Drive_Error_Flag [SA: 02]",
  ];

  const batteryErrors = [
    "CellUnderVolProt [SA: 09]",
    "CellOverVolProt [SA: 09]",
    "PackUnderVolProt [SA: 09]",
    "PackOverVolProt [SA: 09]",
    "ChgUnderTempProt [SA: 09]",
    "ChgOverTempProt [SA: 09]",
    "DchgUnderTempProt [SA: 09]",
    "DchgOverCurrProt [SA: 09]",
    "CellOverVolWarn [SA: 09]",
    "FetTempProt [SA: 09]",
    "ResSocProt [SA: 09]",
    "FetFailure [SA: 09]",
    "TempSenseFault [SA: 09]",
    "PackUnderVolWarn [SA: 09]",
    "PackOverVolWarn [SA: 09]",
    "ChgUnderTempWarn [SA: 09]",
    "ChgOverTempWarn [SA: 09]",
    "DchgUnderTempWarn [SA: 09]",
    "DchgOverTempWarn [SA: 09]",
    "LedStatus [SA: 09]",
    "PreChgFetStatus [SA: 09]",
    "ChgFetStatus [SA: 09]",
    "DchgFetStatus [SA: 09]",
    "ResStatus [SA: 09]",
    "ShortCktProt [SA: 09]",
    "DschgPeakProt [SA: 09]",
    "ActiveCellBalStatus [SA: 09]",
    "ChgAuth [SA: 09]",
    "ChgPeakProt [SA: 09]",
  ];

  const existingMotorErrors = motorErrors.filter((param) =>
    columns.includes(param)
  );
  const existingBatteryErrors = batteryErrors.filter((param) =>
    columns.includes(param)
  );

  const toggleGroup = (group) => {
    setVisibleGroup((prev) => (prev === group ? null : group));
  };

  const renderErrorGroup = (group, label, data) => {
    return (
      <Collapse in={visibleGroup === group} unmountOnExit>
        <Box mt={2}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {label}
          </Typography>
          {data.map((param) => (
            <FormControlLabel
              key={param}
              control={
                <Checkbox
                  checked={selectedSet.has(param)}
                  onChange={(e) => onColumnSelect(param, e.target.checked)}
                />
              }
              label={param}
            />
          ))}
        </Box>
      </Collapse>
    );
  };

  return (
    <Box>
      <Typography variant="h5" color="primary" fontWeight={600} gutterBottom>
        Column Selection
      </Typography>

      {/* X-Axis */}
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

      {/* Search Bar */}
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

      {/* Error Buttons */}
      <SectionPaper>
        <Typography variant="subtitle1" fontWeight={500} gutterBottom>
          Error Parameters
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color={visibleGroup === "motor" ? "primary" : "inherit"}
            disabled={existingMotorErrors.length === 0}
            onClick={() => toggleGroup("motor")}
          >
            Motor Errors
          </Button>
          <Button
            variant="contained"
            color={visibleGroup === "battery" ? "primary" : "inherit"}
            disabled={existingBatteryErrors.length === 0}
            onClick={() => toggleGroup("battery")}
          >
            Battery Errors
          </Button>
        </Stack>

        {/* Conditionally Render Error Checkboxes */}
        {renderErrorGroup("motor", "Motor Error Parameters", existingMotorErrors)}
        {renderErrorGroup("battery", "Battery Error Parameters", existingBatteryErrors)}
      </SectionPaper>

      {/* Y-Axis Parameters */}
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
                      onChange={(e) => onColumnSelect(col, e.target.checked)}
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
