import React from "react";
import LeftProps from "../types/LeftProps";
import { MdOutlineAccountCircle } from "react-icons/md";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useSemester } from "../contexts/SemesterContext";
import apiService from "../services/apiService";

const LeftBar: React.FC<LeftProps> = ({ entries }) => {
  const { user, setUser } = useUser();
  const { setSemesterString, setSemesterNumber } = useSemester();
  const navigate = useNavigate();

  const handleLogout = async (): Promise<void> => {
    const response = await apiService.logout();

    if (response.status === 401) {
      console.error("Unauthorized access - please log in.");
      navigate("/login");
      return;
    }

    if (response.error) {
      console.error("Error during logout:", response.error);
      return;
    }

    if (response.data) {
      setSemesterNumber(null); // Clear semester state
      setSemesterString(null); // Clear semester string state

      console.log("Logout successful");
      setUser(null); // Clear user state
      navigate("/login"); // Redirect to login page
    }
  };

  return (
    <div className="left-bar">
      <div className="account-div">
        <div>
          <MdOutlineAccountCircle
            style={{ fontSize: "2.5rem", marginRight: "1rem" }}
          />{" "}
          <span>{user ? `${user.name} ${user.surname}` : "Anonimo"}</span>
        </div>
        <p className="logout-word" onClick={handleLogout}>
          Logout
        </p>
        <p className="logout-word" onClick={() => navigate("/account")}>
          Account personale
        </p>
      </div>
      <div className="left-bar-entries">
        {entries.map((entry, index) => (
          <div
            key={index}
            className={`left-bar-entry ${entry.disabled ? "disabled" : ""}`}
            style={{
              color: !entry.disabled
                ? entry.color || "var(--accent-blue)"
                : "#888",
            }}
            onClick={entry.disabled ? undefined : entry.action}
            title={entry.title}
          >
            {entry.icon} {entry.title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftBar;
