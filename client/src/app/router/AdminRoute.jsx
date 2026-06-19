import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Route protection gate ensuring only authenticated administrative users gain access.
 */
const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="container section-padding text-center">
        <p style={{ color: "hsl(var(--text-muted))", fontSize: "1.2rem" }}>
          Verifying admin authorization credentials...
        </p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    // If not admin, silently redirect to login or homepage
    alert("Access denied. Admin authorization credentials required.");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
