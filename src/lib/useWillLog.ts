import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { doc, getDoc, increment, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { addDays, dayDifference, getLocalDateKey, getTime } from "./date";

export interface LogEntry {
  id: string;
  task: string;
  timestamp: string;
  completed: boolean;
}

export interface RestPrompt {
  days: number;
}

// Firestore の構成
//   users/{uid}               … bits, buffer, lastOpenedDate, lastLoggedDate, restCheckedThrough
//   users/{uid}/days/{日付}    … その日の logs
// 記録がない日はドキュメントを作らない。「おやすみの日」は画面側で判定する。

const WELCOME_BACK_DAYS = 14;

export function useWillLog() {
  const today = useMemo(() => getLocalDateKey(), []);
  const [uid, setUid] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [saveError, setSaveError] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [bits, setBits] = useState(0);
  const [buffer, setBuffer] = useState(0);
  const [restPrompt, setRestPrompt] = useState<RestPrompt | null>(null);
  const [welcomeBack, setWelcomeBack] = useState(false);

  // 匿名ログイン:名前もメールも預からずに、その端末の本人だけの記録を作る
  useEffect(
    () =>
      onAuthStateChanged(auth, (user) => {
        if (user) setUid(user.uid);
        else signInAnonymously(auth).catch(() => setStatus("error"));
      }),
    [],
  );

  useEffect(() => {
    if (!uid) return;
    const userRef = doc(db, "users", uid);
    const dayRef = doc(db, "users", uid, "days", today);

    (async () => {
      try {
        const [userSnap, daySnap] = await Promise.all([getDoc(userRef), getDoc(dayRef)]);
        const data = userSnap.data() ?? {};

        setBits(Number(data.bits) || 0);
        setBuffer(Number(data.buffer) || 0);
        setLogs((daySnap.data()?.logs as LogEntry[]) ?? []);

        // 記録が途切れた日数 = 最後に記録した日(または前回確認済みの日)から今日までの間の日数
        const lastLogged = data.lastLoggedDate as string | undefined;
        const checked = data.restCheckedThrough as string | undefined;
        const start = [lastLogged, checked].filter(Boolean).sort().pop();
        if (start) {
          const restDays = dayDifference(start, today) - 1;
          if (restDays >= 1) setRestPrompt({ days: restDays });
        }

        const lastOpened = data.lastOpenedDate as string | undefined;
        if (lastOpened && dayDifference(lastOpened, today) >= WELCOME_BACK_DAYS) {
          setWelcomeBack(true);
        }

        await setDoc(userRef, { lastOpenedDate: today }, { merge: true });
        setStatus("ready");
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    })();
  }, [uid, today]);

  const save = useCallback(async (write: () => Promise<unknown>) => {
    try {
      await write();
      setSaveError(false);
    } catch (error) {
      console.error(error);
      setSaveError(true);
    }
  }, []);

  const saveLogs = useCallback(
    (next: LogEntry[]) => {
      if (!uid) return;
      void save(() => setDoc(doc(db, "users", uid, "days", today), { logs: next }));
    },
    [uid, today, save],
  );

  const addPoints = useCallback(
    (field: "bits" | "buffer", amount: number, extra: Record<string, unknown> = {}) => {
      if (!uid) return;
      void save(() =>
        setDoc(doc(db, "users", uid), { [field]: increment(amount), ...extra }, { merge: true }),
      );
    },
    [uid, save],
  );

  const addLog = (task: string) => {
    const next = [
      { id: crypto.randomUUID(), task, timestamp: getTime(), completed: false },
      ...logs,
    ];
    setLogs(next);
    setBits((current) => current + 1);
    saveLogs(next);
    addPoints("bits", 1, { lastLoggedDate: today });
  };

  const completeLog = (id: string) => {
    if (logs.find((log) => log.id === id)?.completed) return;
    const next = logs.map((log) => (log.id === id ? { ...log, completed: true } : log));
    setLogs(next);
    setBits((current) => current + 2);
    saveLogs(next);
    addPoints("bits", 2);
  };

  // 記録を消してもポイントは減らさない
  const removeLog = (id: string) => {
    const next = logs.filter((log) => log.id !== id);
    setLogs(next);
    saveLogs(next);
  };

  const answerRest = (intentional: boolean) => {
    const gained = intentional ? 6 : 2;
    setBuffer((current) => current + gained);
    setRestPrompt(null);
    addPoints("buffer", gained, { restCheckedThrough: addDays(today, -1) });
    return gained;
  };

  return {
    status,
    saveError,
    today,
    logs,
    bits,
    buffer,
    restPrompt,
    welcomeBack,
    dismissWelcomeBack: () => setWelcomeBack(false),
    addLog,
    completeLog,
    removeLog,
    answerRest,
  };
}
