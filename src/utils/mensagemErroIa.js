export function obterMensagemErroIa(error, mensagemIndisponivel) {
  const status = error?.response?.status;
  const codigo = error?.code;
  const mensagemBackend =
    error?.response?.data?.erro ??
    error?.response?.data?.message ??
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

  if (status >= 400 && status < 500 && mensagemBackend) {
    return String(mensagemBackend);
  }

  return mensagemIndisponivel;
}
