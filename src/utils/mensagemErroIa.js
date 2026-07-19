export function obterMensagemErroIa(error, mensagemIndisponivel) {
  const status = error?.response?.status;
  const codigo = error?.code;
  const dadosErro = error?.response?.data;
  const mensagemBackend =
    extrairMensagemBackend(dadosErro) ??
    "";
  const mensagemOriginal = String(
    mensagemBackend ||
      error?.message ||
      ""
  ).toLowerCase();

  if (
    codigo === "ECONNABORTED" ||
    status === 408 ||
    status === 504 ||
    mensagemOriginal.includes("timeout") ||
    mensagemOriginal.includes("demorou")
  ) {
    return "A geracao demorou mais que o esperado. Tente novamente.";
  }

  if (
    codigo === "ERR_NETWORK" ||
    codigo === "NETWORK_ERROR" ||
    (!error?.response && mensagemOriginal) ||
    mensagemOriginal.includes("network") ||
    mensagemOriginal.includes("conex")
  ) {
    return "Verifique sua conexao e tente novamente.";
  }

  if (status >= 400 && mensagemBackend) {
    return String(mensagemBackend);
  }

  return mensagemIndisponivel;
}

function extrairMensagemBackend(dadosErro) {
  if (!dadosErro) {
    return "";
  }

  if (typeof dadosErro === "string") {
    return dadosErro;
  }

  if (dadosErro.erro || dadosErro.message || dadosErro.mensagem) {
    return dadosErro.erro ?? dadosErro.message ?? dadosErro.mensagem;
  }

  if (typeof dadosErro === "object") {
    const mensagens = Object.values(dadosErro).filter(Boolean);
    if (mensagens.length > 0) {
      return mensagens.join(" ");
    }
  }

  return "";
}
