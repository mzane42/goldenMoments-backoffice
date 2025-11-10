import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminReservations from "./pages/admin/Reservations";
import AdminExperiences from "./pages/admin/Experiences";
import AdminUsers from "./pages/admin/Users";
import AdminPartners from "./pages/admin/Partners";
import PartnerDashboard from "./pages/partner/Dashboard";
import PartnerReservations from "./pages/partner/Reservations";
import PartnerExperiences from "./pages/partner/Experiences";
import PartnerCalendar from "./pages/partner/Calendar";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      
      {/* Routes Admin */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/reservations" component={AdminReservations} />
      <Route path="/admin/experiences" component={AdminExperiences} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/partners" component={AdminPartners} />
      <Route path="/admin/analytics" component={() => <div>Analytics Admin (à implémenter)</div>} />
      <Route path="/admin/reports" component={() => <div>Rapports Admin (à implémenter)</div>} />
      <Route path="/admin/settings" component={() => <div>Paramètres Admin (à implémenter)</div>} />
      
      {/* Routes Partenaire */}
      <Route path="/partner" component={PartnerDashboard} />
      <Route path="/partner/experiences" component={PartnerExperiences} />
      <Route path="/partner/calendar" component={PartnerCalendar} />
      <Route path="/partner/reservations" component={PartnerReservations} />
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
