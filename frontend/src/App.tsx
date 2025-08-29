import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import MainPage from "./pages/Home";
import { UserProvider } from "./contexts/UserContext";

import "./App.css";
import { PlaceProvider } from "./contexts/PlaceContext";
import { SemesterProvider } from "./contexts/SemesterContext";
import LogBook from "./pages/LogBook";
import Activities from "./pages/Activities";
import LoginPage from "./pages/Login";
import Semesters from "./pages/Semesters";
import ProblemBehavior from "./pages/ProblemBehavior";
import Appreciations from "./pages/Appreciations";
import Account from "./pages/Account";
import Toilet from "./pages/Toilet";
import Shower from "./pages/Shower";

const App: React.FC = () => {
  return (
    <>
      <UserProvider>
        <PlaceProvider>
          <SemesterProvider>
            <Router>
              <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/semestri" element={<Semesters />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/diario" element={<LogBook />} />
                <Route
                  path="/partecipazione_attivita"
                  element={<Activities />}
                />
                <Route
                  path="/comportamenti_problema"
                  element={<ProblemBehavior />}
                />
                <Route path="/gradimenti" element={<Appreciations />} />
                <Route path="/account" element={<Account />} />
                <Route path="/bagno" element={<Toilet />} />
                <Route path="/doccia" element={<Shower />} />
              </Routes>
            </Router>
            <p className="watermark">CDD Le Grigne - Bellano / Primaluna</p>
          </SemesterProvider>
        </PlaceProvider>
      </UserProvider>
    </>
  );
};

export default App;
