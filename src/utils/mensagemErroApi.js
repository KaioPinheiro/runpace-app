const CAMPOS_TECNICOS = new Set(["timestamp", "status", "error", "path"]);

export function obterMensagemErroApi(error, mensagemPadrao) {
  const resposta = error.response?.data;

  if (typeof resposta === "string" && resposta.trim()) {
    return resposta;
  }

  if (!resposta || typeof resposta !== "object") {
    return mensagemPadrao;
  }

  const mensagemValidacao = Object.entries(resposta).find(
    ([campo, valor]) =>
      !CAMPOS_TECNICOS.has(campo) &&
      typeof valor === "string" &&
      valor.trim()
  )?.[1];

  return resposta.erro || resposta.message || mensagemValidacao || mensagemPadrao;
}
