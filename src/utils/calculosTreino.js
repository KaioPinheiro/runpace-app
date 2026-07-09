export function ehTreinoDeDescanso(treino) {
  return String(treino?.tipo ?? "").toLowerCase() === "descanso";
}

export function obterDistanciaConsiderada(treino) {
  return ehTreinoDeDescanso(treino) ? 0 : Number(treino?.distanciaKm) || 0;
}

export function calcularTempoTreinoSegundos(treino) {
  if (ehTreinoDeDescanso(treino)) return 0;

  const distanciaKm = Number(treino.distanciaKm);
  const pace = treino.paceMedio ?? treino.paceAlvo;
  const partesPace = String(pace ?? "").match(/^(\d+):([0-5]\d)/);

  if (distanciaKm > 0 && partesPace) {
    const minutos = Number(partesPace[1]);
    const segundos = Number(partesPace[2]);

    return Math.round(distanciaKm * (minutos * 60 + segundos));
  }

  const tempoMinutos = Number(treino.tempoMinutos);

  return tempoMinutos > 0 ? tempoMinutos * 60 : null;
}

export function formatarDuracao(totalSegundos) {
  if (totalSegundos == null) return "";

  const segundosArredondados = Math.round(totalSegundos);
  const minutos = Math.floor(segundosArredondados / 60);
  const segundos = segundosArredondados % 60;

  return `${minutos} min ${segundos} s`;
}

export function formatarDuracaoTotal(totalSegundos) {
  const minutosTotais = Math.floor((totalSegundos ?? 0) / 60);
  const horas = Math.floor(minutosTotais / 60);
  const minutos = minutosTotais % 60;

  return `${horas} h ${minutos} min`;
}

export function formatarTempoTreino(treino) {
  return formatarDuracao(calcularTempoTreinoSegundos(treino));
}
