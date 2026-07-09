import { ehTreinoDeDescanso } from "../utils/calculosTreino";

const diasSemana = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];

function formatarDataIsoLocal(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function obterInicioSemanaAtual() {
  const hoje = new Date();
  const diaSemana = hoje.getDay();
  const diasAteSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;

  hoje.setHours(0, 0, 0, 0);
  hoje.setDate(hoje.getDate() + diasAteSegunda);
  return hoje;
}

function adicionarDias(data, quantidade) {
  const novaData = new Date(data);
  novaData.setDate(novaData.getDate() + quantidade);
  return novaData;
}

function obterStatus(treino) {
  if (ehTreinoDeDescanso(treino)) {
    return {
      icone: "😴",
      texto: "Descanso",
      classe: "minha-semana-status-descanso",
    };
  }

  if (treino.status === "CONCLUIDO") {
    return {
      icone: "✅",
      texto: "Concluído",
      classe: "minha-semana-status-concluido",
    };
  }

  return {
    icone: "🔵",
    texto: "Pendente",
    classe: "minha-semana-status-pendente",
  };
}

function MinhaSemana({ treinos }) {
  const inicioSemana = obterInicioSemanaAtual();
  const dias = diasSemana.map((nome, indice) => {
    const data = adicionarDias(inicioSemana, indice);
    const dataIso = formatarDataIsoLocal(data);

    return {
      nome,
      dataIso,
      numeroDia: String(data.getDate()).padStart(2, "0"),
      treinos: treinos.filter(
        (treino) => String(treino.dataSemana).split("T")[0] === dataIso
      ),
    };
  });

  return (
    <section className="minha-semana">
      <div className="minha-semana-cabecalho">
        <h2>📅 Minha Semana</h2>
        <span>Treinos da semana atual</span>
      </div>

      <div className="minha-semana-grid">
        {dias.map((dia) => (
          <article className="minha-semana-dia" key={dia.dataIso}>
            <div className="minha-semana-dia-cabecalho">
              <strong>{dia.nome}</strong>
              <span>{dia.numeroDia}</span>
            </div>

            {dia.treinos.length === 0 ? (
              <p className="minha-semana-sem-treino">Sem treino</p>
            ) : (
              <div className="minha-semana-lista">
                {dia.treinos.map((treino) => {
                  const status = obterStatus(treino);

                  return (
                    <div
                      className={`minha-semana-treino ${status.classe}`}
                      key={`${treino.status}-${treino.id}`}
                    >
                      <strong>{treino.titulo || treino.tipo}</strong>
                      <span>{treino.tipo}</span>
                      <small>
                        {status.icone} {status.texto}
                      </small>
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default MinhaSemana;
