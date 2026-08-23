export function plural(count: number, forms: [string, string, string]): string {
  const [one, few, many] = forms
  const lastTwo = Math.abs(count) % 100
  const last = lastTwo % 10

  if (lastTwo > 10 && lastTwo < 20) {
    return many
  }

  if (last === 1) {
    return one
  }

  if (last > 1 && last < 5) {
    return few
  }

  return many
}
