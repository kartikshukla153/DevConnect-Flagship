import { Routes, Route, Navigate } from "react-router-dom";

import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import CreateProfile from "./pages/CreateProfile";
import AddExperience from "./pages/AddExperience";
import Developers from "./pages/Developers";
import PublicProfile from "./pages/PublicProfile";
import AIArchitect from "./pages/AIArchitect";

import ProtectedRoute from "./routes/ProtectedRoute";
import useAuth from "./hooks/useAuth";

import AppLayout from "./layout/AppLayout";

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/feed" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/feed"
        element={
          <ProtectedLayout>
            <Feed />
          </ProtectedLayout>
        }
      />

      <Route
        path="/messages"
        element={
          <ProtectedLayout>
            <Messages />
          </ProtectedLayout>
        }
      />

      <Route
        path="/developers"
        element={
          <ProtectedLayout>
            <Developers />
          </ProtectedLayout>
        }
      />

      <Route
        path="/developers/:userId"
        element={
          <ProtectedLayout>
            <PublicProfile />
          </ProtectedLayout>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedLayout>
            <Profile />
          </ProtectedLayout>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedLayout>
            <Notifications />
          </ProtectedLayout>
        }
      />

      <Route
        path="/create-profile"
        element={
          <ProtectedLayout>
            <CreateProfile />
          </ProtectedLayout>
        }
      />

      <Route
        path="/add-experience"
        element={
          <ProtectedLayout>
            <AddExperience />
          </ProtectedLayout>
        }
      />

      <Route
        path="/ai"
        element={
          <ProtectedLayout>
            <AIArchitect />
          </ProtectedLayout>
        }
      />
    </Routes>
  );
}

export default App;