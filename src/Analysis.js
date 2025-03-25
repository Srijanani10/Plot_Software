import React, { useState } from "react";

const Analysis = ({ onBack }) => {
  const [folderPath, setFolderPath] = useState("");
  const [destinationFolder, setDestinationFolder] = useState("");
  const [scriptName, setScriptName] = useState("Influx_LX70");
  const [copyFolder, setCopyFolder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState(false);
  const [details, setDetails] = useState(null); // ✅ For showing extra info from the backend

  const handleRunAnalysis = async (selectedScript = scriptName) => {
    if (!folderPath) {
      setStatusMessage("❌ Please enter/select a folder path.");
      setError(true);
      return;
    }

    setLoading(true);
    setStatusMessage("");
    setError(false);
    setDetails(null); // Clear details on new run

    try {
      const payload = {
        folderPath,
        destinationFolder,
        scriptName: selectedScript,
        copyFolder,
      };

      console.log("Sending payload:", payload);

      const response = await fetch("http://127.0.0.1:5000/run-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Received response:", data);

      if (response.ok) {
        setStatusMessage(`✅ ${data.message}`);
        setDetails(data.details || null);
        setError(false);
      } else {
        setStatusMessage(`❌ Error: ${data.message}`);
        setDetails(null);
        setError(true);
      }
    } catch (err) {
      console.error("Error running analysis:", err);
      setStatusMessage("❌ Failed to run analysis. See console for details.");
      setDetails(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleScriptChange = (e) => {
    const selectedScript = e.target.value;
    setScriptName(selectedScript);
    handleRunAnalysis(selectedScript);
  };

  const handleClearInputs = () => {
    setFolderPath("");
    setDestinationFolder("");
    setCopyFolder(false);
    setStatusMessage("");
    setDetails(null);
    setError(false);
  };

  const handleFolderSelect = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const firstFilePath = files[0].webkitRelativePath;
      const folderRoot = firstFilePath.substring(0, firstFilePath.indexOf("/"));
      
      // You can also list all files if you want
      console.log("Files in folder:", [...files].map(f => f.webkitRelativePath));
  
      setFolderPath(folderRoot);
    }
  };
  

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          ⬅ Back
        </button>
        <h1>Run Analysis</h1>
      </div>

      <div style={styles.content}>
        <div style={styles.inputGroup}>
        <label>Folder Path (Full Path Required):</label>
        <input
          type="text"
          value={folderPath}
          onChange={(e) => setFolderPath(e.target.value)}
          placeholder="e.g., C:\\Users\\JohnDoe\\Documents\\newAnalysis"
          style={styles.input}
        />

          <input
            type="file"
            style={styles.folderPicker}
            webkitdirectory="true"
            directory=""
            multiple
            onChange={handleFolderSelect}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Destination Folder (Optional):</label>
          <input
            type="text"
            value={destinationFolder}
            onChange={(e) => setDestinationFolder(e.target.value)}
            placeholder="Enter destination folder path"
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Script Name:</label>
          <select
            value={scriptName}
            onChange={handleScriptChange}
            style={styles.select}
            disabled={loading}
          >
            <option value="Influx_LX70">Influx_LX70</option>
            <option value="Influx_LXS">Influx_LXS</option>
            <option value="Influx_NDuro">Influx_NDuro</option>
            <option value="Influx_NDuro_NoGPS">Influx_NDuro_NoGPS</option>
          </select>
        </div>

        <div style={styles.checkboxGroup}>
          <input
            type="checkbox"
            checked={copyFolder}
            onChange={(e) => setCopyFolder(e.target.checked)}
            disabled={loading}
          />
          <label style={{ marginLeft: "8px" }}>Copy Folder Before Analysis</label>
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={() => handleRunAnalysis()}
            disabled={loading}
            style={{
              ...styles.button,
              backgroundColor: loading ? "#999" : "#28a745",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Running..." : "Run Analysis"}
          </button>

          <button
            onClick={handleClearInputs}
            disabled={loading}
            style={{
              ...styles.button,
              backgroundColor: "#6c757d",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Clear Fields
          </button>
        </div>

        {statusMessage && (
          <div
            style={{
              ...styles.statusMessage,
              color: error ? "red" : "green",
            }}
          >
            {statusMessage}
          </div>
        )}

        {/* Extra details */}
        {details && (
          <div style={styles.detailsBox}>
            <h3>Analysis Details:</h3>
            <ul>
              {Object.entries(details).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {value}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && !loading && (
          <button
            onClick={() => handleRunAnalysis()}
            style={styles.retryButton}
          >
            🔄 Retry
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  screen: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    maxWidth: "600px",
    margin: "auto",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
  },
  backButton: {
    marginRight: "10px",
    padding: "5px 12px",
    cursor: "pointer",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
  },
  content: {
    display: "flex",
    flexDirection: "column",
  },
  inputGroup: {
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginTop: "5px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  folderPicker: {
    marginTop: "10px",
  },
  select: {
    width: "100%",
    padding: "8px",
    marginTop: "5px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  checkboxGroup: {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
  },
  button: {
    flex: 1,
    padding: "10px",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontWeight: "bold",
  },
  statusMessage: {
    marginTop: "20px",
    fontWeight: "bold",
  },
  detailsBox: {
    marginTop: "20px",
    padding: "10px",
    backgroundColor: "#e9ecef",
    borderRadius: "4px",
  },
  retryButton: {
    padding: "10px",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "10px",
  },
};

export default Analysis;
