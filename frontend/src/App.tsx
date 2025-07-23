import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import MainPage from "./pages/Home";
import { UserProvider } from "./contexts/UserContext";

import "./App.css";
import { PlaceProvider } from "./contexts/PlaceContext";
import LogBook from "./pages/LogBook";

const App: React.FC = () => {
  return (
    <>
      <UserProvider>
        <PlaceProvider>
          <Router>
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/diario" element={<LogBook />} />
            </Routes>
          </Router>
          <p className="watermark">CDD Le Grigne - Bellano / Primaluna</p>
        </PlaceProvider>
      </UserProvider>
    </>
  );
};

export default App;
