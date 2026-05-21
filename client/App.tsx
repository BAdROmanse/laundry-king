import "./styles/globals.css";
import { Route, Switch, Redirect } from "wouter";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";
import { Toaster } from "sonner";

// ── Auth / public ──────────────────────────────────────────────
import LandingPage from "./pages/auth/LandingPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import CheckEmail from "./pages/auth/CheckEmail";
import ResetPassword from "./pages/auth/ResetPassword";
import NotFound from "./pages/NotFound";

// ── User pages ─────────────────────────────────────────────────
import UserHome from "./pages/user/UserHome";
import UserTransactionHistory from "./pages/user/Transaction";
import OfferedServices from "./pages/user/OfferedServices";
import SelectWash from "./pages/user/SelectWash";
import PickupDelivery from "./pages/user/PickupDelivery";
import LaundryStatus from "./pages/user/LaundryStatus";
import Settings from "./pages/user/Settings";
import Profile from "./pages/user/Profile";
import Logout from "./pages/user/Logout";

// ── Admin pages ────────────────────────────────────────────────
import AdminDashboard from "./pages/admin/Dashboard";
import AdminLaundryStatus from "./pages/admin/LaundryStatus";
import AdminTransactions from "./pages/admin/ATransactions";
import AdminInventory from "./pages/admin/Inventory";
import AdminSales from "./pages/admin/Sales";

export default function App() {
  return (
    <>
      <Toaster position="bottom-right" richColors />
      <Switch>
        {/* ── Public ─────────────────────────────────────────── */}
        <Route path="/">
          <LandingPage />
        </Route>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/signup">
          <Signup />
        </Route>
        <Route path="/forgot-password">
          <ForgotPassword />
        </Route>
        <Route path="/check-email">
          <CheckEmail />
        </Route>
        <Route path="/reset-password">
          <ResetPassword />
        </Route>
        {/* ── User (protected) ───────────────────────────────── */}
        <Route path="/home">
          <ProtectedRoute>
            <UserHome />
          </ProtectedRoute>
        </Route>
        <Route path="/transaction-history">
          <ProtectedRoute>
            <UserTransactionHistory />
          </ProtectedRoute>
        </Route>
        <Route path="/offered-services">
          <ProtectedRoute>
            <OfferedServices />
          </ProtectedRoute>
        </Route>
        <Route path="/offered-services/wash-type">
          <ProtectedRoute>
            <SelectWash />
          </ProtectedRoute>
        </Route>
        <Route path="/offered-services/pickup-delivery">
          <ProtectedRoute>
            <PickupDelivery />
          </ProtectedRoute>
        </Route>
        <Route path="/laundry-status">
          <ProtectedRoute>
            <LaundryStatus />
          </ProtectedRoute>
        </Route>
        <Route path="/settings">
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        </Route>
        <Route path="/profile">
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        </Route>
        <Route path="/logout">
          <Logout />
        </Route>

        {/* ── Admin (protected, admin-only) ───────────────────── */}
        <Route path="/admin/dashboard">
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        </Route>
        <Route path="/admin/laundry-status">
          <AdminRoute>
            <AdminLaundryStatus />
          </AdminRoute>
        </Route>
        <Route path="/admin/transactions">
          <AdminRoute>
            <AdminTransactions />
          </AdminRoute>
        </Route>
        <Route path="/admin/inventory">
          <AdminRoute>
            <AdminInventory />
          </AdminRoute>
        </Route>
        <Route path="/admin/sales">
          <AdminRoute>
            <AdminSales />
          </AdminRoute>
        </Route>

        {/* ── Fallback ───────────────────────────────────────── */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}
