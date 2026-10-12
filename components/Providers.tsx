"use client";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#6045ff" },
    secondary: { main: "#13c5a5" },
    background: { default: "#f5f8fc", paper: "#fff" },
    text: { primary: "#12213d", secondary: "#60718e" },
  },
  typography: {
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
    button: { textTransform: "none", fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: { root: { borderRadius: 10, boxShadow: "none" } },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
  },
});
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
