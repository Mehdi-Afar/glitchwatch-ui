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
import { 
  GridOn, 
  PictureAsPdf, 
  Link as LinkIcon, 
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Search, Filter, Download, FileText, Eye, Calendar, MapPin, Tag } from "lucide-react";

// Custom cell renderer for the "Source Link" column
const SourceLinkCell = ({ value }) => (
  <a href={value} target="_blank" rel="noopener noreferrer">
    <Tooltip title="View Source">
      <IconButton className="text-blue-500 hover:text-blue-600 transition-colors">
        <LinkIcon />
      </IconButton>
    </Tooltip>
  </a>
);

SourceLinkCell.propTypes = {
  value: PropTypes.string.isRequired,
};

// Custom cell renderer for the "Details" column
const DetailsCell = ({ row, onClick }) => (
  <Tooltip title="View Details">
    <IconButton 
      onClick={() => onClick(row)}
      className="text-purple-500 hover:text-purple-600 transition-colors"
    >
      <Eye className="h-5 w-5" />
    </IconButton>
  </Tooltip>
);

DetailsCell.propTypes = {
  row: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
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
        const cleanedData = anomalies.map(anomaly => ({
          ...anomaly,
          Description: anomaly.Description.replace(/Incident \d+: /, ""),
        }));
        setData(cleanedData);
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

  const columns = [
    {
      field: 'ID',
      headerName: 'Glitch',
      width: 100,
      renderCell: (params) => <DetailsCell row={params.row} onClick={setSelectedAnomaly} />,
    },
    ...COLUMNS.filter(col => col.field !== 'ID').map((col) => {
      if (col.field === 'Source_Link') {
        return {
          ...col,
          renderCell: (params) => <SourceLinkCell value={params.value} />,
        };
      }
      return col;
    }),
  ];

  return (
    <Box className="w-full p-6 space-y-6">
      {/* Header with gradient text */}
      <Typography 
        variant="h4" 
        component="h1" 
        className="font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
        gutterBottom
      >
        Anomalies Database
      </Typography>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Controls Container */}
      <Box className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search Field */}
        <Box className="relative md:col-span-5">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <TextField
            label="Search Anomalies"
            variant="outlined"
            fullWidth
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon className="text-gray-400 mr-2" />,
            }}
            className="w-full"
          />
        </Box>

        {/* Category Filter */}
        <FormControl className="md:col-span-4">
          <InputLabel>Filter by Category</InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            label="Filter by Category"
            startAdornment={<FilterIcon className="text-gray-400 mr-2" />}
          >
            <MenuItem value="">All Categories</MenuItem>
            {CATEGORIES.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Export Buttons */}
        <Box className="flex space-x-2 md:col-span-3 justify-end">
          <Tooltip title="Export as CSV">
            <IconButton 
              onClick={handleExportCSV} 
              disabled={isExporting}
              className="text-green-500 hover:text-green-600 transition-colors"
            >
              <Download className="h-5 w-5" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export as PDF">
            <IconButton 
              onClick={handleExportPDF} 
              disabled={isExporting}
              className="text-red-500 hover:text-red-600 transition-colors"
            >
              <FileText className="h-5 w-5" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Data Grid */}
      {loading ? (
        <Box className="flex justify-center items-center h-96">
          <CircularProgress className="text-blue-500" />
        </Box>
      ) : (
        <Box className="h-[600px] w-full rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
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
            className="bg-white dark:bg-gray-900"
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: 1,
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid',
                borderColor: 'divider',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          />
        </Box>
      )}

      {/* Detail Modal */}
      <Dialog 
        open={Boolean(selectedAnomaly)} 
        onClose={() => setSelectedAnomaly(null)}
        maxWidth="md"
        fullWidth
        className="rounded-lg"
      >
        {selectedAnomaly ? (
          <>
            <DialogTitle className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              Anomaly Details
            </DialogTitle>
            <DialogContent className="space-y-4 p-6">
              {selectedAnomaly.Image_Link && (
                <img
                  src={selectedAnomaly.Image_Link}
                  alt={`Visual documentation of ${selectedAnomaly.Category} anomaly`}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-blue-500" />
                  <Typography variant="body1" className="font-semibold">
                    Category: {selectedAnomaly.Category}
                  </Typography>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-red-500" />
                  <Typography variant="body1" className="font-semibold">
                    Location: {selectedAnomaly.Location}
                  </Typography>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <Typography variant="body1" className="font-semibold">
                    Reported: {new Date(selectedAnomaly.Date_Reported).toLocaleString()}
                  </Typography>
                </div>
                
                <Typography variant="body1" className="mt-4">
                  <strong>Description:</strong>
                  <p className="text-gray-700 dark:text-gray-300 mt-2">
                    {selectedAnomaly.Description}
                  </p>
                </Typography>

                {selectedAnomaly.Updated_Resume && (
                  <Typography variant="body1">
                    <strong>Resume:</strong>
                    <p className="text-gray-700 dark:text-gray-300 mt-2">
                      {selectedAnomaly.Updated_Resume}
                    </p>
                  </Typography>
                )}

                {selectedAnomaly.Source_Link && (
                  <div className="flex items-center space-x-2">
                    <LinkIcon className="text-blue-500" />
                    <Typography variant="body1">
                      <a
                        href={selectedAnomaly.Source_Link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        View Source
                      </a>
                    </Typography>
                  </div>
                )}
              </div>
            </DialogContent>
          </>
        ) : (
          <Box className="flex justify-center items-center p-6">
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
