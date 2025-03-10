import React from "react";
import { Button } from "@mui/material";

const Export = ({ onExportCSV, onExportHTML }) => {
  return (
    <div>
      <Button onClick={onExportCSV}>Export Zoomed Data as CSV</Button>
      <Button onClick={onExportHTML}>Save Plot as HTML</Button>
    </div>
  );
};

export default Export;