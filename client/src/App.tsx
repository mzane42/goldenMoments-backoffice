import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import PartnerDashboard from "./pages/partner/Dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      
      {/* Routes Admin */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/reservations" component={() => <div>Réservations Admin (à implémenter)</div>} />
      <Route path="/admin/experiences" component={() => <div>Expériences Admin (à implémenter)</div>} />
      <Route path="/admin/users" component={() => <div>Utilisateurs Admin (à implémenter)</div>} />
      <Route path="/admin/partners" component={() => <div>Partenaires Admin (à implémenter)</div>} />
      <Route path="/admin/analytics" component={() => <div>Analytics Admin (à implémenter)</div>} />
      <Route path="/admin/reports" component={() => <div>Rapports Admin (à implémenter)</div>} />
      <Route path="/admin/settings" component={() => <div>Paramètres Admin (à implémenter)</div>} />
      
      {/* Routes Partenaire */}
      <Route path="/partner" component={PartnerDashboard} />
      <Route path="/partner/experiences" component={() => <div>Mes Expériences (à implémenter)</div>} />
      <Route path="/partner/calendar" component={() => <div>Calendrier (à implémenter)</div>} />
      <Route path="/partner/reservations" component={() => <div>Réservations Partenaire (à implémenter)</div>} />
      <Route path="/partner/revenue" component={() => <div>Mes Revenus (à implémenter)</div>} />
      <Route path="/partner/settings" component={() => <div>Paramètres Partenaire (à implémenter)</div>} />
      
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
