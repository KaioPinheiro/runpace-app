import {
  EXPERIENCIAS_INICIANTES,
  FORM_INICIAL_PLANO,
  OBJETIVOS_PLANO_SEM_EXPERIENCIA
} from "../constants/planoTreino";

const SEM_VALOR = "—";

const NOMENCLATURAS_TREINO = {
  "corrida continua": "Corrida continua",
  "corida continua": "Corrida continua",
  "corrrida continua": "Corrida continua",
  "corria continua": "Corrida continua",
  rodagem: "Corrida continua",
  "corrida leve": "Corrida continua",
  "corrida longa": "Corrida longa",
  "corida longa": "Corrida longa",
  "corrrida longa": "Corrida longa",
  "corria longa": "Corrida longa",
  longao: "Corrida longa",
  "treino longo": "Corrida longa",
  "treino de velocidade": "Treino de velocidade",
  velocidade: "Treino de velocidade",
  velocidadee: "Treino de velocidade",
  tiro: "Treino de velocidade",
  tiros: "Treino de velocidade",
  "treino de resistencia": "Treino de resistencia",
  resistencia: "Treino de resistencia",
  "corrida de resistencia": "Treino de resistencia",
  intervalado: "Intervalado",
  interbalado: "Intervalado",
  intervalada: "Intervalado",
  fartlek: "Fartlek",
  "recuperacao ativa": "Recuperacao ativa",
  recuperacao: "Recuperacao ativa",
  mobilidade: "Mobilidade",
  mobilidadee: "Mobilidade",
  fortalecimento: "Fortalecimento",
  fortalescimento: "Fortalecimento",
  "fortalecimento leve": "Fortalecimento",
  descanso: "Descanso",
  regenerativo: "Regenerativo"
};

const TIPOS_SEM_CORRIDA = [
  "descanso",
  "fortalecimento",
  "mobilidade",
  "alongamento",
  "recuperacao sem corrida",
  "caminhada"
];

const INDICADORES_CORRIDA = [
  "corrida",
  "rodagem",
  "longao",
  "interval",
  "fartlek",
  "ritmo",
  "tempo",
  "velocidade",
  "resistencia",
  "regenerativo",
  "tiro"
];

export function criarEstadoInicialPlano() {
  return {
    ...FORM_INICIAL_PLANO,
    diasDisponiveis: []
  };
}

export function normalizarCampoPlano(formulario, campo) {
  const { name, value, type, checked } = campo;
  const objetivoIncompativelComExperiencia =
    name === "experienciaCorrida" &&
    EXPERIENCIAS_INICIANTES.includes(value) &&
    formulario.objetivo &&
    !OBJETIVOS_PLANO_SEM_EXPERIENCIA.includes(formulario.objetivo);

  return {
    ...formulario,
    [name]: type === "checkbox" ? checked : value,
    ...(objetivoIncompativelComExperiencia
      ? { objetivo: "", objetivoPersonalizado: "" }
      : {}),
    ...(name === "objetivo" && value !== "Outro"
      ? { objetivoPersonalizado: "" }
      : {}),
    ...(name === "possuiLesao" && !checked ? { descricaoLesao: "" } : {}),
    ...(name === "possuiProva" && value !== "sim"
      ? limparCamposProva()
      : {}),
    ...(name === "distanciaProva" && value !== "Outra"
      ? { outraDistanciaProva: "" }
      : {}),
    ...(name === "objetivoProva" && value !== "Buscar um tempo específico"
      ? { tempoDesejadoProva: "" }
      : {})
  };
}

export function limparCamposProva() {
  return {
    dataProva: "",
    distanciaProva: "",
    outraDistanciaProva: "",
    objetivoProva: "",
    tempoDesejadoProva: "",
    importanciaProva: ""
  };
}

export function alternarDiaDisponivel(formulario, dia) {
  const diasDisponiveis = formulario.diasDisponiveis.includes(dia)
    ? formulario.diasDisponiveis.filter((item) => item !== dia)
    : [...formulario.diasDisponiveis, dia];

  return {
    ...formulario,
    diasDisponiveis,
    diaLongao: diasDisponiveis.includes(formulario.diaLongao)
      ? formulario.diaLongao
      : ""
  };
}

export function validarFormularioPlano(formulario) {
  const idade = Number(formulario.idade);

  if (
    !Number.isInteger(idade) ||
    idade < 18 ||
    idade > 100
  ) {
    return "Informe uma idade inteira entre 18 e 100 anos.";
  }

  if (formulario.diasDisponiveis.length === 0) {
    return "Selecione pelo menos um dia disponível para treinar.";
  }

  if (!["sim", "nao"].includes(formulario.possuiProva)) {
    return "Informe se possui uma prova marcada.";
  }

  if (
    formulario.diaLongao &&
    !formulario.diasDisponiveis.includes(formulario.diaLongao)
  ) {
    return "Escolha o dia do longão entre os dias disponíveis para treinar.";
  }

  if (
    formulario.objetivo === "Outro" &&
    !formulario.objetivoPersonalizado.trim()
  ) {
    return "Informe o objetivo que deseja alcançar.";
  }

  return null;
}

export function validarFormularioMeuPlano(formulario) {
  const erroBase = validarFormularioPlano(formulario);
  if (erroBase) {
    return erroBase;
  }

  if (
    formulario.possuiProva !== "sim" &&
    !["4", "5", "6"].includes(String(formulario.duracaoSemanas))
  ) {
    return "Escolha uma duração de 4, 5 ou 6 semanas.";
  }

  return null;
}

export function montarPayloadPlanoSemanal(formulario) {
  const dadosPlano = { ...formulario };
  const possuiProva = formulario.possuiProva === "sim";
  const distanciaAlvo = inferirDistanciaAlvo(formulario);
  delete dadosPlano.objetivoPersonalizado;
  delete dadosPlano.distanciaAlvo;
  delete dadosPlano.outraDistanciaAlvo;
  delete dadosPlano.diaLongao;
  delete dadosPlano.observacoes;

  return {
    ...dadosPlano,
    idade: Number(formulario.idade),
    objetivo: formulario.objetivo === "Outro"
      ? formulario.objetivoPersonalizado.trim()
      : formulario.objetivo,
    distanciaAlvo,
    distanciaProva: possuiProva ? inferirDistanciaProva(formulario, distanciaAlvo) : "",
    objetivoProva: possuiProva ? null : "",
    tempoDesejadoProva: possuiProva ? null : "",
    importanciaProva: possuiProva ? inferirImportanciaProva(formulario) : "",
    possuiProva,
    intensidadeDesejada: "adequada ao perfil informado",
    observacoes: montarObservacoesComLongao(formulario)
  };
}

export function montarPayloadMeuPlano(formulario) {
  const possuiProva = formulario.possuiProva === "sim";
  const objetivo = formulario.objetivo === "Outro"
    ? formulario.objetivoPersonalizado.trim()
    : formulario.objetivo;
  const distanciaAlvo = inferirDistanciaAlvo(formulario);
  const distanciaProva = inferirDistanciaProva(formulario, distanciaAlvo);
  const observacoes = montarObservacoesComLongao(formulario);

  return {
    idade: Number(formulario.idade),
    objetivo,
    experienciaCorrida: formulario.experienciaCorrida,
    volumeSemanalAtual: formulario.volumeSemanalAtual,
    ritmoConfortavel: formulario.ritmoConfortavel,
    distanciaAlvo,
    diasDisponiveis: formulario.diasDisponiveis,
    possuiProva,
    dataProva: possuiProva ? formulario.dataProva : null,
    distanciaProva: possuiProva ? distanciaProva : null,
    objetivoProva: null,
    tempoDesejado: null,
    importanciaProva: possuiProva ? inferirImportanciaProva(formulario) : null,
    possuiLesao: formulario.possuiLesao,
    observacoes,
    duracaoSemanas: possuiProva ? null : Number(formulario.duracaoSemanas)
  };
}

function inferirDistanciaAlvo(formulario) {
  if (formulario.distanciaAlvo === "Outro" && formulario.outraDistanciaAlvo.trim()) {
    return formulario.outraDistanciaAlvo.trim();
  }

  if (formulario.distanciaAlvo) {
    return formulario.distanciaAlvo;
  }

  if (formulario.possuiProva === "sim") {
    if (formulario.distanciaProva === "Outra" && formulario.outraDistanciaProva.trim()) {
      return formulario.outraDistanciaProva.trim();
    }

    if (formulario.distanciaProva) {
      return formulario.distanciaProva;
    }
  }

  const objetivo = formulario.objetivo === "Outro"
    ? formulario.objetivoPersonalizado
    : formulario.objetivo;
  const textoObjetivo = textoNormalizado(objetivo);

  if (textoObjetivo.includes("5 km")) {
    return "5 km";
  }

  if (textoObjetivo.includes("10 km")) {
    return "10 km";
  }

  if (textoObjetivo.includes("meia maratona")) {
    return "21 km";
  }

  if (textoObjetivo.includes("maratona")) {
    return "42 km";
  }

  return "Sem distância alvo definida";
}

function inferirDistanciaProva(formulario, distanciaAlvo) {
  if (formulario.distanciaProva === "Outra" && formulario.outraDistanciaProva.trim()) {
    return formulario.outraDistanciaProva.trim();
  }

  if (formulario.distanciaProva) {
    return formulario.distanciaProva;
  }

  return distanciaAlvo || "Não informada";
}

function inferirImportanciaProva(formulario) {
  return formulario.importanciaProva || "Prova importante";
}

function montarObservacoesComLongao(formulario) {
  const observacoes = [];

  if (formulario.observacoes.trim()) {
    observacoes.push(formulario.observacoes.trim());
  }

  if (formulario.possuiLesao && formulario.descricaoLesao.trim()) {
    observacoes.push(`Lesão ou limitação: ${formulario.descricaoLesao.trim()}`);
  }

  if (formulario.diaLongao) {
    observacoes.push(`Dia preferido para o longão: ${formulario.diaLongao}.`);
  }

  return observacoes.join(" ");
}

export function textoNormalizado(valor) {
  return String(valor ?? "")
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function normalizarNomenclaturaTreino(valor) {
  const chave = textoNormalizado(valor);

  return NOMENCLATURAS_TREINO[chave] ?? valor;
}

export function ehTreinoCorrida(treino) {
  const textoTreino = textoNormalizado([
    treino?.tipo,
    treino?.titulo,
    treino?.descricao
  ].filter(Boolean).join(" "));

  if (!textoTreino) {
    return false;
  }

  if (TIPOS_SEM_CORRIDA.some((tipo) => textoTreino.includes(tipo))) {
    return false;
  }

  return (
    temDistanciaValida(treino?.distanciaKm) ||
    INDICADORES_CORRIDA.some((tipo) => textoTreino.includes(tipo))
  );
}

function temDistanciaValida(valor) {
  if (ehValorSemMetrica(valor)) {
    return false;
  }

  const texto = String(valor).trim();
  const distancia = texto.match(/^(\d+(?:[,.]\d+)?)\s*(?:km)?$/i);

  return Boolean(distancia && Number(distancia[1].replace(",", ".")) > 0);
}

function ehValorSemMetrica(valor) {
  const texto = textoNormalizado(valor);

  return (
    !texto ||
    texto === "-" ||
    texto === "—" ||
    texto === "0" ||
    texto === "0 km" ||
    texto === "nao se aplica"
  );
}

export function formatarDistancia(valor) {
  if (ehValorSemMetrica(valor)) {
    return SEM_VALOR;
  }

  const texto = String(valor).trim();
  const distancia = texto.match(/^(\d+(?:[,.]\d+)?)\s*(?:km)?$/i);

  if (!distancia) {
    return texto;
  }

  return `${distancia[1]} km`;
}

export function formatarDuracao(valor) {
  if (ehValorSemMetrica(valor)) {
    return SEM_VALOR;
  }

  const texto = String(valor).trim();
  const normalizado = textoNormalizado(texto);
  const tempoComHoras = normalizado.match(/^(\d+):(\d{2}):(\d{2})$/);
  const tempoComMinutos = normalizado.match(/^(\d+):(\d{2})$/);

  if (tempoComHoras) {
    const [, horas, minutos, segundos] = tempoComHoras;
    const totalMinutos =
      Number(horas) * 60 + Number(minutos) + Number(segundos) / 60;

    return formatarMinutos(totalMinutos);
  }

  if (tempoComMinutos) {
    const [, primeiraParte, segundaParte] = tempoComMinutos;
    const primeiroNumero = Number(primeiraParte);
    const segundoNumero = Number(segundaParte);

    if (primeiroNumero > 0 && primeiroNumero <= 6 && segundoNumero < 60) {
      return formatarHorasMinutos(primeiroNumero, segundoNumero);
    }

    const totalMinutos = primeiroNumero + segundoNumero / 60;

    return formatarMinutos(totalMinutos);
  }

  const horas = normalizado.match(/(\d+)\s*(?:h|hora|horas)/);
  const minutos = normalizado.match(/(\d+)\s*(?:min|minuto|minutos)/);

  if (horas || minutos) {
    if (!horas && minutos) {
      return formatarMinutos(Number(minutos[1]));
    }

    if (horas) {
      const horasFormatadas = `${Number(horas[1])}h`;

      if (minutos && Number(minutos[1]) > 0) {
        return `${horasFormatadas} ${formatarMinutos(Number(minutos[1]))}`;
      }

      return horasFormatadas;
    }
  }

  const apenasNumero = normalizado.match(/^(\d+)$/);
  if (apenasNumero) {
    return formatarMinutos(Number(apenasNumero[1]));
  }

  return texto;
}

function formatarMinutos(valor) {
  const minutos = Number(valor);
  const texto = Number.isInteger(minutos)
    ? String(minutos)
    : String(Number(minutos.toFixed(1))).replace(".", ",");

  return `${texto} minutos`;
}

function formatarHorasMinutos(horas, minutos) {
  if (minutos > 0) {
    return `${horas}h ${minutos} minutos`;
  }

  return `${horas}h`;
}

export function formatarPace(valor) {
  if (ehValorSemMetrica(valor)) {
    return SEM_VALOR;
  }

  const texto = String(valor)
    .trim()
    .replace(/\s*-\s*/g, "–")
    .replace(/\s*–\s*/g, "–");

  if (/^\d+:\d{2}(?:–\d+:\d{2})?$/.test(texto)) {
    return `${texto} min/km`;
  }

  return texto;
}
