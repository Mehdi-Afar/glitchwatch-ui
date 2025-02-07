import React, { useState, useEffect, useMemo } from "react";
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  useTheme,
  Box,
  TextField,
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
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
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
    const { startDate, endDate } = dateRange;
    return stats.rawData.filter(item => {
      const itemDate = item.parsedDate;
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      return (!start || itemDate >= start) && 
             (!end || itemDate <= end);
    });
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
      <Grid item xs={12} container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="Start Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({
              ...prev, 
              startDate: e.target.value
            }))}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="End Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({
              ...prev, 
              endDate: e.target.value
            }))}
          />
        </Grid>
      </Grid>

      {/* Total Anomalies Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6">Total Anomalies</Typography>
            <Typography variant="h3" color="primary">
              {filteredData.length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Bar Chart - Category Distribution */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
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

      {/* Pie Chart - Category Breakdown */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6">
              Category Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => (
                    <span style={{ color: theme.palette.text.primary }}>
                      {value}
                    </span>
                  )}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `${value} Incidents`, 
                    `Percentage: ${((value/filteredData.length)*100).toFixed(2)}%`
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Line Chart - Trends Over Time */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6">
              Anomaly Trends
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
