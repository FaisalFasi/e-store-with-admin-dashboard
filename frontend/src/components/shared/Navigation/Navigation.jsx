import { useNavigate } from "react-router-dom";

const Navigation = ({ to, children, className, ...props }) => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    if (to) navigate(to);
  };

  return (
    <div
      {...props}
      className={`cursor-pointer ${className}`}
      onClick={handleNavigation}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleNavigation()}
    >
      {children}
    </div>
  );
};

export default Navigation;
