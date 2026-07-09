export function obterMensagemErroIa(error, mensagemIndisponivel) {
  const status = error?.response?.status;
  const codigo = error?.code;
  const mensagemOriginal = String(
    error?.response?.data?.erro ??
      error?.response?.data?.message ??
      error?.message ??
      ""
  ).toLowerCase();

  if (
    codigo === "ECONNABORTED" ||
    status === 408 ||
    status === 504 ||
    mensagemOriginal.includes("timeout") ||
    mensagemOriginal.includes("demorou")
  ) {
    return "A geração demorou mais que o esperado. Clique em Gerar novamente.";
  }

  if (
    codigo === "ERR_NETWORK" ||
    codigo === "NETWORK_ERROR" ||
    (!error?.response && mensagemOriginal) ||
    mensagemOriginal.includes("network") ||
    mensagemOriginal.includes("conex")
  ) {
    return "Verifique sua conexão e tente novamente.";
  }

  return mensagemIndisponivel;
}
