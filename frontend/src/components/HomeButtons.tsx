import React from "react";
import { useNavigate } from "react-router-dom";

interface ButtonConfig {
  title: string;
  location: string;
}

interface HomeButtonsProps {
  buttons: ButtonConfig[];
  name: string;
  surname: string;
  guestId: number;
}

const HomeButtons: React.FC<HomeButtonsProps> = ({
  buttons,
  name,
  surname,
  guestId
}) => {
  const navigate = useNavigate();

  return (
    <div className="home-buttons-container">
      <h2>
        {name} {surname}
      </h2>
      <div className="home-buttons">
        {buttons.map((btn, idx) => (
            <button
            key={idx}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              navigate(btn.location, { state: { guestId: guestId, name: name, surname: surname } })
            }}
            >
            {btn.title}
            </button>
        ))}
      </div>
    </div>
  );
};

export default HomeButtons;
