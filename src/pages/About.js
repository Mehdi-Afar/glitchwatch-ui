import React from "react";
import { 
  Box, 
  Typography, 
  Container, 
  Card, 
  CardContent, 
  Grid, 
  Chip,
  Avatar
} from "@mui/material";
import { 
  DataArray as DataIcon, 
  BarChart as ChartIcon, 
  AccountCircle as ProfileIcon,
  Cloud as AnomalyIcon,
  Search as SearchIcon
} from "@mui/icons-material";

const FeatureCard = ({ icon, title, description }) => (
  <Card 
    sx={{ 
      height: '100%', 
      transition: 'transform 0.3s ease-in-out',
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: 3
      }
    }}
  >
    <CardContent>
      <Box display="flex" alignItems="center" mb={2}>
        {icon}
        <Typography 
          variant="h6" 
          component="h3" 
          ml={2}
          sx={{ fontWeight: 'bold' }}
        >
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const About = () => {
  const features = [
    {
      icon: <DataIcon color="primary" sx={{ fontSize: 40 }} />,
      title: "Comprehensive Data Tracking",
      description: "Advanced anomaly monitoring with detailed categorization and real-time analysis."
    },
    {
      icon: <ChartIcon color="secondary" sx={{ fontSize: 40 }} />,
      title: "Interactive Visualizations",
      description: "Powerful charts and graphs to help you understand complex anomaly patterns."
    },
    {
      icon: <AnomalyIcon color="error" sx={{ fontSize: 40 }} />,
      title: "Anomaly Classification",
      description: "Systematic approach to identifying and categorizing unusual events and phenomena."
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
          color: 'white',
          borderRadius: 2,
          p: 4,
          mb: 4
        }}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ fontWeight: 'bold' }}
        >
          GlitchWatch UI
        </Typography>
        <Typography variant="h6" paragraph>
          Anomaly Tracking & Analysis Platform
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Our Mission
          </Typography>
          <Typography variant="body1" paragraph>
            GlitchWatch is a cutting-edge web application designed to monitor and visualize anomalies across various categories. 
            We provide powerful tools to track, analyze, and understand complex phenomena.
          </Typography>
        </Grid>

        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <FeatureCard 
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          </Grid>
        ))}

        <Grid item xs={12}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              bgcolor: 'background.paper', 
              p: 2,
              borderRadius: 2
            }}
          >
            <ProfileIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="body1">
              Created by El Afar El Mehdi
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Box 
        sx={{ 
          mt: 4, 
          display: 'flex', 
          justifyContent: 'center',
          gap: 2
        }}
      >
        <Chip 
          icon={<SearchIcon />} 
          label="Explore Data" 
          color="primary" 
          variant="outlined"
        />
        <Chip 
          icon={<ChartIcon />} 
          label="View Dashboard" 
          color="secondary" 
          variant="outlined"
        />
      </Box>
    </Container>
  );
};

export default About;
