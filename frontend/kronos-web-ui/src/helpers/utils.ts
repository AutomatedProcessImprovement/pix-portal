export function dhmToString([years, months, days, hours, minutes]: [number, number, number, number, number]): string {
  let str = "";
  if (years > 0) {
    str += `${years}y `;
  }
  if (months > 0) {
    str += `${months}mo `;
  }
  if (days > 0) {
    str += `${days}d `;
  }
  if (hours > 0) {
    str += `${hours}h `;
  }
  if (minutes > 0) {
    str += `${minutes}m`;
  }
  return str.trim();
}

export function secondsToDhm(seconds: number): [number, number, number, number, number] {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const y = Math.floor(d / 365);
  let remainingDays = d % 365;
  const mo = Math.floor(remainingDays / 30);
  remainingDays = remainingDays % 30;
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return [y, mo, remainingDays, h, m];
}
