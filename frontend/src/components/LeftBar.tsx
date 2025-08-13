import React from "react";
import LeftProps from "../types/LeftProps";
import { MdOutlineAccountCircle } from "react-icons/md";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useSemester } from "../contexts/SemesterContext";

const LeftBar: React.FC<LeftProps> = ({ entries }) => {

  // TODO: Refactor API calls 

  const api = {
    baseUrl: "http://localhost:5000",

    async handleLogout(): Promise<void> {
      try {
        const response = await fetch(`${api.baseUrl}/logout`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Logout failed");
        }

        setSemesterNumber(null); // Clear semester state
        setSemesterString(null); // Clear semester string state

        console.log("Logout successful");
        setUser(null); // Clear user state
        navigate("/login"); // Redirect to login page
      } catch (error) {
        console.error("Error during logout:", error);
      }
    },
  };

  const { user, setUser } = useUser();
    const {
      semesterString,
      semesterNumber,
      setSemesterString,
      setSemesterNumber,
    } = useSemester();
  const navigate = useNavigate();

  return (
    <div className="left-bar">
      <div className="account-div">
        <div>
          <MdOutlineAccountCircle
            style={{ fontSize: "2.5rem", marginRight: "1rem" }}
          />{" "}
          <span>
            {user ? `${user.name} ${user.surname}` : "Anonimo"}
          </span>
        </div>
        <p className="logout-word" onClick={api.handleLogout}>Logout</p>
        <p className="logout-word" onClick={() => navigate('/account')}>Gestisci account</p>
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
