import { Routes, useLocation } from "react-router-dom";

const AnimatedRoutes = ({ children }) => {
  const location = useLocation();

  return (
    <div key={location.pathname} className="route-fade-in">
      <Routes location={location}>{children}</Routes>
    </div>
  );
};

export default AnimatedRoutes;