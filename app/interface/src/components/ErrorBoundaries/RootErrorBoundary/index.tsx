import React, { ReactNode, useState, useEffect } from "react";
import Button from "../../UserInterfaceComponents/Button";

interface RootErrorBoundaryProps {
  children: ReactNode;
}

const RootErrorBoundary: React.FC<RootErrorBoundaryProps> = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Global unhandled error:", error);
      setHasError(true);
    };

    window.addEventListener("error", errorHandler);

    return () => {
      window.removeEventListener("error", errorHandler);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (hasError) {
    return (
      <div>
        <h2>Something went wrong</h2>
        <p>Sorry, something went wrong. Please try again.</p>
        <Button variant="text" onClick={handleRefresh}>
          Try Again
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default RootErrorBoundary;
