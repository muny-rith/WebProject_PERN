import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div
      className="container section-padding text-center"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "6rem",
          color: "hsl(var(--accent))",
          fontWeight: "800",
          lineHeight: "1",
        }}
      >
        404
      </h1>
      <h2 style={{ fontSize: "2rem" }}>Page Not Found</h2>
      <p
        style={{
          color: "hsl(var(--text-muted))",
          maxWidth: "440px",
          lineHeight: "1.6",
        }}
      >
        The luxury curation you are searching for might have been shifted,
        deleted, or is temporarily out of service.
      </p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: "12px" }}>
        Return Home
      </Link>
    </div>
  );
};

export default NotFound;
