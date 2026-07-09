import {
  ehTreinoDeDescanso,
  formatarDuracao,
  obterDistanciaConsiderada,
} from "../utils/calculosTreino";

function CardTreino({
  workout,
  titulo,
  data,
  tipo,
  distanciaKm,
  tempoMinutos,
  tempoFormatado,
  pace,
  descricao,
  observacoes,
  id,
  onConcluir,
  onCancelar,
  onEditar,
  onExcluir,
  statusLabel,
}) {
  const treino = workout || {};
  const idTreino = id ?? treino.id;
  const tituloTreino = titulo ?? treino.titulo;
  const dataTreino = data ?? treino.dataTreino;
  const tipoTreino = tipo ?? treino.tipo;
  const descanso = ehTreinoDeDescanso({ tipo: tipoTreino });
  const distanciaTreino = obterDistanciaConsiderada({
    tipo: tipoTreino,
    distanciaKm: distanciaKm ?? treino.distanciaKm,
  });
  const distanciaExibida = descanso ? "—" : `${distanciaTreino} km`;
  const tempoTreino = tempoMinutos ?? treino.tempoMinutos;
  const tempoExibido = descanso
    ? "—"
    : tempoFormatado ??
      (tempoTreino > 0 ? formatarDuracao(Number(tempoTreino) * 60) : "");
  const paceTreino = descanso
    ? "—"
    : pace ?? treino.paceAlvo ?? treino.paceMedio;
  const paceExibido = paceTreino
    ? `${paceTreino}${paceTreino === "—" || String(paceTreino).includes("min/km") ? "" : " min/km"}`
    : "";
  const descricaoTreino = descricao ?? treino.descricao;
  const observacoesTreino = observacoes ?? treino.observacoes;

  return (
    <article className="card-treino">
      <div className="card-topo">
        <h2>{tituloTreino || tipoTreino}</h2>
        <span>#{idTreino}</span>
      </div>

      {statusLabel && (
        <span className="badge-concluido">
          {statusLabel}
        </span>
      )}

      <div className="info-grid">
        {dataTreino && (
          <p>
            <strong>Data</strong>
            {dataTreino}
          </p>
        )}

        {tipoTreino && (
          <p>
            <strong>Tipo</strong>
            {tipoTreino}
          </p>
        )}

        {(distanciaTreino > 0 || descanso) && (
          <p>
            <strong>Distância</strong>
            {distanciaExibida}
          </p>
        )}

        {tempoExibido && (
          <p>
            <strong>Tempo</strong>
            {tempoExibido}
          </p>
        )}

        {paceExibido && (
          <p>
            <strong>Pace</strong>
            {paceExibido}
          </p>
        )}
      </div>

      {descricaoTreino && (
        <p className="observacao">
          {descricaoTreino}
        </p>
      )}

      {observacoesTreino && (
        <p className="observacao">
          {observacoesTreino}
        </p>
      )}

      {(onConcluir || onCancelar) && (
        <div className="card-acoes card-acoes-planejado">
          {onConcluir && (
            <button
              className="btn-concluir"
              onClick={() => onConcluir(idTreino)}
            >
              Concluir Treino
            </button>
          )}

          {onEditar && (
            <button
              className="btn-editar"
              onClick={onEditar}
            >
              Editar Treino
            </button>
          )}

          {onCancelar && (
            <button
              className="btn-deletar btn-cancelar-treino"
              onClick={() => onCancelar(idTreino)}
            >
              Cancelar Treino
            </button>
          )}
        </div>
      )}

      {!onConcluir && !onCancelar && (onEditar || onExcluir) && (
        <div className="card-acoes">
          {onEditar && (
            <button
              className="btn-editar"
              onClick={onEditar}
            >
              Editar Treino
            </button>
          )}

          {onExcluir && (
            <button
              className="btn-deletar"
              onClick={onExcluir}
            >
              Excluir Treino
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export default CardTreino;
