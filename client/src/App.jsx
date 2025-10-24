import ChatAssistant from "@/components/ChatAssistant";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";

// Pages
import AdminDashboard from "@/pages/AdminDashboard";
import AppointmentBooking from "@/pages/AppointmentBooking";
import Chat from "@/pages/Chat";
import Contact from "@/pages/Contact";
import DoctorDashboard from "@/pages/DoctorDashboard";
import DoctorList from "@/pages/DoctorList";
import Homepage from "@/pages/Homepage";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import PatientDashboard from "@/pages/PatientDashboard";
import Payment from "@/pages/Payment";
import Profile from "@/pages/Profile";
import Signup from "@/pages/Signup";
import VideoCall from "@/pages/VideoCall";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Homepage} />
      <Route path="/login" component={Login} />
  <Route path="/signup" component={Signup} />
      
      {/* Protected routes */}
      <Route path="/patient">
        <ProtectedRoute allowedRoles={['patient']}>
          <PatientDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/doctor">
        <ProtectedRoute allowedRoles={['doctor']}>
          <DoctorDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin">
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      
      {/* Public routes for homepage navigation */}
      <Route path="/doctors" component={DoctorList} />
      <Route path="/appointment-booking" component={AppointmentBooking} />
      <Route path="/contact" component={Contact} />
      <Route path="/about" component={Contact} />
      <Route path="/payment" component={Payment} />
      
      {/* Protected doctor list for authenticated users */}
      <Route path="/doctors-protected">
        <ProtectedRoute allowedRoles={['patient']}>
          <DoctorList />
        </ProtectedRoute>
      </Route>
      
      <Route path="/appointment-booking-protected">
        <ProtectedRoute allowedRoles={['patient']}>
          <AppointmentBooking />
        </ProtectedRoute>
      </Route>
      
      <Route path="/chat">
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      </Route>
      
      <Route path="/video-call">
        <ProtectedRoute>
          <VideoCall />
        </ProtectedRoute>
      </Route>
      
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      
      {/* Additional admin routes */}
      <Route path="/manage-doctors">
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/manage-users">
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/appointments">
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/analytics">
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/patients">
        <ProtectedRoute allowedRoles={['doctor']}>
          <DoctorDashboard />
        </ProtectedRoute>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <ChatAssistant />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
