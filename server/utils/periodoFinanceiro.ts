export function getMesFinanceiro(data = new Date()) {
  const dia = data.getDate()
  const mes = data.getMonth()
  const ano = data.getFullYear()

  if (dia <= 19) {
    return {
      mes: mes === 0 ? 11 : mes - 1,
      ano: mes === 0 ? ano - 1 : ano
    }
  }

  return { mes, ano }
}

export function getPeriodoFinanceiro(data = new Date()) {
  const { mes, ano } = getMesFinanceiro(data)

  const inicio = new Date(ano, mes, 20, 0, 0, 0)
  const fim = new Date(
    mes === 11 ? ano + 1 : ano,
    mes === 11 ? 0 : mes + 1,
    19,
    23, 59, 59
  )

  return { inicio, fim, mes, ano }
}
