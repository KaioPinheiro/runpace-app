import {
  DIAS_SEMANA,
  DURACOES_PLANO,
  EXPERIENCIAS_INICIANTES,
  EXPERIENCIAS_CORRIDA,
  OBJETIVOS_PLANO,
  OBJETIVOS_PLANO_SEM_EXPERIENCIA,
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

function PlaceholderSelect({ children }) {
  return (
    <option value="" disabled hidden>
      {children}
    </option>
  );
}

function FormularioPlanoSemanal({
  form,
  erro,
  sucesso,
  carregando,
  mensagemLoading,
  onAlterar,
  onAlternarDia,
  onSubmit
}) {
  const objetivosDisponiveis = EXPERIENCIAS_INICIANTES.includes(form.experienciaCorrida)
    ? OBJETIVOS_PLANO_SEM_EXPERIENCIA
    : OBJETIVOS_PLANO;

  return (
    <form className="coach-ia-form plano-ia-form" onSubmit={onSubmit}>
      <div className="coach-ia-form-titulo">
        <div><h2>Configure seu plano</h2></div>
        <p>Receba um ciclo de corrida personalizado para sua prova-alvo ou objetivo.</p>
      </div>

      <div className="coach-ia-campos plano-ia-campos">
        <label className="coach-ia-campo">
          <span>Idade *</span>
          <input
            type="number"
            name="idade"
            value={form.idade}
            onChange={onAlterar}
            placeholder="Digite sua idade"
            min="18"
            max="100"
            step="1"
            required
          />
        </label>

        <label className="coach-ia-campo">
          <span>Experiência na corrida *</span>
          <select
            name="experienciaCorrida"
            value={form.experienciaCorrida}
            onChange={onAlterar}
            required
          >
            <PlaceholderSelect>Há quanto tempo você corre?</PlaceholderSelect>
            <OpcoesSelect opcoes={EXPERIENCIAS_CORRIDA} />
          </select>
        </label>

        <label className="coach-ia-campo">
          <span>Objetivo *</span>
          <select name="objetivo" value={form.objetivo} onChange={onAlterar} required>
            <PlaceholderSelect>Selecione</PlaceholderSelect>
            <OpcoesSelect opcoes={objetivosDisponiveis} />
          </select>
        </label>

        {form.objetivo === "Outro" && (
          <label className="coach-ia-campo">
            <span>Qual é o seu objetivo? *</span>
            <input
              name="objetivoPersonalizado"
              value={form.objetivoPersonalizado}
              onChange={onAlterar}
              placeholder="Descreva o objetivo que deseja alcançar"
              required
            />
          </label>
        )}

        <label className="coach-ia-campo">
          <span>Ritmo confortável atual *</span>
          <select
            name="ritmoConfortavel"
            value={form.ritmoConfortavel}
            onChange={onAlterar}
            required
          >
            <PlaceholderSelect>Qual é seu ritmo confortável atual?</PlaceholderSelect>
            <OpcoesSelect opcoes={RITMOS_CONFORTAVEIS} />
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
            <PlaceholderSelect>Quantos km você corre por semana?</PlaceholderSelect>
            <OpcoesSelect opcoes={VOLUMES_SEMANAIS} />
          </select>
        </label>

        <fieldset className="coach-ia-dias">
          <legend>Dias disponíveis para treinar *</legend>
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

        <label className="coach-ia-campo">
          <span>Dia do longão</span>
          <select
            name="diaLongao"
            value={form.diaLongao}
            onChange={onAlterar}
            disabled={form.diasDisponiveis.length === 0}
          >
            <option value="">Sem preferência</option>
            {DIAS_SEMANA
              .filter((dia) => form.diasDisponiveis.includes(dia.valor))
              .map((dia) => (
                <option value={dia.valor} key={dia.valor}>
                  {dia.valor}
                </option>
              ))}
          </select>
        </label>

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
              <span>Não</span>
            </label>
          </div>
        </fieldset>

        {form.possuiProva === "nao" && (
          <label className="coach-ia-campo">
            <span>Duração do plano *</span>
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

        {form.possuiProva === "sim" && (
          <>
            <p className="plano-ia-ajuda coach-ia-largo">
              A duração será definida automaticamente conforme a data da prova,
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
            <strong>Possui lesão ou limitação?</strong>
            <small>O plano priorizará sua segurança.</small>
          </span>
        </label>

        {form.possuiLesao && (
          <label className="coach-ia-campo">
            <span>Descrição da lesão *</span>
            <textarea
              name="descricaoLesao"
              value={form.descricaoLesao}
              onChange={onAlterar}
              required
            />
          </label>
        )}

        <label className="coach-ia-campo coach-ia-largo">
          <span>Observações</span>
          <textarea
            name="observacoes"
            value={form.observacoes}
            onChange={onAlterar}
            placeholder="Fadiga, preferências ou limitações."
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
