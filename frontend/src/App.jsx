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

import ProtectedRoute from "./routes/ProtectedRoute";

import useAuth from "./hooks/useAuth";

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
          <ProtectedRoute>
            <Feed />
          </ProtectedRoute>
        }
      />
<Route
  path="/notifications"
  element={
    <ProtectedRoute>
      <Notifications />
    </ProtectedRoute>
  }
/>
      <Route
  path="/messages"
  element={
    <ProtectedRoute>
      <Messages />
    </ProtectedRoute>
  }
/>

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-profile"
        element={
          <ProtectedRoute>
            <CreateProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-experience"
        element={
          <ProtectedRoute>
            <AddExperience />
          </ProtectedRoute>
        }
      />

      <Route
        path="/developers"
        element={
          <ProtectedRoute>
            <Developers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/developers/:userId"
        element={
          <ProtectedRoute>
            <PublicProfile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;