import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  TextField,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { supabase } from "../supabase";
import { CATEGORIES, COLUMNS } from "./constants";
import { GridOn, PictureAsPdf, Link as LinkIcon } from "@mui/icons-material";

// Custom cell renderer for the "Source Link" column
const SourceLinkCell = ({ value }) => (
  <a href={value} target="_blank" rel="noopener noreferrer">
    <Tooltip title="View Source">
      <IconButton>
        <LinkIcon />
      </IconButton>
    </Tooltip>
  </a>
);

SourceLinkCell.propTypes = {
  value: PropTypes.string.isRequired,
};

const AnomalyTable = () => {
  const [data, setData] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectionModel, setSelectionModel] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        setLoading(true);
        const { data: anomalies, error } = await supabase
          .from("Anomalie1")
          .select("*");
        
        if (error) throw error;
        setData(anomalies);
      } catch (err) {
        setError("Failed to load anomalies. Please try again later.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnomalies();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchesCategory = categoryFilter 
        ? row.Category === categoryFilter 
        : true;
      const searchText = filterText.toLowerCase();
      
      return (
        matchesCategory &&
        (
          (row.Category || "").toLowerCase().includes(searchText) ||
          (row.Description || "").toLowerCase().includes(searchText) ||
          (row.Location || "").toLowerCase().includes(searchText)
        )
      );
    });
  }, [data, filterText, categoryFilter]);

  const handleExportCSV = () => {
    setIsExporting(true);
    const csvData = filteredData.map(row => ({
      Category: row.Category,
      Description: row.Description,
      Location: row.Location,
      Date_Reported: row.Date_Reported,
      Source_Link: row.Source_Link,
    }));
    const csvContent = "data:text/csv;charset=utf-8," 
      + csvData.map(e => Object.values(e).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "anomalies.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExporting(false);
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    const doc = new jsPDF();
    doc.autoTable({
      head: [COLUMNS.map(col => col.headerName)],
      body: filteredData.map(row => COLUMNS.map(col => row[col.field])),
    });
    doc.save("anomalies.pdf");
    setIsExporting(false);
  };

  const columns = COLUMNS.map((col) => {
    if (col.field === 'Source_Link') {
      return {
        ...col,
        renderCell: (params) => <SourceLinkCell value={params.value} />,
      };
    }
    return col;
  });

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Anomalies Database
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Controls Container */}
      <Box sx={{ 
        display: "flex", 
        flexDirection: { xs: "column", sm: "row" },
        gap: 2, 
        mb: 3 
      }}>
        <TextField
          label="Search Anomalies"
          variant="outlined"
          fullWidth
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          sx={{ flex: 2 }}
        />

        <FormControl sx={{ flex: 1, minWidth: 200 }}>
          <InputLabel>Filter by Category</InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            label="Filter by Category"
          >
            <MenuItem value="">All Categories</MenuItem>
            {CATEGORIES.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Export as CSV">
            <IconButton 
              onClick={handleExportCSV} 
              disabled={isExporting}
              sx={{ color: "green" }}
            >
              <GridOn />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export as PDF">
            <IconButton 
              onClick={handleExportPDF} 
              disabled={isExporting}
              sx={{ color: "red" }}
            >
              <PictureAsPdf />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Data Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ 
          height: 600, 
          width: "100%",
          "& .MuiDataGrid-root": {
            border: "1px solid #ccc",
            borderRadius: 2,
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: (theme) => theme.palette.primary.main,
            color: (theme) => theme.palette.primary.contrastText,
            borderRadius: 2,
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #ccc",
          },
        }}>
          <DataGrid
            rows={filteredData}
            columns={columns}
            getRowId={(row) => row.ID}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            checkboxSelection
            disableRowSelectionOnClick
            autoHeight
            onRowClick={(params) => setSelectedAnomaly(params.row)}
            onRowSelectionModelChange={(newSelection) => 
              setSelectionModel(newSelection)
            }
            rowSelectionModel={selectionModel}
          />
        </Box>
      )}

      <Dialog 
        open={Boolean(selectedAnomaly)} 
        onClose={() => setSelectedAnomaly(null)}
        aria-labelledby="anomaly-dialog-title"
      >
        {selectedAnomaly ? (
          <>
            <DialogTitle id="anomaly-dialog-title">Anomaly Details</DialogTitle>
            <DialogContent dividers>
              {selectedAnomaly.Image_Link && (
                <img
                  src={selectedAnomaly.Image_Link}
                  alt={`Visual documentation of ${selectedAnomaly.Category} anomaly`}
                  style={{ 
                    width: "100%", 
                    borderRadius: "8px", 
                    marginBottom: "16px",
                    maxHeight: "400px",
                    objectFit: "cover"
                  }}
                />
              )}
              <Typography variant="body1" paragraph>
                <strong>Category:</strong> {selectedAnomaly.Category}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Description:</strong> {selectedAnomaly.Description}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Location:</strong> {selectedAnomaly.Location}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Reported On:</strong> {new Date(selectedAnomaly.Date_Reported).toLocaleString()}
              </Typography>
              {selectedAnomaly.Source_Link && (
                <Typography variant="body1">
                  <strong>Source:</strong> 
                  <a
                    href={selectedAnomaly.Source_Link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View original report"
                  >
                    Link
                  </a>
                </Typography>
              )}
            </DialogContent>
          </>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

AnomalyTable.propTypes = {
  data: PropTypes.array,
};

export default AnomalyTable;