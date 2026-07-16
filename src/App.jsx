import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Historico from "./pages/Historico";
import MeusTreinos from "./pages/MeusTreinos";
import Calendario from "./pages/Calendario";
import GerarTreinoIA from "./pages/GerarTreinoIA";
import MeuPlano from "./pages/MeuPlano";
import Login from "./pages/Login";

import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  function atualizarToken() {
    setToken(localStorage.getItem("token"));
  }

  return (
    <BrowserRouter>
      <main className="container">
        <Navbar atualizarToken={atualizarToken} />

        <Routes>
          <Route
            path="/"
            element={<Navigate to="/meu-plano" replace />}
          />

          <Route
            path="/meu-plano"
            element={<MeuPlano />}
          />

          <Route
            path="/meus-treinos"
            element={
              token
                ? <MeusTreinos />
                : <Login atualizarToken={atualizarToken} />
            }
          />

          <Route
            path="/dashboard"
            element={
              token
                ? <Dashboard />
                : <Login atualizarToken={atualizarToken} />
            }
          />

          <Route
            path="/historico"
            element={
              token
                ? <Historico />
                : <Login atualizarToken={atualizarToken} />
            }
          />

          <Route
            path="/calendario"
            element={
              token
                ? <Calendario />
                : <Login atualizarToken={atualizarToken} />
            }
          />

          <Route
            path="/coach-ia"
            element={
              token
                ? <GerarTreinoIA />
                : <Login atualizarToken={atualizarToken} />
            }
          />

          <Route
            path="/plano-semanal-ia"
            element={<Navigate to="/meu-plano" replace />}
          />

          <Route
            path="/login"
            element={<Login atualizarToken={atualizarToken} />}
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
