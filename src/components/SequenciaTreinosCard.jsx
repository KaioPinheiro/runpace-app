import { ehTreinoDeDescanso } from "../utils/calculosTreino";

const umDiaEmMilissegundos = 24 * 60 * 60 * 1000;

function obterDataTreino(treino) {
  return String(
    treino.dataPlanejada ?? treino.dataTreino ?? treino.data ?? ""
  ).split("T")[0];
}

function converterDataParaUtc(data) {
  const [ano, mes, dia] = data.split("-").map(Number);

  if (!ano || !mes || !dia) return null;

  return Date.UTC(ano, mes - 1, dia);
}

function calcularSequencia(treinosConcluidos) {
  const datasUnicas = [
    ...new Set(
      treinosConcluidos
        .filter((treino) => !ehTreinoDeDescanso(treino))
        .map(obterDataTreino)
        .filter(Boolean)
    ),
  ]
    .map(converterDataParaUtc)
    .filter((data) => data !== null)
    .sort((a, b) => b - a);

  if (datasUnicas.length === 0) return 0;

  let sequencia = 1;

  for (let indice = 1; indice < datasUnicas.length; indice += 1) {
    const diferenca = datasUnicas[indice - 1] - datasUnicas[indice];

    if (diferenca !== umDiaEmMilissegundos) break;
    sequencia += 1;
  }

  return sequencia;
}

function SequenciaTreinosCard({ treinosConcluidos }) {
  const sequencia = calcularSequencia(treinosConcluidos);

  return (
    <section className="sequencia-treinos-card">
      <div className="sequencia-treinos-icone" aria-hidden="true">
        🔥
      </div>

      <div className="sequencia-treinos-conteudo">
        <h2>Sequência Atual</h2>

        {sequencia > 0 ? (
          <>
            <strong>
              {sequencia} {sequencia === 1 ? "dia" : "dias"}
            </strong>
            <p>
              Você está há {sequencia}{" "}
              {sequencia === 1 ? "dia mantendo" : "dias mantendo"} consistência.
            </p>
          </>
        ) : (
          <p>Comece sua sequência concluindo o primeiro treino.</p>
        )}
      </div>
    </section>
  );
}

export default SequenciaTreinosCard;
