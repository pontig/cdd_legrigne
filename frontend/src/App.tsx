import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import MainPage from "./pages/Home";
import { UserProvider } from "./contexts/UserContext";

import "./App.css";

const App: React.FC = () => {
  return (
    <>
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainPage />} />
          </Routes>
        </Router>
        <p className="watermark">CDD Le Grigne - Bellano / Primaluna</p>
      </UserProvider>
    </>
  );
};

export default App;
