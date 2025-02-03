import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  useTheme,
  Box
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
  Legend 
} from "recharts";
import { supabase } from "../supabase";

const Dashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({ 
    total: 0, 
    categories: {},
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from("Anomalie1")
          .select("Category");

        if (error) throw error;

        const categoryCounts = data.reduce((acc, item) => {
          acc[item.Category] = (acc[item.Category] || 0) + 1;
          return acc;
        }, {});

        setStats(prev => ({
          ...prev,
          total: data.length,
          categories: categoryCounts,
          loading: false
        }));
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats(prev => ({
          ...prev,
          error: "Failed to load dashboard data",
          loading: false
        }));
      }
    };

    fetchStats();
  }, []);

  const chartData = useMemo(() => {
    return Object.entries(stats.categories).map(([category, count]) => ({
      category,
      count,
      name: category,
      value: count
    }));
  }, [stats.categories]);

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main
  ];

  if (stats.loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (stats.error) {
    return (
      <Typography color="error" align="center" mt={4}>
        {stats.error}
      </Typography>
    );
  }

  return (
    <Grid container spacing={3} sx={{ p: 3 }}>
      {/* Total Anomalies Card */}
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Total Anomalies
            </Typography>
            <Typography variant="h3" color="primary">
              {stats.total}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Bar Chart */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Anomaly Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="category" 
                  tick={{ fill: theme.palette.text.primary }}
                />
                <YAxis 
                  tick={{ fill: theme.palette.text.primary }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: 'none',
                    borderRadius: theme.shape.borderRadius
                  }}
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

      {/* Pie Chart */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
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
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: 'none',
                    borderRadius: theme.shape.borderRadius
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

Dashboard.propTypes = {
  theme: PropTypes.object,
};

export default Dashboard;