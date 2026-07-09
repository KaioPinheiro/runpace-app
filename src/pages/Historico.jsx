import { useEffect, useState } from "react";
import CardTreino from "../components/CardTreino";
import {
  buscarTreinos as buscarTreinosApi,
  editarTreino,
  excluirTreino,
} from "../services/api";
import {
  calcularTempoTreinoSegundos,
  formatarDuracaoTotal,
  formatarTempoTreino,
  obterDistanciaConsiderada,
} from "../utils/calculosTreino";

function formatarDataTreino(dataTreino) {
  if (!dataTreino) return "";

  const [ano, mes, dia] = dataTreino.split("T")[0].split("-");
  return `${dia}/${mes}/${ano}`;
}

function Historico() {
  const [treinos, setTreinos] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");
  const [treinoEmEdicao, setTreinoEmEdicao] = useState(null);

  useEffect(() => {
    async function carregarTreinos() {
      try {
        const dados = await buscarTreinosApi();
        setTreinos(dados);
      } catch (error) {
        console.error("Erro ao buscar treinos", error);
      }
    }

    carregarTreinos();
  }, []);

  async function handleExcluirTreino(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este treino?"
    );

    if (!confirmar) return;

    try {
      await excluirTreino(id);
      setTreinos((treinosAtuais) =>
        treinosAtuais.filter((treino) => treino.id !== id)
      );
      setMensagem("Treino excluído com sucesso!");
      setTipoMensagem("sucesso");
    } catch (error) {
      console.error("Erro ao excluir treino", error);
      setMensagem("Erro ao excluir treino.");
      setTipoMensagem("erro");
    }
  }

  function handleAbrirEdicao(treino) {
    setTreinoEmEdicao({
      id: treino.id,
      dataTreino: treino.dataTreino?.split("T")[0] ?? "",
      tipo: treino.tipo ?? "",
      distanciaKm: treino.distanciaKm ?? "",
      tempoMinutos: treino.tempoMinutos ?? "",
      paceMedio: treino.paceMedio ?? "",
      observacoes: treino.observacoes ?? "",
    });
  }

  function handleChangeEdicao(event) {
    const { name, value } = event.target;

    setTreinoEmEdicao((treinoAtual) => ({
      ...treinoAtual,
      [name]: value,
    }));
  }

  async function handleSalvarEdicao(event) {
    event.preventDefault();

    try {
      const treinoAtualizado = await editarTreino(treinoEmEdicao.id, {
        dataTreino: treinoEmEdicao.dataTreino,
        tipo: treinoEmEdicao.tipo,
        distanciaKm: Number(treinoEmEdicao.distanciaKm),
        tempoMinutos: Number(treinoEmEdicao.tempoMinutos),
        paceMedio: treinoEmEdicao.paceMedio,
        observacoes: treinoEmEdicao.observacoes,
      });

      setTreinos((treinosAtuais) =>
        treinosAtuais.map((treino) =>
          treino.id === treinoAtualizado.id ? treinoAtualizado : treino
        )
      );
      setTreinoEmEdicao(null);
      setMensagem("Treino editado com sucesso!");
      setTipoMensagem("sucesso");
    } catch (error) {
      console.error("Erro ao editar treino", error);
      setMensagem("Erro ao editar treino.");
      setTipoMensagem("erro");
    }
  }

  const treinosFiltrados = treinos.filter((treino) => {
    if (!filtroTipo) return true;

    return treino.tipo.toLowerCase().includes(filtroTipo.toLowerCase());
  });

  const treinosOrdenados = [...treinosFiltrados].sort((a, b) =>
    new Date(a.dataTreino) - new Date(b.dataTreino)
  );

  const totalTreinos = treinos.length;
  const quilometragemTotal = treinos.reduce(
    (total, treino) => total + obterDistanciaConsiderada(treino),
    0
  );
  const tempoTotalSegundos = treinos.reduce(
    (total, treino) =>
      total + (calcularTempoTreinoSegundos(treino) ?? 0),
    0
  );

  return (
    <section>
      <h2>📜 Histórico de Treinos</h2>

      <section className="historico-resumo">
        <div className="historico-resumo-card">
          <h3>🏃 Total de Treinos</h3>
          <p>{totalTreinos}</p>
        </div>

        <div className="historico-resumo-card">
          <h3>📏 Quilometragem Total</h3>
          <p>{quilometragemTotal.toFixed(1)} km</p>
        </div>

        <div className="historico-resumo-card">
          <h3>⏱️ Tempo Total</h3>
          <p>{formatarDuracaoTotal(tempoTotalSegundos)}</p>
        </div>
      </section>

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

      {treinoEmEdicao && (
        <form className="form-treino form-edicao" onSubmit={handleSalvarEdicao}>
          <div className="campo-formulario">
            <label htmlFor="dataTreinoEdicao">
              Data <span className="campo-obrigatorio">*</span>
            </label>
            <input
              id="dataTreinoEdicao"
              name="dataTreino"
              type="date"
              value={treinoEmEdicao.dataTreino}
              onChange={handleChangeEdicao}
              required
            />
          </div>

          <div className="campo-formulario">
            <label htmlFor="tipoEdicao">
              Tipo <span className="campo-obrigatorio">*</span>
            </label>
            <input
              id="tipoEdicao"
              name="tipo"
              value={treinoEmEdicao.tipo}
              onChange={handleChangeEdicao}
              required
            />
          </div>

          <div className="campo-formulario">
            <label htmlFor="distanciaEdicao">
              Distância (Km) <span className="campo-obrigatorio">*</span>
            </label>
            <input
              id="distanciaEdicao"
              name="distanciaKm"
              type="number"
              min="0.1"
              step="0.1"
              value={treinoEmEdicao.distanciaKm}
              onChange={handleChangeEdicao}
              required
            />
          </div>

          <div className="campo-formulario">
            <label htmlFor="tempoEdicao">
              Tempo (min) <span className="campo-obrigatorio">*</span>
            </label>
            <input
              id="tempoEdicao"
              name="tempoMinutos"
              type="number"
              min="1"
              step="1"
              value={treinoEmEdicao.tempoMinutos}
              onChange={handleChangeEdicao}
              required
            />
          </div>

          <div className="campo-formulario">
            <label htmlFor="paceEdicao">Pace</label>
            <input
              id="paceEdicao"
              name="paceMedio"
              value={treinoEmEdicao.paceMedio}
              onChange={handleChangeEdicao}
              placeholder="Ex.: 5:30"
            />
          </div>

          <div className="campo-formulario campo-formulario-largo">
            <label htmlFor="observacoesEdicao">Observações</label>
            <textarea
              id="observacoesEdicao"
              name="observacoes"
              value={treinoEmEdicao.observacoes}
              onChange={handleChangeEdicao}
            />
          </div>

          <div className="acoes-form-edicao">
            <button type="submit">Salvar Alterações</button>
            <button
              type="button"
              className="btn-cancelar"
              onClick={() => setTreinoEmEdicao(null)}
            >
              Cancelar Edição
            </button>
          </div>
        </form>
      )}

      <section className="filtro-container">
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          <option value="">Todos os treinos</option>
          <option value="Rodagem">Rodagem</option>
          <option value="Tiro">Tiro</option>
          <option value="Longão">Longão</option>
          <option value="Regenerativo">Regenerativo</option>
          <option value="Ritmo">Ritmo</option>
          <option value="Descanso">Descanso</option>
        </select>
      </section>

      {treinos.length === 0 && (
        <section className="historico-empty-state" role="status">
          <h3>📋 Nenhum treino encontrado</h3>
          <p>Conclua um treino para começar seu histórico.</p>
        </section>
      )}

      <section className="grid-treinos">
        {treinosOrdenados.map((treino, index) => (
          <CardTreino
            key={treino.id}
            id={index + 1}
            tipo={treino.tipo}
            data={formatarDataTreino(treino.dataTreino)}
            distanciaKm={obterDistanciaConsiderada(treino)}
            tempoMinutos={treino.tempoMinutos}
            tempoFormatado={formatarTempoTreino(treino)}
            pace={`${treino.paceMedio} min/km`}
            observacoes={treino.observacoes}
            onEditar={() => handleAbrirEdicao(treino)}
            onExcluir={() => handleExcluirTreino(treino.id)}
            statusLabel="✅ Concluído"
           />
        ))}
      </section>
    </section>
  );
}

export default Historico;
