import { Suspense, lazy, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Center, Spinner, Stack, Text } from "@chakra-ui/react";
import Navbar from "./components/layout/Navbar";
import CommandPalette from "./components/CommandPalette";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ROLE_META, ROLES, STORAGE_KEYS } from "./lib/constants";

const FacultyDashboard = lazy(() => import("./pages/FacultyDashboard"));
const ChairmanDashboard = lazy(() => import("./pages/ChairmanDashboard"));
const OECDashboard = lazy(() => import("./pages/OECDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function FullScreenLoader() {
  return (
    <Center minH="60dvh">
      <Stack align="center" gap={3}>
        <Spinner size="lg" color="maroon.solid" thickness="3px" />
        <Text fontSize="sm" color="fg.muted">
          Loading your portal…
        </Text>
      </Stack>
    </Center>
  );
}

function ProtectedRoute({ user, allowedRoles, children }) {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_META[user.role]?.home ?? "/login"} replace />;
  }

  return children;
}

export default function App() {
  const [user, setUser] = useState(() => readStoredUser());
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    setUser(readStoredUser());
    setBooting(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    setUser(null);
  };

  const home = ROLE_META[user?.role]?.home ?? "/login";

  if (booting) return <FullScreenLoader />;

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user} allowedRoles={[ROLES.FACULTY]}>
                <FacultyDashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chairman"
            element={
              <ProtectedRoute user={user} allowedRoles={[ROLES.CHAIRMAN]}>
                <ChairmanDashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/oec"
            element={
              <ProtectedRoute user={user} allowedRoles={[ROLES.OEC]}>
                <OECDashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} allowedRoles={[ROLES.QEC]}>
                <AdminDashboard user={user} />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to={home} replace />} />
        </Routes>
      </Suspense>

      <CommandPalette user={user} onLogout={handleLogout} />
    </>
  );
}
