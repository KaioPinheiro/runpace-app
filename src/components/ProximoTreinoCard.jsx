import {
  ehTreinoDeDescanso,
  obterDistanciaConsiderada,
} from "../utils/calculosTreino";

function formatarDataPlanejada(dataPlanejada) {
  if (!dataPlanejada) return "—";

  const [ano, mes, dia] = String(dataPlanejada)
    .split("T")[0]
    .split("-");

  if (!ano || !mes || !dia) return dataPlanejada;

  return `${dia}/${mes}/${ano}`;
}

function ProximoTreinoCard({ treino }) {
  if (!treino) {
    return (
      <section className="proximo-treino-card proximo-treino-vazio">
        <h2>🏃 Próximo Treino</h2>
        <p>Você não possui treinos pendentes no momento.</p>
      </section>
    );
  }

  const descanso = ehTreinoDeDescanso(treino);
  const paceAlvo = treino.paceAlvo;

  return (
    <section className="proximo-treino-card">
      <div className="proximo-treino-topo">
        <div>
          <span className="proximo-treino-label">🏃 Próximo Treino</span>
          <h2>{treino.titulo || treino.tipo}</h2>
        </div>
        <span className="proximo-treino-badge">PENDENTE</span>
      </div>

      <div className="proximo-treino-info">
        <p>
          <strong>🏷 Tipo</strong>
          <span>{treino.tipo || "—"}</span>
        </p>
        <p>
          <strong>📅 Data planejada</strong>
          <span>{formatarDataPlanejada(treino.dataPlanejada)}</span>
        </p>
        <p>
          <strong>📏 Distância</strong>
          <span>
            {descanso ? "—" : `${obterDistanciaConsiderada(treino)} km`}
          </span>
        </p>
        <p>
          <strong>⏱ Pace alvo</strong>
          <span>
            {descanso || !paceAlvo
              ? "—"
              : `${paceAlvo}${paceAlvo.includes("min/km") ? "" : " min/km"}`}
          </span>
        </p>
      </div>
    </section>
  );
}

export default ProximoTreinoCard;
