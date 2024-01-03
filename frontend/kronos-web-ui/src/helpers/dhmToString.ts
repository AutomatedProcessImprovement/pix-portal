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
