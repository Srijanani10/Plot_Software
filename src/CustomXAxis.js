import React, { useState, useEffect } from "react";
import { TextField, Button } from "@mui/material";

const CustomXAxis = ({ onApply, zoomRange }) => {
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  // Update text fields whenever zooming changes
  useEffect(() => {
    if (zoomRange) {
      setMin(zoomRange.start.toFixed(2)); // Display 2 decimal places
      setMax(zoomRange.end.toFixed(2));
    }
  }, [zoomRange]);

  return (
    <div>
      <TextField
        label="Start Value"
        value={min}
        onChange={(e) => setMin(e.target.value)}
        margin="normal"
      />
      <TextField
        label="End Value"
        value={max}
        onChange={(e) => setMax(e.target.value)}
        margin="normal"
      />
      <Button onClick={() => onApply(min, max)}>Apply X-Axis Range</Button>
    </div>
  );
};

export default CustomXAxis;
