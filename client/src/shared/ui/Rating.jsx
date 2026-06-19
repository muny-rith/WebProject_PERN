import React from 'react';

/**
 * Renders an interactive or display-only 5-star rating SVG set.
 */
const Rating = ({ rating = 0 }) => {
  const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map((index) => {
        const isFull = roundedRating >= index;
        const isHalf = roundedRating === index - 0.5;

        return (
          <svg
            key={index}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            style={{
              fill: isFull
                ? "hsl(var(--accent))"
                : isHalf
                  ? "url(#half-gold)"
                  : "rgba(255, 255, 255, 0.1)",
              stroke:
                isFull || isHalf
                  ? "hsl(var(--accent))"
                  : "rgba(255, 255, 255, 0.15)",
              strokeWidth: "1.5",
            }}
          >
            {isHalf && (
              <defs>
                <linearGradient
                  id="half-gold"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="50%" stopColor="hsl(var(--accent))" />
                  <stop offset="50%" stopColor="rgba(255, 255, 255, 0.1)" />
                </linearGradient>
              </defs>
            )}
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      })}
      {rating > 0 && (
        <span
          style={{
            fontSize: "0.85rem",
            color: "hsl(var(--text-muted))",
            marginLeft: "4px",
            fontWeight: "500",
          }}
        >
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default Rating;
