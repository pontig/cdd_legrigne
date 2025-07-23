import React from "react";
import LeftProps from "../types/LeftProps";
import { MdOutlineAccountCircle } from "react-icons/md";
import { useUser } from "../contexts/UserContext";

const LeftBar: React.FC<LeftProps> = ({ entries }) => {

  const { user, setUser } = useUser();

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
        <p className="logout-word">Logout</p>
        <p className="logout-word">Cambia password</p>
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
