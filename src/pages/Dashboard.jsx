import { useEffect, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import GraficoTreinos from "../components/GraficoTreinos";
import MinhaSemana from "../components/MinhaSemana";
import ProximoTreinoCard from "../components/ProximoTreinoCard";
import SequenciaTreinosCard from "../components/SequenciaTreinosCard";
import {buscarTreinos as buscarTreinosApi,buscarWorkoutsDoUsuario} from "../services/api";
import {
  calcularTempoTreinoSegundos,
  ehTreinoDeDescanso,
  formatarDuracaoTotal,
  obterDistanciaConsiderada,
} from "../utils/calculosTreino";

function formatarDataTreino(dataTreino) {
  if (!dataTreino) return "";

  const [ano, mes, dia] = dataTreino.split("T")[0].split("-");
  return `${dia}/${mes}/${ano}`;
}

function Dashboard() {
  const [treinos, setTreinos] = useState([]);
  const [workoutsPendentes, setWorkoutsPendentes] = useState([]);

  useEffect(() => {
    async function carregarDados() {
      try {
        const treinosData = await buscarTreinosApi();
        const pendentesData = await buscarWorkoutsDoUsuario();

        setTreinos(treinosData);
        setWorkoutsPendentes(pendentesData);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard", error);
      }
    }

    carregarDados();
  }, []);

  const totalTreinos = treinos.length;
  const totalPendentes = workoutsPendentes.length;
  const totalGeral = totalTreinos + totalPendentes;

  const percentualConclusao =
    totalGeral === 0
      ? 0
      : Math.round((totalTreinos / totalGeral) * 100);

  const totalKmPlanejados = workoutsPendentes.reduce(
  (total, workout) => total + obterDistanciaConsiderada(workout),
  0
);

  const totalKm = treinos.reduce(
    (total, treino) => total + obterDistanciaConsiderada(treino),
    0
  );

  const totalTempoSegundos = treinos.reduce(
    (total, treino) =>
      total + (calcularTempoTreinoSegundos(treino) ?? 0),
    0
  );

  const dadosGrafico = treinos
    .filter((treino) => !ehTreinoDeDescanso(treino))
    .map((treino) => ({
      nome: treino.tipo,
      distancia: obterDistanciaConsiderada(treino),
    }));

  const treinosOrdenados = [...treinos].sort((a, b) =>
    String(a.dataTreino).localeCompare(String(b.dataTreino))
  );

  const proximoTreino =
    [...workoutsPendentes]
      .filter(
        (workout) =>
          String(workout.status ?? "PENDENTE").toUpperCase() === "PENDENTE"
      )
      .sort((a, b) =>
        String(a.dataPlanejada ?? "").localeCompare(
          String(b.dataPlanejada ?? "")
        )
      )[0] ?? null;

  const treinosDaSemana = [
    ...workoutsPendentes.map((workout) => ({
      ...workout,
      status: "PENDENTE",
      dataSemana: workout.dataPlanejada,
    })),
    ...treinos.map((treino) => ({
      ...treino,
      status: "CONCLUIDO",
      dataSemana: treino.dataPlanejada ?? treino.dataTreino,
    })),
  ];

  return (
    <>
      <section className="dashboard">
        <DashboardCard titulo="🏃 Concluídos" valor={totalTreinos} />
        <DashboardCard titulo="📋 Pendentes" valor={totalPendentes} />
        <DashboardCard titulo="📏 Km Concluídos" valor={totalKm.toFixed(1)} />
        <DashboardCard titulo="🎯 Km Pendentes" valor={totalKmPlanejados.toFixed(1)}/>
        <DashboardCard
          titulo="⏱️ Tempo Total"
          valor={formatarDuracaoTotal(totalTempoSegundos)}
        />
        <DashboardCard titulo="📈 Progresso" valor={`${percentualConclusao}%`}
/>
      </section>

      <ProximoTreinoCard treino={proximoTreino} />

      <MinhaSemana treinos={treinosDaSemana} />

      <SequenciaTreinosCard treinosConcluidos={treinos} />

      <section className="progresso-container">
        <h2>📈 Progresso dos Treinos</h2>

        <div className="barra-progresso">
          <div
          className="barra-progresso-preenchida"
          style={{ width: `${percentualConclusao}%` }}
          />
        </div>

        <p>{totalTreinos} de {totalGeral} treinos concluídos</p>

        {totalGeral > 0 && percentualConclusao === 100 && (
          <p className="mensagem-concluido">
            🎉 Todos os treinos foram concluídos!
          </p>
        )}
      </section>

      <section className="treinos-realizados">
        <h2>📈 Treinos Realizados</h2>

        {treinosOrdenados.length === 0 ? (
          <p className="sem-treinos-realizados">
            Nenhum treino realizado ainda.
          </p>
        ) : (
          <div className="lista-treinos-realizados">
            {treinosOrdenados.map((treino) => (
              <article className="treino-realizado-item" key={treino.id}>
                <div>
                  <strong>Data</strong>
                  <span>{formatarDataTreino(treino.dataTreino)}</span>
                </div>
                <div>
                  <strong>Treino</strong>
                  <span>{treino.tipo}</span>
                </div>
                <div>
                  <strong>Km</strong>
                  <span>
                    {ehTreinoDeDescanso(treino)
                      ? "—"
                      : `${obterDistanciaConsiderada(treino)} km`}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <GraficoTreinos dados={dadosGrafico} />
    </>
  );
}

export default Dashboard;
