export function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const hour = date.getHours();
  const minute = date.getMinutes();

  const monthString = month.toString().padStart(2, "0");
  const dayString = day.toString().padStart(2, "0");

  const hourString = hour.toString().padStart(2, "0");
  const minuteString = minute.toString().padStart(2, "0");

  return `${year}-${monthString}-${dayString}T${hourString}:${minuteString}`;
}
