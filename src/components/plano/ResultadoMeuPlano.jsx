import { useMemo, useState } from "react";
import {
  ehTreinoCorrida,
  formatarDistancia,
  formatarDuracao,
  formatarPace,
  normalizarNomenclaturaTreino
} from "../../utils/planoTreino";

function CardTreinoDia({ treino }) {
  return (
    <article className="plano-ia-card">
      <div className="plano-ia-card-topo">
        <span>{treino.diaSemana}</span>
        <strong>{normalizarNomenclaturaTreino(treino.tipo)}</strong>
      </div>
      <h3>{normalizarNomenclaturaTreino(treino.titulo)}</h3>
      <p>{treino.descricao}</p>
      <dl>
        <div><dt>Distancia</dt><dd>{formatarDistancia(treino.distanciaKm)}</dd></div>
        <div><dt>Duracao</dt><dd>{formatarDuracao(treino.duracaoEstimada)}</dd></div>
        <div><dt>Pace</dt><dd>{formatarPace(treino.paceSugerido)}</dd></div>
      </dl>
      {treino.observacoes && <small>{treino.observacoes}</small>}
    </article>
  );
}

function ResultadoMeuPlano({ plano, carregando, onGerarNovamente }) {
  const [semanaAtiva, setSemanaAtiva] = useState(0);
  const semanas = useMemo(() => plano?.semanas ?? [], [plano]);
  const semanaSelecionada = semanas[semanaAtiva] ?? semanas[0];
  const treinosCorrida = useMemo(
    () => (semanaSelecionada?.treinos ?? []).filter(ehTreinoCorrida),
    [semanaSelecionada]
  );

  if (!plano) {
    return null;
  }

  return (
    <section className="plano-ia-resultado">
      <header className="plano-ia-resultado-cabecalho">
        <div>
          <span>MEU PLANO</span>
          <h2>{plano.titulo}</h2>
        </div>
        <div className="plano-ia-badges">
          <span>{plano.duracaoSemanas} semanas</span>
        </div>
      </header>

      <div className="plano-ia-resumo">
        <div>
          <span>Objetivo</span>
          <strong>{plano.objetivoPlano}</strong>
        </div>
        <div>
          <span>Duracao</span>
          <strong>{plano.duracaoSemanas} semanas</strong>
        </div>
      </div>

      {plano.resumo && (
        <p className="plano-ia-observacoes">{plano.resumo}</p>
      )}

      <div className="plano-ia-semanas-tabs" role="tablist" aria-label="Semanas do plano">
        {semanas.map((semana, indice) => (
          <button
            className={indice === semanaAtiva ? "plano-ia-semana-ativa" : ""}
            type="button"
            key={semana.numeroSemana}
            role="tab"
            aria-selected={indice === semanaAtiva}
            onClick={() => setSemanaAtiva(indice)}
          >
            Semana {semana.numeroSemana}
          </button>
        ))}
      </div>

      {semanaSelecionada && (
        <section className="plano-ia-semana">
          <header>
            <div>
              <span>Semana {semanaSelecionada.numeroSemana}</span>
              <h3>{semanaSelecionada.titulo}</h3>
            </div>
            {semanaSelecionada.foco && (
              <p><strong>Foco:</strong> {semanaSelecionada.foco}</p>
            )}
          </header>

          <div className="plano-ia-grid">
            {treinosCorrida.map((treino) => (
              <CardTreinoDia treino={treino} key={treino.diaSemana} />
            ))}
          </div>
        </section>
      )}

      <button
        className="coach-ia-gerar-novamente plano-ia-gerar-novamente"
        type="button"
        onClick={onGerarNovamente}
        disabled={carregando}
      >
        Gerar novo plano
      </button>
    </section>
  );
}

export default ResultadoMeuPlano;
