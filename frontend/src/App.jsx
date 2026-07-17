import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Feed from "./pages/Feed";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Developers from "./pages/Developers";
import PublicProfile from "./pages/PublicProfile";
import Profile from "./pages/Profile";
import CreateProfile from "./pages/CreateProfile";
import AddExperience from "./pages/AddExperience";
import AIArchitect from "./pages/AIArchitect";

import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import CreateProject from "./pages/CreateProject";

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
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <Navigate to="/login" replace />
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        }
      />

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
  path="/workspace/:id"
  element={
    <ProtectedLayout>
      <ProjectWorkspace />
    </ProtectedLayout>
  }
/>

      <Route
        path="/projects"
        element={
          <ProtectedLayout>
            <Projects />
          </ProtectedLayout>
        }
      />

      <Route
        path="/projects/create"
        element={
          <ProtectedLayout>
            <CreateProject />
          </ProtectedLayout>
        }
      />

      <Route
        path="/projects/:id"
        element={
          <ProtectedLayout>
            <ProjectDetails />
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

      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? "/dashboard" : "/login"}
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;