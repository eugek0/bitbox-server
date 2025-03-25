export function getNoun(
  count: number,
  one: string,
  two: string,
  five: string,
): string {
  const n = Math.abs(count);

  if (n >= 5 && n <= 20) {
    return five;
  }
  if (n % 10 === 1) {
    return one;
  }
  if (n % 10 >= 2 && n % 10 <= 4) {
    return two;
  }

  return five;
}
