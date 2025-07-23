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
}

const HomeButtons: React.FC<HomeButtonsProps> = ({
  buttons,
  name,
  surname,
}) => {
  const navigate = useNavigate();

  return (
    <div className="home-buttons-container">
      <h2>
        {name} {surname}
      </h2>
      <div className="home-buttons">
        {buttons.map((btn, idx) => (
          <button key={idx} onClick={() => navigate(btn.location)}>
            {btn.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomeButtons;
