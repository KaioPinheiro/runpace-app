import { useEffect, useMemo, useState } from "react";
import {
  buscarTreinos,
  buscarWorkoutsDoUsuario,
} from "../services/api";
import {
  ehTreinoDeDescanso,
  obterDistanciaConsiderada,
} from "../utils/calculosTreino";

function obterDataBase(treino) {
  return treino.dataPlanejada ?? treino.dataTreino ?? treino.data;
}

function obterDataOrdenacao(treino) {
  return String(obterDataBase(treino) ?? "").split("T")[0];
}

function criarDataLocal(data) {
  const [ano, mes, dia] = String(data).split("T")[0].split("-").map(Number);

  if (!ano || !mes || !dia) return null;

  return new Date(ano, mes - 1, dia);
}

function formatarDataIsoLocal(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function obterInicioSemana(data) {
  const inicio = new Date(data);
  const diaSemana = inicio.getDay();
  const diasAteSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;

  inicio.setHours(0, 0, 0, 0);
  inicio.setDate(inicio.getDate() + diasAteSegunda);
  return inicio;
}

function adicionarDias(data, quantidade) {
  const novaData = new Date(data);
  novaData.setDate(novaData.getDate() + quantidade);
  return novaData;
}

function formatarDataCurta(data) {
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function obterRotuloSemana(inicio, inicioSemanaAtual) {
  const fim = adicionarDias(inicio, 6);
  const diferencaSemanas = Math.round(
    (inicio.getTime() - inicioSemanaAtual.getTime()) /
      (7 * 24 * 60 * 60 * 1000)
  );
  const periodo = `${formatarDataCurta(inicio)} a ${formatarDataCurta(fim)}`;

  if (diferencaSemanas === 0) return `Semana atual • ${periodo}`;
  if (diferencaSemanas === 1) return `Próxima semana • ${periodo}`;

  return `Semana de ${periodo}`;
}

function formatarData(data) {
  if (!data) return "Sem data";

  const dataLocal = criarDataLocal(data);
  if (!dataLocal) return data;

  const [ano, mes, dia] = String(data).split("T")[0].split("-");
  const diaDaSemana = dataLocal.toLocaleDateString("pt-BR", {
    weekday: "long",
  });
  const diaDaSemanaFormatado =
    diaDaSemana.charAt(0).toUpperCase() + diaDaSemana.slice(1);

  return `${dia}/${mes}/${ano} - ${diaDaSemanaFormatado}`;
}

function normalizarTreinoPendente(workout) {
  return {
    ...workout,
    status: "PENDENTE",
    dataCalendario: obterDataBase(workout),
  };
}

function normalizarTreinoConcluido(treino) {
  return {
    ...treino,
    status: "CONCLUIDO",
    dataCalendario: obterDataBase(treino),
    paceAlvo: treino.paceAlvo ?? treino.paceMedio,
  };
}

function Calendario() {
  const [treinos, setTreinos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const inicioSemanaAtual = useMemo(
    () => obterInicioSemana(new Date()),
    []
  );
  const [semanaSelecionada, setSemanaSelecionada] = useState(() =>
    formatarDataIsoLocal(obterInicioSemana(new Date()))
  );

  useEffect(() => {
    async function carregarCalendario() {
      try {
        setCarregando(true);
        setErro("");

        const [workoutsPendentes, treinosConcluidos] = await Promise.all([
          buscarWorkoutsDoUsuario(),
          buscarTreinos(),
        ]);

        setTreinos([
          ...workoutsPendentes.map(normalizarTreinoPendente),
          ...treinosConcluidos.map(normalizarTreinoConcluido),
        ]);
      } catch (error) {
        console.error("Erro ao carregar calendário", error);
        setErro("Não foi possível carregar o calendário de treinos.");
      } finally {
        setCarregando(false);
      }
    }

    carregarCalendario();
  }, []);

  const proximoTreinoPendenteId = useMemo(() => {
    const hoje = formatarDataIsoLocal(new Date());
    const pendentesOrdenados = treinos
      .filter((treino) => treino.status === "PENDENTE")
      .sort((a, b) =>
        obterDataOrdenacao(a).localeCompare(obterDataOrdenacao(b))
      );
    const proximoTreino =
      pendentesOrdenados.find(
        (treino) => obterDataOrdenacao(treino) >= hoje
      ) ?? pendentesOrdenados[0];

    return proximoTreino?.id;
  }, [treinos]);

  const semanasDisponiveis = useMemo(() => {
    const iniciosDosTreinos = treinos
      .map((treino) => criarDataLocal(obterDataOrdenacao(treino)))
      .filter(Boolean)
      .map(obterInicioSemana);
    const primeiroInicio = iniciosDosTreinos.length
      ? new Date(
          Math.min(
            inicioSemanaAtual.getTime(),
            ...iniciosDosTreinos.map((data) => data.getTime())
          )
        )
      : inicioSemanaAtual;
    const ultimoInicio = iniciosDosTreinos.length
      ? new Date(
          Math.max(
            inicioSemanaAtual.getTime(),
            ...iniciosDosTreinos.map((data) => data.getTime())
          )
        )
      : inicioSemanaAtual;
    const semanas = [];

    for (
      let inicio = new Date(primeiroInicio);
      inicio <= ultimoInicio;
      inicio = adicionarDias(inicio, 7)
    ) {
      semanas.push({
        valor: formatarDataIsoLocal(inicio),
        inicio: new Date(inicio),
        rotulo: obterRotuloSemana(inicio, inicioSemanaAtual),
      });
    }

    return semanas;
  }, [inicioSemanaAtual, treinos]);

  const indiceEncontrado = semanasDisponiveis.findIndex(
    (semana) => semana.valor === semanaSelecionada
  );
  const indiceSemanaSelecionada = indiceEncontrado >= 0 ? indiceEncontrado : 0;
  const semanaAtualSelecionada =
    semanasDisponiveis[indiceSemanaSelecionada];

  const treinosDaSemana = useMemo(() => {
    if (!semanaAtualSelecionada) return [];

    const inicio = semanaAtualSelecionada.valor;
    const fim = formatarDataIsoLocal(
      adicionarDias(semanaAtualSelecionada.inicio, 6)
    );

    return treinos.filter((treino) => {
      const data = obterDataOrdenacao(treino);
      return data >= inicio && data <= fim;
    });
  }, [semanaAtualSelecionada, treinos]);

  const treinosPorData = useMemo(() => {
    return [...treinosDaSemana]
      .sort((a, b) =>
        obterDataOrdenacao(a).localeCompare(obterDataOrdenacao(b))
      )
      .reduce((datas, treino) => {
        const data = obterDataOrdenacao(treino) || "sem-data";

        if (!datas[data]) datas[data] = [];
        datas[data].push(treino);
        return datas;
      }, {});
  }, [treinosDaSemana]);

  function navegarSemana(direcao) {
    const novaSemana =
      semanasDisponiveis[indiceSemanaSelecionada + direcao];

    if (novaSemana) setSemanaSelecionada(novaSemana.valor);
  }

  return (
    <section className="calendario">
      <header className="calendario-header">
        <h1>📅 Calendário de Treinos</h1>
      </header>

      {erro && <p className="mensagem-erro">{erro}</p>}

      {carregando ? (
        <div className="calendario-empty">Carregando calendário...</div>
      ) : treinos.length === 0 ? (
        <div className="calendario-empty">
          <h3>📋 Nenhum treino encontrado</h3>
          <p>Crie um treino para começar a montar seu calendário.</p>
        </div>
      ) : (
        <>
          <section className="calendario-filtro">
            <button
              type="button"
              onClick={() => navegarSemana(-1)}
              disabled={indiceSemanaSelecionada === 0}
              aria-label="Visualizar semana anterior"
            >
              ‹
            </button>

            <label htmlFor="filtro-semana">
              <span>Visualizar semana</span>
              <select
                id="filtro-semana"
                value={semanaAtualSelecionada?.valor ?? ""}
                onChange={(event) => setSemanaSelecionada(event.target.value)}
              >
                {semanasDisponiveis.map((semana) => (
                  <option key={semana.valor} value={semana.valor}>
                    {semana.rotulo}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => navegarSemana(1)}
              disabled={
                indiceSemanaSelecionada === semanasDisponiveis.length - 1
              }
              aria-label="Visualizar próxima semana"
            >
              ›
            </button>
          </section>

          <div className="calendario-resumo-semana">
            <strong>{semanaAtualSelecionada?.rotulo}</strong>
            <span>
              {treinosDaSemana.length}{" "}
              {treinosDaSemana.length === 1 ? "treino" : "treinos"}
            </span>
          </div>

          {treinosDaSemana.length === 0 ? (
            <div className="calendario-empty">
              <h3>📅 Nenhum treino nesta semana</h3>
              <p>Use o filtro para visualizar outra semana do seu plano.</p>
            </div>
          ) : (
            <div className="calendario-datas">
              {Object.entries(treinosPorData).map(([data, treinosDaData]) => (
                <article className="calendario-dia" key={data}>
                  <h2>{formatarData(data)}</h2>

                  <div className="calendario-cards">
                    {treinosDaData.map((treino) => {
                      const descanso = ehTreinoDeDescanso(treino);
                      const statusConcluido = treino.status === "CONCLUIDO";
                      const proximoTreino =
                        treino.status === "PENDENTE" &&
                        treino.id === proximoTreinoPendenteId;

                      return (
                        <div
                          className={`calendario-card ${
                            statusConcluido
                              ? "calendario-card-concluido"
                              : "calendario-card-pendente"
                          }`}
                          key={`${treino.status}-${treino.id}`}
                        >
                          <div className="calendario-card-topo">
                            <h3>{treino.titulo || treino.tipo}</h3>
                            <span
                              className={`calendario-status ${
                                statusConcluido
                                  ? "calendario-status-concluido"
                                  : "calendario-status-pendente"
                              }`}
                            >
                              {statusConcluido ? "CONCLUÍDO" : "PENDENTE"}
                            </span>
                          </div>

                          {proximoTreino && (
                            <span className="calendario-proximo">
                              Próximo treino
                            </span>
                          )}

                          <div className="calendario-info">
                            <p>
                              <strong>Tipo</strong>
                              {treino.tipo || "—"}
                            </p>
                            <p>
                              <strong>Distância</strong>
                              {descanso
                                ? "—"
                                : `${obterDistanciaConsiderada(treino)} km`}
                            </p>
                            <p>
                              <strong>Pace alvo</strong>
                              {descanso ? "—" : treino.paceAlvo || "—"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Calendario;
