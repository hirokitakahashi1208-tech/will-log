// 端末のローカル時刻で "YYYY-MM-DD" を作る(UTCだと日本時間の朝9時前に日付がずれるため)
export const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const addDays = (key: string, days: number) => {
  const date = new Date(`${key}T12:00:00`);
  date.setDate(date.getDate() + days);
  return getLocalDateKey(date);
};

export const getTime = () =>
  new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());

// 2つの日付キーの差(日数)。正午で比較してサマータイム等のずれを避ける
export const dayDifference = (from: string, to: string) => {
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  const difference = Math.round((end.getTime() - start.getTime()) / 86400000);
  return Number.isFinite(difference) ? Math.max(0, difference) : 0;
};
