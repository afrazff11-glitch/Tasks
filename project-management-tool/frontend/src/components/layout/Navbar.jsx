import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { Button } from "../ui/Button";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <Link to="/dashboard" className="navbar__brand">
        <span className="navbar__mark">PMT</span>
        <span>Project Management Tool</span>
      </Link>

      <div className="navbar__actions">
        <div className="navbar__user">
          <strong>{user?.name || "Workspace"}</strong>
          <span>{user?.email || "Collaborative planning"}</span>
        </div>
        <Button variant="ghost" onClick={logout} type="button">
          Log out
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
