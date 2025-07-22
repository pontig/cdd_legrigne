import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import MainPage from "./pages/Home";

import "./App.css";

const App: React.FC = () => {

  return (
    <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
        </Routes>
    </Router>
  );
};

export default App;