import React from 'react';
import './LoadingSkeleton.css';

/**
 * Loading skeleton to display beautiful animated placeholders.
 */
export const LoadingSkeleton = ({ count = 4 }) => {
  return (
    <>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div className="skeleton-card" key={i}>
            <div className="skeleton-image shimmer"></div>
            <div className="skeleton-body">
              <div className="skeleton-line shimmer title"></div>
              <div className="skeleton-line shimmer category"></div>
              <div className="skeleton-footer">
                <div className="skeleton-line shimmer price"></div>
                <div className="skeleton-line shimmer btn"></div>
              </div>
            </div>
          </div>
        ))}
    </>
  );
};

export default LoadingSkeleton;
