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
  Card,
  CardContent,
  Alert,
  AlertTitle,
  Paper,
  Grid,
  styled
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
  CalendarToday,
  LocationOn,
  Label
} from "@mui/icons-material";

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[3]
}));

const GradientTypography = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: theme.spacing(3)
}));

// Custom cell renderer for the "Source Link" column
const SourceLinkCell = ({ value }) => (
  <a href={value} target="_blank" rel="noopener noreferrer">
    <Tooltip title="View Source">
      <IconButton color="primary">
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
      color="secondary"
    >
      <VisibilityIcon />
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
    <Box sx={{ width: "100%", p: 3 }}>
      <GradientTypography variant="h4" component="h1">
        Anomalies Database
      </GradientTypography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      <StyledCard>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Search Anomalies"
                variant="outlined"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <FormControl fullWidth>
                <InputLabel>Filter by Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Filter by Category"
                  startAdornment={<FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Tooltip title="Export as CSV">
                  <IconButton 
                    onClick={handleExportCSV} 
                    disabled={isExporting}
                    color="success"
                  >
                    <GridOn />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export as PDF">
                  <IconButton 
                    onClick={handleExportPDF} 
                    disabled={isExporting}
                    color="error"
                  >
                    <PictureAsPdf />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </StyledCard>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={3} sx={{ height: 600, width: "100%" }}>
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
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
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
        </Paper>
      )}

      <Dialog 
        open={Boolean(selectedAnomaly)} 
        onClose={() => setSelectedAnomaly(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedAnomaly ? (
          <>
            <DialogTitle sx={{ 
              background: (theme) => 
                `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              color: 'white'
            }}>
              Anomaly Details
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              {selectedAnomaly.Image_Link && (
                <Box
                  component="img"
                  src={selectedAnomaly.Image_Link}
                  alt={`Visual documentation of ${selectedAnomaly.Category} anomaly`}
                  sx={{
                    width: '100%',
                    height: 300,
                    objectFit: 'cover',
                    borderRadius: 1,
                    mb: 2
                  }}
                />
              )}
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Label color="primary" />
                    <Typography variant="body1" fontWeight="bold">
                      Category: {selectedAnomaly.Category}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn color="error" />
                    <Typography variant="body1" fontWeight="bold">
                      Location: {selectedAnomaly.Location}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday color="success" />
                    <Typography variant="body1" fontWeight="bold">
                      Reported: {new Date(selectedAnomaly.Date_Reported).toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body1" fontWeight="bold">
                    Description:
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {selectedAnomaly.Description}
                  </Typography>
                </Grid>

                {selectedAnomaly.Updated_Resume && (
                  <Grid item xs={12}>
                    <Typography variant="body1" fontWeight="bold">
                      Resume:
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {selectedAnomaly.Updated_Resume}
                    </Typography>
                  </Grid>
                )}

                {selectedAnomaly.Source_Link && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinkIcon color="primary" />
                      <a
                        href={selectedAnomaly.Source_Link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                      >
                        <Typography color="primary">
                          View Source
                        </Typography>
                      </a>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
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
