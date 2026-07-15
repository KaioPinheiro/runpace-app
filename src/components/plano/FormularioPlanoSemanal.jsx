import {
  DIAS_SEMANA,
  DISTANCIAS_ALVO,
  DISTANCIAS_PROVA,
  DURACOES_PLANO,
  EXPERIENCIAS_CORRIDA,
  IMPORTANCIAS_PROVA,
  OBJETIVOS_PLANO,
  OBJETIVOS_PROVA,
  RITMOS_CONFORTAVEIS,
  VOLUMES_SEMANAIS
} from "../../constants/planoTreino";

function OpcoesSelect({ opcoes }) {
  return opcoes.map((opcao) => (
    <option value={opcao} key={opcao}>
      {opcao}
    </option>
  ));
}

function FormularioPlanoSemanal({
  form,
  erro,
  sucesso,
  carregando,
  mensagemLoading,
  onAlterar,
  onAlternarDia,
  onSubmit,
  setErro
}) {
  return (
    <form className="coach-ia-form plano-ia-form" onSubmit={onSubmit}>
      <div className="coach-ia-form-titulo">
        <div><h2>Configure seu plano</h2></div>
        <p>Receba um ciclo de corrida personalizado para sua prova-alvo ou objetivo.</p>
      </div>

      <div className="coach-ia-campos plano-ia-campos">
        <label className="coach-ia-campo">
          <span>Objetivo *</span>
          <select name="objetivo" value={form.objetivo} onChange={onAlterar} required>
            <option value="">Selecione</option>
            <OpcoesSelect opcoes={OBJETIVOS_PLANO} />
          </select>
        </label>

        {form.objetivo === "Outro" && (
          <label className="coach-ia-campo">
            <span>Objetivo personalizado *</span>
            <input
              name="objetivoPersonalizado"
              value={form.objetivoPersonalizado}
              onChange={onAlterar}
              placeholder="Ex.: correr 10 km, melhorar meu tempo, voltar a correr"
              required
            />
          </label>
        )}

        <label className="coach-ia-campo">
          <span>Experiencia na corrida *</span>
          <select
            name="experienciaCorrida"
            value={form.experienciaCorrida}
            onChange={onAlterar}
            required
          >
            <option value="">Ha quanto tempo voce corre?</option>
            <OpcoesSelect opcoes={EXPERIENCIAS_CORRIDA} />
          </select>
        </label>

        <label className="coach-ia-campo">
          <span>Volume semanal atual *</span>
          <select
            name="volumeSemanalAtual"
            value={form.volumeSemanalAtual}
            onChange={onAlterar}
            required
          >
            <option value="">Quantos km voce corre por semana?</option>
            <OpcoesSelect opcoes={VOLUMES_SEMANAIS} />
          </select>
        </label>

        <label className="coach-ia-campo">
          <span>Ritmo confortavel atual *</span>
          <select
            name="ritmoConfortavel"
            value={form.ritmoConfortavel}
            onChange={onAlterar}
            required
          >
            <option value="">Qual e seu ritmo confortavel atual?</option>
            <OpcoesSelect opcoes={RITMOS_CONFORTAVEIS} />
          </select>
        </label>

        <label className="coach-ia-campo">
          <span>Distancia-alvo *</span>
          <select
            name="distanciaAlvo"
            value={form.distanciaAlvo}
            onChange={onAlterar}
            required
          >
            <option value="">Selecione a distancia alvo</option>
            <OpcoesSelect opcoes={DISTANCIAS_ALVO} />
          </select>
        </label>

        {form.distanciaAlvo === "Outro" && (
          <label className="coach-ia-campo">
            <span>Informe a distancia alvo *</span>
            <input
              name="outraDistanciaAlvo"
              value={form.outraDistanciaAlvo}
              onChange={onAlterar}
              placeholder="Ex.: 8 km, 12 km, 30 km"
              onInvalid={(event) => {
                event.preventDefault();
                setErro("Informe a distancia alvo desejada.");
              }}
              required
            />
          </label>
        )}

        {form.possuiProva !== "sim" && (
          <label className="coach-ia-campo">
            <span>Duracao do plano *</span>
            <select
              name="duracaoSemanas"
              value={form.duracaoSemanas}
              onChange={onAlterar}
              required
            >
              {DURACOES_PLANO.map((duracao) => (
                <option value={duracao.valor} key={duracao.valor}>
                  {duracao.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <fieldset className="coach-ia-dias">
          <legend>Dias disponiveis para treinar *</legend>
          <div>
            {DIAS_SEMANA.map((dia) => {
              const selecionado = form.diasDisponiveis.includes(dia.valor);

              return (
                <button
                  className={selecionado ? "coach-ia-dia-selecionado" : ""}
                  type="button"
                  key={dia.valor}
                  aria-pressed={selecionado}
                  onClick={() => onAlternarDia(dia.valor)}
                >
                  {dia.sigla}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="coach-ia-radio-grupo">
          <legend>Possui uma prova marcada? *</legend>
          <div>
            <label>
              <input
                type="radio"
                name="possuiProva"
                value="sim"
                checked={form.possuiProva === "sim"}
                onChange={onAlterar}
                required
              />
              <span>Sim</span>
            </label>
            <label>
              <input
                type="radio"
                name="possuiProva"
                value="nao"
                checked={form.possuiProva === "nao"}
                onChange={onAlterar}
                required
              />
              <span>Nao</span>
            </label>
          </div>
        </fieldset>

        {form.possuiProva === "sim" && (
          <>
            <p className="plano-ia-ajuda coach-ia-largo">
              A duracao sera definida automaticamente conforme a data da prova,
              entre 4 e 6 semanas.
            </p>

            <label className="coach-ia-campo">
              <span>Data da prova *</span>
              <input
                type="date"
                name="dataProva"
                value={form.dataProva}
                onChange={onAlterar}
                required
              />
            </label>

            <label className="coach-ia-campo">
              <span>Distancia da prova *</span>
              <select
                name="distanciaProva"
                value={form.distanciaProva}
                onChange={onAlterar}
                required
              >
                <option value="">Selecione</option>
                <OpcoesSelect opcoes={DISTANCIAS_PROVA} />
              </select>
            </label>

            {form.distanciaProva === "Outra" && (
              <label className="coach-ia-campo">
                <span>Qual e a distancia? *</span>
                <input
                  name="outraDistanciaProva"
                  value={form.outraDistanciaProva}
                  onChange={onAlterar}
                  placeholder="Ex.: 50 km"
                  required
                />
              </label>
            )}

            <label className="coach-ia-campo">
              <span>Objetivo para a prova</span>
              <select
                name="objetivoProva"
                value={form.objetivoProva}
                onChange={onAlterar}
              >
                <option value="">Selecione</option>
                <OpcoesSelect opcoes={OBJETIVOS_PROVA} />
              </select>
            </label>

            {form.objetivoProva === "Buscar um tempo especifico" && (
              <label className="coach-ia-campo">
                <span>Tempo desejado *</span>
                <input
                  name="tempoDesejadoProva"
                  value={form.tempoDesejadoProva}
                  onChange={onAlterar}
                  placeholder="Ex.: 45:00 ou 1:35:00"
                  required
                />
              </label>
            )}

            <label className="coach-ia-campo">
              <span>Importancia da prova *</span>
              <select
                name="importanciaProva"
                value={form.importanciaProva}
                onChange={onAlterar}
                required
              >
                <option value="">Selecione</option>
                <OpcoesSelect opcoes={IMPORTANCIAS_PROVA} />
              </select>
            </label>
          </>
        )}

        <label className="coach-ia-lesao">
          <input
            type="checkbox"
            name="possuiLesao"
            checked={form.possuiLesao}
            onChange={onAlterar}
          />
          <span className="coach-ia-check" aria-hidden="true">✓</span>
          <span>
            <strong>Possui lesao ou limitacao?</strong>
            <small>O plano priorizara sua seguranca.</small>
          </span>
        </label>

        {form.possuiLesao && (
          <label className="coach-ia-campo">
            <span>Descricao da lesao *</span>
            <textarea
              name="descricaoLesao"
              value={form.descricaoLesao}
              onChange={onAlterar}
              required
            />
          </label>
        )}

        <label className="coach-ia-campo coach-ia-largo">
          <span>Observacoes</span>
          <textarea
            name="observacoes"
            value={form.observacoes}
            onChange={onAlterar}
            placeholder="Fadiga, preferencias ou limitacoes."
          />
        </label>
      </div>

      {erro && <p className="coach-ia-erro">{erro}</p>}
      {sucesso && <p className="coach-ia-sucesso">{sucesso}</p>}
      {carregando && (
        <p className="coach-ia-loading-mensagem">
          {mensagemLoading}
        </p>
      )}
      <button className="coach-ia-submit" type="submit" disabled={carregando}>
        {carregando
          ? <><span className="coach-ia-spinner" />Gerando plano...</>
          : <><span>▦</span>Gerar meu plano</>}
      </button>
    </form>
  );
}

export default FormularioPlanoSemanal;
