export function getProximaOcorrencia(diaMes, referencia = new Date()) {
  const ano = referencia.getFullYear();
  const mes = referencia.getMonth();

  function diaValidoNoMes(anoAlvo, mesAlvo) {
    const ultimoDia = new Date(anoAlvo, mesAlvo + 1, 0).getDate();
    return Math.min(diaMes, ultimoDia);
  }

  const candidataEsteMes = new Date(ano, mes, diaValidoNoMes(ano, mes));
  candidataEsteMes.setHours(0, 0, 0, 0);

  const hoje = new Date(referencia);
  hoje.setHours(0, 0, 0, 0);

  if (candidataEsteMes >= hoje) {
    return candidataEsteMes;
  }

  const proximoMes = mes + 1;
  return new Date(ano, proximoMes, diaValidoNoMes(ano, proximoMes));
}

const formatterProxima = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long' });

export function formatProximaOcorrencia(diaMes, referencia = new Date()) {
  const data = getProximaOcorrencia(diaMes, referencia);
  return formatterProxima.format(data);
}

export function diasAteProximaOcorrencia(diaMes, referencia = new Date()) {
  const data = getProximaOcorrencia(diaMes, referencia);
  const hoje = new Date(referencia);
  hoje.setHours(0, 0, 0, 0);
  return Math.round((data - hoje) / (1000 * 60 * 60 * 24));
}
