import { useEffect, useState } from "react";
import CardTreino from "../components/CardTreino";
import TreinoConcluidoModal from "../components/TreinoConcluidoModal";
import {
  buscarTreinos,
  buscarWorkoutsPendentes,
  cancelarWorkout,
  concluirWorkout,
  criarWorkout,
  editarWorkout,
} from "../services/api";
import { formatarTempoTreino } from "../utils/calculosTreino";

const formularioInicial = {
  titulo: "",
  tipo: "",
  descricao: "",
  dataPlanejada: "",
  distanciaKm: "",
  paceAlvo: "",
  observacoes: "",
};

const diasDaSemana = [
  "DOMINGO",
  "SEGUNDA",
  "TERCA",
  "QUARTA",
  "QUINTA",
  "SEXTA",
  "SABADO",
];

function obterDiaSemana(dataPlanejada) {
  const [ano, mes, dia] = dataPlanejada.split("-").map(Number);
  return diasDaSemana[new Date(ano, mes - 1, dia).getDay()];
}

function formatarDataPlanejada(dataPlanejada) {
  if (!dataPlanejada) return undefined;

  const [ano, mes, dia] = dataPlanejada.split("-");
  return `${dia}/${mes}/${ano}`;
}

function MeusTreinos() {
  const [workouts, setWorkouts] = useState([]);
  const [treinosConcluidos, setTreinosConcluidos] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");
  const [workoutEmEdicaoId, setWorkoutEmEdicaoId] = useState(null);
  const [treinoConcluidoModal, setTreinoConcluidoModal] = useState(null);
  const [progressoAposConclusao, setProgressoAposConclusao] = useState({
    concluidos: 0,
    total: 0,
  });
  const tempoCalculado = formatarTempoTreino({
    tipo: formulario.tipo,
    distanciaKm: formulario.distanciaKm,
    paceAlvo: formulario.paceAlvo,
  });
  const descansoSelecionado = formulario.tipo === "Descanso";
  const workoutPendenteNaData = workouts.find(
    (workout) =>
      workout.id !== workoutEmEdicaoId &&
      workout.dataPlanejada?.split("T")[0] === formulario.dataPlanejada
  );
  const treinoConcluidoNaData = treinosConcluidos.find(
    (treino) =>
      treino.dataTreino?.split("T")[0] === formulario.dataPlanejada
  );
  const workoutNaDataSelecionada =
    workoutPendenteNaData ??
    (treinoConcluidoNaData
      ? { titulo: treinoConcluidoNaData.tipo }
      : null);

  function mostrarMensagem(texto, tipo) {
    setMensagem(texto);
    setTipoMensagem(tipo);
    setTimeout(() => {
      setMensagem("");
      setTipoMensagem("");
    }, 3000);
  }

  useEffect(() => {
    carregarWorkouts();
  }, []);

  async function carregarWorkouts() {
    try {
      const [pendentes, concluidos] = await Promise.all([
        buscarWorkoutsPendentes(),
        buscarTreinos(),
      ]);
      setWorkouts(pendentes);
      setTreinosConcluidos(concluidos);
      setErro("");
    } catch (error) {
      console.error("Erro ao buscar workouts", error);
      setErro("Nao foi possivel carregar seus treinos.");
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormulario((formularioAtual) => {
      if (name === "tipo" && value === "Descanso") {
        return {
          ...formularioAtual,
          tipo: value,
          distanciaKm: "",
          paceAlvo: "",
        };
      }

      if (name === "tipo" && formularioAtual.tipo === "Descanso") {
        return {
          ...formularioAtual,
          tipo: value,
          distanciaKm: "",
          paceAlvo: "",
        };
      }

      return {
        ...formularioAtual,
        [name]: value,
      };
    });
  }

  async function handleSalvarWorkout(event) {
    event.preventDefault();

    if (workoutNaDataSelecionada) {
      mostrarMensagem(
        `Já existe o treino "${workoutNaDataSelecionada.titulo}" nesta data.`,
        "erro"
      );
      return;
    }

    setSalvando(true);

    try {
      const distanciaKm = descansoSelecionado
        ? 0.1
        : Number(formulario.distanciaKm);
      const dadosWorkout = {
        titulo: formulario.titulo,
        tipo: formulario.tipo,
        descricao: formulario.descricao,
        diaSemana: obterDiaSemana(formulario.dataPlanejada),
        dataPlanejada: formulario.dataPlanejada,
        distanciaKm,
        paceAlvo: descansoSelecionado ? "" : formulario.paceAlvo,
        observacoes: formulario.observacoes,
        trainingPlanId: 1,
      };

      if (workoutEmEdicaoId) {
        await editarWorkout(workoutEmEdicaoId, dadosWorkout);
      } else {
        await criarWorkout(dadosWorkout);
      }

      setFormulario(formularioInicial);
      setWorkoutEmEdicaoId(null);
      await carregarWorkouts();
      mostrarMensagem(
        workoutEmEdicaoId
          ? "Treino atualizado com sucesso!"
          : "Treino criado com sucesso!",
        "sucesso"
      );
    } catch (error) {
      console.error("Erro ao salvar workout", error);
      mostrarMensagem("Erro ao salvar treino.", "erro");
    } finally {
      setSalvando(false);
    }
  }

  function handleAbrirEdicao(workout) {
    const descanso = workout.tipo === "Descanso";

    setWorkoutEmEdicaoId(workout.id);
    setFormulario({
      titulo: workout.titulo ?? "",
      tipo: workout.tipo ?? "",
      descricao: workout.descricao ?? "",
      dataPlanejada: workout.dataPlanejada?.split("T")[0] ?? "",
      distanciaKm: descanso ? "" : workout.distanciaKm ?? "",
      paceAlvo: descanso ? "" : workout.paceAlvo ?? "",
      observacoes: workout.observacoes ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelarEdicao() {
    setWorkoutEmEdicaoId(null);
    setFormulario(formularioInicial);
  }

  async function handleConcluirWorkout(id) {
    const treinoConcluido = workouts.find((workout) => workout.id === id);

    const confirmar = window.confirm(
      "Tem certeza que deseja concluir este treino?"
    );

    if (!confirmar) {
      return;
    }

    try {
      const totalTreinos = treinosConcluidos.length + workouts.length;

      await concluirWorkout(id);
      await carregarWorkouts();

      if (treinoConcluido) {
        setTreinoConcluidoModal(treinoConcluido);
        setProgressoAposConclusao({
          concluidos: treinosConcluidos.length + 1,
          total: totalTreinos,
        });
      }

      mostrarMensagem(
      "Treino concluido com sucesso!",
      "sucesso"
    );
  }   catch (error) {
      console.error(error);

      mostrarMensagem(
      "Erro ao concluir treino.",
      "erro"
    );
  }
}

  async function handleCancelarWorkout(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja cancelar este treino?"
    );

    if (!confirmar) return;

    try {
      await cancelarWorkout(id);
      setWorkouts((workoutsAtuais) =>
        workoutsAtuais.filter((workout) => workout.id !== id)
      );
      mostrarMensagem("Treino cancelado com sucesso!", "sucesso");
    } catch (error) {
      console.error("Erro ao cancelar treino", error);
      mostrarMensagem("Erro ao cancelar treino.", "erro");
    }
  }

  return (
    <section className="meus-treinos">
      <h2>📋 Meus Treinos do Plano</h2>

      <form className="form-treino" onSubmit={handleSalvarWorkout}>
        <div className="campo-formulario">
          <label htmlFor="titulo">
            Título <span className="campo-obrigatorio">*</span>
          </label>
          <input
            id="titulo"
            name="titulo"
            value={formulario.titulo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="campo-formulario">
          <label htmlFor="tipo">
            Tipo <span className="campo-obrigatorio">*</span>
          </label>
          <select
            id="tipo"
            name="tipo"
            value={formulario.tipo}
            onChange={handleChange}
            required
          >
            <option value="">Selecione o tipo</option>
            <option value="Rodagem">Rodagem</option>
            <option value="Tiro">Tiro</option>
            <option value="Longão">Longão</option>
            <option value="Regenerativo">Regenerativo</option>
            <option value="Ritmo">Ritmo</option>
            <option value="Descanso">Descanso</option>
          </select>
        </div>

        <div className="campo-formulario campo-formulario-largo">
          <label htmlFor="descricao">
            Descrição <span className="campo-obrigatorio">*</span>
          </label>
          <textarea
            id="descricao"
            name="descricao"
            value={formulario.descricao}
            onChange={handleChange}
            required
          />
        </div>

        <div className="campo-formulario">
          <label htmlFor="dataPlanejada">
            Data Planejada <span className="campo-obrigatorio">*</span>
          </label>
          <input
            id="dataPlanejada"
            name="dataPlanejada"
            type="date"
            value={formulario.dataPlanejada}
            onChange={handleChange}
            required
          />
          {workoutNaDataSelecionada && (
            <span className="aviso-data-conflitante">
              Já existe o treino “{workoutNaDataSelecionada.titulo}” nesta data.
            </span>
          )}
        </div>

        <div className="campo-formulario">
          <label htmlFor="distanciaKm">
            Distância (Km) <span className="campo-obrigatorio">*</span>
          </label>
          <input
            id="distanciaKm"
            name="distanciaKm"
            type="number"
            min={descansoSelecionado ? "0" : "0.1"}
            step="0.1"
            value={formulario.distanciaKm}
            onChange={handleChange}
            placeholder={descansoSelecionado ? "Não se aplica" : ""}
            disabled={descansoSelecionado}
            required
          />
        </div>

        <div className="campo-formulario">
          <label htmlFor="paceAlvo">
            Pace Alvo <span className="campo-obrigatorio">*</span>
          </label>
          <input
            id="paceAlvo"
            name="paceAlvo"
            value={formulario.paceAlvo}
            onChange={handleChange}
            placeholder={descansoSelecionado ? "Não se aplica" : "Ex.: 5:30"}
            disabled={descansoSelecionado}
            required
          />
        </div>

        <div className="campo-formulario">
          <label htmlFor="tempoCalculado">Tempo</label>
          <input
            id="tempoCalculado"
            value={descansoSelecionado ? "" : tempoCalculado}
            placeholder={
              descansoSelecionado
                ? "Não se aplica"
                : "Preenchido automaticamente"
            }
            readOnly
          />
        </div>

        <div className="campo-formulario campo-formulario-largo">
          <label htmlFor="observacoes">Observações</label>
          <textarea
            id="observacoes"
            name="observacoes"
            value={formulario.observacoes}
            onChange={handleChange}
          />
        </div>

        <div className="acoes-form-edicao">
          <button
            type="submit"
            disabled={salvando || Boolean(workoutNaDataSelecionada)}
          >
            {salvando
              ? "Salvando..."
              : workoutEmEdicaoId
                ? "Salvar Alterações"
                : "Criar Treino"}
          </button>

          {workoutEmEdicaoId && (
            <button
              type="button"
              className="btn-cancelar"
              onClick={handleCancelarEdicao}
            >
              Cancelar Edição
            </button>
          )}
        </div>
      </form>

      {erro && <p className="mensagem-erro">{erro}</p>}

      {mensagem && (
         <div
          className={
            tipoMensagem === "erro"
              ? "mensagem-erro"
              : "mensagem-sucesso"
          }
        >
      {mensagem}
      </div>
      )}


      <div className="grid-treinos">
        {workouts.length === 0 ? (
          <div className="sem-treinos">
            <h3>🎉 Todos os treinos foram concluídos!</h3>
            <p>
              Você concluiu todos os treinos do seu plano.
              Consulte o Histórico para visualizar seus treinos finalizados.
            </p>
          </div>
        ) : (
          workouts.map((workout) => (
            <CardTreino
              key={workout.id}
              workout={workout}
              data={formatarDataPlanejada(workout.dataPlanejada)}
              onEditar={() => handleAbrirEdicao(workout)}
              onConcluir={handleConcluirWorkout}
              onCancelar={handleCancelarWorkout}
            />
          ))
        )}
      </div>

      <TreinoConcluidoModal
        isOpen={Boolean(treinoConcluidoModal)}
        onClose={() => setTreinoConcluidoModal(null)}
        treino={treinoConcluidoModal}
        progressoAtual={progressoAposConclusao}
      />
    </section>
  );
}

export default MeusTreinos;
