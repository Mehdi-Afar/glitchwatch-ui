import React, { useState, useEffect, useMemo } from "react";
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  useTheme,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent
} from "@mui/material";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  Brush
} from "recharts";
import { DateRangePicker } from "@mui/x-date-pickers-pro";
import { supabase } from "../supabase";

const Dashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({ 
    total: 0, 
    categories: {},
    dailyCounts: [],
    loading: true,
    error: null,
    rawData: []
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from("Anomalie1")
        .select("*");

      if (error) throw error;

      const processedData = data.map(item => ({
        ...item,
        parsedDate: new Date(item.Date_Reported)
      }));

      const categoryCounts = processedData.reduce((acc, item) => {
        acc[item.Category] = (acc[item.Category] || 0) + 1;
        return acc;
      }, {});

      const dailyCounts = processedData.reduce((acc, item) => {
        const date = item.parsedDate.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const dailyEntries = Object.entries(dailyCounts)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setStats({
        total: data.length,
        categories: categoryCounts,
        dailyCounts: dailyEntries,
        rawData: processedData,
        loading: false
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats(prev => ({
        ...prev,
        error: "Failed to load dashboard data",
        loading: false
      }));
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const filteredData = useMemo(() => {
    const [start, end] = dateRange;
    return start && end 
      ? stats.rawData.filter(item => 
          item.parsedDate >= start && item.parsedDate <= end
        )
      : stats.rawData;
  }, [stats.rawData, dateRange]);

  const chartData = useMemo(() => {
    const categoryCounts = filteredData.reduce((acc, item) => {
      acc[item.Category] = (acc[item.Category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
      name: category,
      value: count
    }));
  }, [filteredData]);

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main
  ];

  const handleCategoryClick = (data) => {
    setSelectedCategory(data);
    setDetailModalOpen(true);
  };

  const DetailModal = () => (
    <Dialog 
      open={detailModalOpen} 
      onClose={() => setDetailModalOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {selectedCategory?.category} Anomaly Details
      </DialogTitle>
      <DialogContent>
        <Typography>
          Total Incidents: {selectedCategory?.count}
          <br />
          Percentage: {((selectedCategory?.count / filteredData.length) * 100).toFixed(2)}%
        </Typography>
        {/* Add more detailed breakdown or table here */}
      </DialogContent>
    </Dialog>
  );

  if (stats.loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3} sx={{ p: 3 }}>
      {/* Date Range Selector */}
      <Grid item xs={12}>
        <DateRangePicker
          value={dateRange}
          onChange={(newValue) => setDateRange(newValue)}
          renderInput={(startProps, endProps) => (
            <>
              <TextField {...startProps} />
              <Box sx={{ mx: 2 }}> to </Box>
              <TextField {...endProps} />
            </>
          )}
        />
      </Grid>

      {/* Existing Dashboard Layouts with Interactive Elements */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6">
              Interactive Category Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={chartData}
                onClick={(data) => handleCategoryClick(data?.activePayload?.[0]?.payload)}
              >
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} Incidents`, 
                    `Percentage: ${((value/filteredData.length)*100).toFixed(2)}%`
                  ]}
                />
                <Bar 
                  dataKey="count" 
                  fill={theme.palette.primary.main}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6">
              Zoomable Anomaly Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.dailyCounts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke={theme.palette.primary.main}
                />
                <Brush height={30} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <DetailModal />
    </Grid>
  );
};

export default Dashboard;