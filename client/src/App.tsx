import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import ProgramsPage from "@/pages/ProgramsPage";
import UniversityPage from "@/pages/UniversityPage";
import GetInvolvedPage from "@/pages/GetInvolvedPage";
import NewsPage from "@/pages/NewsPage";
import NewsDetailPage from "@/pages/NewsDetailPage";
import ContactPage from "@/pages/ContactPage";
import EventsPage from "@/pages/EventsPage";
import AdminPage from "@/pages/AdminPage";
import AdminLogin from "@/pages/AdminLogin";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

function Router() {
  return (
    <>
      <Header />
      <main>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/programs" component={ProgramsPage} />
          <Route path="/university" component={UniversityPage} />
          <Route path="/get-involved" component={GetInvolvedPage} />
          <Route path="/news" component={NewsPage} />
          <Route path="/news/:slug" component={NewsDetailPage} />
          <Route path="/events" component={EventsPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/admin" component={AdminPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
