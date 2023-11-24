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
    window.location.pathname = "/";
  };

  if (hasError) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-8">
        <h1 className="text-5xl">😧</h1>
        <h2 className="text-3xl">Oh snap! Something went wrong!</h2>
        <p>
          Sorry, something went wrong. If this keeps happening over and over
          again, please contact us.
        </p>
        <Button variant="primary" onClick={handleRefresh}>
          Lets start all over again!
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default RootErrorBoundary;
