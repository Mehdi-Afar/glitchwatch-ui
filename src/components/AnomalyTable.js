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
  Paper,
  Chip,
  Card,
  CardContent,
  CardMedia,
  Fade
} from "@mui/material";
import { 
  DataGrid, 
  gridClasses 
} from "@mui/x-data-grid";
import { 
  Search as SearchIcon, 
  FilterList as FilterIcon, 
  GridOn as ExportIcon, 
  PictureAsPdf as PDFIcon,
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  CalendarToday as DateIcon,
  Link as LinkIcon,
  Visibility as VisibilityIcon
} from "@mui/icons-material";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { supabase } from "../supabase";
import { CATEGORIES, COLUMNS } from "./constants";

const AnomalyTable = () => {
  const [data, setData] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
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

  const columns = [
    {
      field: 'detailsAction',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <Tooltip title="View Details">
          <IconButton 
            onClick={() => setSelectedAnomaly(params.row)}
            color="primary"
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      )
    },
    ...COLUMNS.map((col) => ({
      ...col,
      renderCell: (params) => {
        if (col.field === 'Source_Link') {
          return (
            <Tooltip title="Open Source">
              <IconButton 
                href={params.value} 
                target="_blank"
                color="secondary"
              >
                <LinkIcon />
              </IconButton>
            </Tooltip>
          );
        }
        return params.value;
      }
    }))
  ];

  return (
    <Box 
      sx={{ 
        width: "100%", 
        p: 3,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}
    >
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          fontWeight: 700, 
          color: 'primary.main',
          mb: 4,
          textAlign: 'center'
        }}
      >
        <CategoryIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
        Anomalies Database
      </Typography>

      {/* Search and Filter Section */}
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", sm: "row" },
          gap: 2, 
          mb: 3,
          justifyContent: 'center'
        }}
      >
        <TextField
          label="Search Anomalies"
          variant="outlined"
          fullWidth
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          sx={{ flex: 2, maxWidth: 400 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
          }}
        />

        <FormControl sx={{ flex: 1, minWidth: 200 }}>
          <InputLabel>
            <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filter Category
          </InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            label="Filter Category"
            startAdornment={<CategoryIcon sx={{ mr: 1 }} />}
          >
            <MenuItem value="">All Categories</MenuItem>
            {CATEGORIES.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Data Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
          }}
        >
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
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'primary.main',
                color: 'white',
              },
              [`& .${gridClasses.row}`]: {
                '&:nth-of-type(odd)': {
                  backgroundColor: 'action.hover',
                },
              },
            }}
          />
        </Paper>
      )}

      {/* Anomaly Details Dialog */}
      <Dialog 
        open={Boolean(selectedAnomaly)} 
        onClose={() => setSelectedAnomaly(null)}
        TransitionComponent={Fade}
        maxWidth="md"
        fullWidth
      >
        {selectedAnomaly && (
          <Card sx={{ 
            borderRadius: 3, 
            background: 'linear-gradient(145deg, #f0f4f8 0%, #def3ff 100%)' 
          }}>
            {selectedAnomaly.Image_Link && (
              <CardMedia
                component="img"
                height="300"
                image={selectedAnomaly.Image_Link}
                alt={`${selectedAnomaly.Category} Anomaly`}
                sx={{ 
                  objectFit: 'cover',
                  filter: 'brightness(0.8)'
                }}
              />
            )}
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CategoryIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6" color="primary">
                  {selectedAnomaly.Category}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip 
                  icon={<LocationIcon />} 
                  label={selectedAnomaly.Location} 
                  variant="outlined" 
                  color="secondary"
                />
                <Chip 
                  icon={<DateIcon />} 
                  label={new Date(selectedAnomaly.Date_Reported).toLocaleDateString()} 
                  variant="outlined" 
                  color="primary"
                />
              </Box>

              <Typography variant="body1" paragraph>
                {selectedAnomaly.Description}
              </Typography>

              {selectedAnomaly.Source_Link && (
                <Box sx={{ mt: 2 }}>
                  <Tooltip title="View Original Source">
                    <IconButton 
                      href={selectedAnomaly.Source_Link} 
                      target="_blank"
                      color="primary"
                    >
                      <LinkIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Dialog>
    </Box>
  );
};

export default AnomalyTable;
