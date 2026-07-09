import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ehTreinoDeDescanso,
  obterDistanciaConsiderada,
} from "../utils/calculosTreino";

function formatarData(dataPlanejada) {
  if (!dataPlanejada) return "—";

  const [ano, mes, dia] = dataPlanejada.split("T")[0].split("-");
  return `${dia}/${mes}/${ano}`;
}

function TreinoConcluidoModal({
  isOpen,
  onClose,
  treino,
  progressoAtual,
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return undefined;

    function fecharComEscape(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", fecharComEscape);
    return () => document.removeEventListener("keydown", fecharComEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !treino) return null;

  const descanso = ehTreinoDeDescanso(treino);
  const distancia = descanso
    ? "—"
    : `${obterDistanciaConsiderada(treino)} km`;
  const paceAlvo = treino.paceAlvo;
  const pace =
    descanso || !paceAlvo
      ? "—"
      : `${paceAlvo}${paceAlvo.includes("min/km") ? "" : " min/km"}`;

  function irParaDashboard() {
    onClose();
    navigate("/");
  }

  return (
    <div
      className="modal-conclusao-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="modal-conclusao"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-conclusao"
      >
        <div className="modal-conclusao-icone" aria-hidden="true">
          ✓
        </div>

        <h2 id="titulo-modal-conclusao">
          🎉 Treino concluído com sucesso!
        </h2>

        <div className="modal-conclusao-detalhes">
          <p>
            <span>🏃 Título do treino</span>
            <strong>{treino.titulo || treino.tipo}</strong>
          </p>
          <p>
            <span>📏 Distância</span>
            <strong>{distancia}</strong>
          </p>
          <p>
            <span>⏱ Pace alvo</span>
            <strong>{pace}</strong>
          </p>
          <p>
            <span>📅 Data planejada</span>
            <strong>{formatarData(treino.dataPlanejada)}</strong>
          </p>
        </div>

        <div className="modal-conclusao-progresso">
          <span>📈 Progresso atual do plano</span>
          <strong>
            Você concluiu {progressoAtual.concluidos} de{" "}
            {progressoAtual.total} treinos.
          </strong>
        </div>

        <div className="modal-conclusao-acoes">
          <button type="button" onClick={irParaDashboard}>
            Ver Dashboard
          </button>
          <button
            type="button"
            className="modal-conclusao-fechar"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </section>
    </div>
  );
}

export default TreinoConcluidoModal;
