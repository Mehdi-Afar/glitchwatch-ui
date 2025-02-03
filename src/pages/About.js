import React from "react";
import { Box, Typography, Container } from "@mui/material";

const About = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        About GlitchWatch
      </Typography>
      <Typography variant="body1" paragraph>
        GlitchWatch UI is a web application designed to monitor and display anomalies in various categories. The application provides a dashboard for visualizing data and a table for detailed anomaly information. It is built using React, Material-UI, and Supabase.
      </Typography>
      <Typography variant="body1" paragraph>
        The purpose of GlitchWatch is to help users track and analyze anomalies, such as time slips, reality shifts, and mass memory discrepancies. By providing a user-friendly interface and powerful data visualization tools, GlitchWatch aims to make anomaly tracking and analysis more accessible and efficient.
      </Typography>
      <Typography variant="body1" paragraph>
        Created by El Afar El Mehdi.
      </Typography>
    </Container>
  );
};

export default About;