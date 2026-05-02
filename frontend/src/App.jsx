import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ApplicationDetail from "./pages/ApplicationDetail";
import AddApplication from "./pages/AddApplication";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes — redirect to /login if not authenticated */}
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/addapplication" element={
        <ProtectedRoute>
          <AddApplication />
        </ProtectedRoute>
      } />
      <Route path="/applicationdetail/:id" element={
        <ProtectedRoute>
          <ApplicationDetail />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
