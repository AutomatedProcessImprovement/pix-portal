export const formatNumber = (num: number, decimals = 2) => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatSeconds = (seconds: number, includeHours = true) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsLeft = Math.round(seconds % 60);

  let result = "";
  if (includeHours && hours > 0) {
    result += `${hours}h `;
  }
  if (minutes > 0) {
    result += `${minutes}m `;
  }
  result += `${secondsLeft}s`;

  return result;
};

export const formatCurrency = (num: number) => {
  return num.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
};

export const formatPercentage = (num: number, decimals = 2) => {
  return `${formatNumber(num * 100, decimals)}%`;
};
