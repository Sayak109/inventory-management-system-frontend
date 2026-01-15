"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  Grid,
} from "@mui/material";

export default function RegisterPage() {
  const [formData, setFormData] = useState<any>({
    // Business Details
    businessName: "",
    logo: "",

    // Account Details
    email: "",
    password: "",

    // Personal Information
    firstName: "",
    lastName: "",
    phone: "",

    // KYC Details
    gstNumber: "",
    panNumber: "",

    // Address
    address: {
      line1: "",
      city: "",
      state: "",
      pincode: ""
    },

    // Bank Details
    bankDetails: {
      accountHolderName: "",
      accountNumber: "",
      bankName: "",
      ifscCode: ""
    }
  });

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();

  if (isAuthenticated) {
    router.push("/dashboard");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value
        }
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If not the last step, go to next step
    if (activeStep < steps.length - 1) {
      handleNext();
      return;
    }

    // If it's the last step, submit the form
    setError("");
    setLoading(true);

    try {
      await register(formData);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      label: 'Business Information',
      fields: [
        { name: 'businessName', label: 'Business Name', required: true, xs: 12 },
        { name: 'logo', label: 'Logo URL', xs: 12 },
        { name: 'gstNumber', label: 'GST Number', required: true, xs: 12, sm: 6 },
        { name: 'panNumber', label: 'PAN Number', required: true, xs: 12, sm: 6 },
      ]
    },
    {
      label: 'Personal Information',
      fields: [
        { name: 'firstName', label: 'First Name', required: true, xs: 12, sm: 6 },
        { name: 'lastName', label: 'Last Name', xs: 12, sm: 6 },
        { name: 'email', label: 'Email', type: 'email', required: true, xs: 12, sm: 6 },
        { name: 'password', label: 'Password', type: 'password', required: true, xs: 12, sm: 6 },
        { name: 'phone', label: 'Phone Number', type: 'tel', required: true, xs: 12 },
      ]
    },
    {
      label: 'Business Address',
      fields: [
        { name: 'address.line1', label: 'Address Line 1', required: true, xs: 12 },
        { name: 'address.city', label: 'City', required: true, xs: 12, sm: 4 },
        { name: 'address.state', label: 'State', required: true, xs: 12, sm: 4 },
        { name: 'address.pincode', label: 'Pincode', required: true, xs: 12, sm: 4 },
      ]
    },
    {
      label: 'Bank Details',
      fields: [
        { name: 'bankDetails.accountHolderName', label: 'Account Holder Name', required: true, xs: 12 },
        { name: 'bankDetails.accountNumber', label: 'Account Number', required: true, xs: 12 },
        { name: 'bankDetails.bankName', label: 'Bank Name', required: true, xs: 12, sm: 8 },
        { name: 'bankDetails.ifscCode', label: 'IFSC Code', required: true, xs: 12, sm: 4 },
      ]
    }
  ];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const currentStep = steps[activeStep];

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            {currentStep.label}
          </Typography>
          <Box sx={{ width: '100%', mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              {steps.map((step, index) => (
                <div key={index}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: activeStep >= index ? 'primary.main' : 'grey.300',
                      color: activeStep >= index ? 'white' : 'text.primary',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    {index + 1}
                  </Box>
                  {index < steps.length - 1 && (
                    <Box
                      sx={{
                        flex: 1,
                        height: 4,
                        bgcolor: activeStep > index ? 'primary.main' : 'grey.300',
                        mx: 1,
                        alignSelf: 'center',
                      }}
                    />
                  )}
                </div>
              ))}
            </Box>
            <Typography variant="body2" align="center" color="textSecondary">
              Step {activeStep + 1} of {steps.length}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {currentStep.fields.map((field: any) => {
                const value = field.name.includes('.')
                  ? formData[field.name.split('.')[0] as keyof typeof formData][field.name.split('.')[1] as keyof typeof formData.address]
                  : formData[field.name as keyof typeof formData];

                return (
                  <Grid item xs={field.xs} sm={field.sm} key={field.name}>
                    <TextField
                      fullWidth
                      label={field.label}
                      name={field.name}
                      type={field.type || 'text'}
                      value={value || ''}
                      onChange={handleChange}
                      required={field.required}
                      variant="outlined"
                      margin="normal"
                    />
                  </Grid>
                );
              })}
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0 || loading}
                variant="outlined"
              >
                Back
              </Button>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {activeStep === steps.length - 1
                  ? loading ? 'Registering...' : 'Register'
                  : 'Next'}
              </Button>
            </Box>

            <Box textAlign="center" mt={2}>
              <Link href="/login" underline="hover">
                Already have an account? Login
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}
