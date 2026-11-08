import React, { useEffect, useState } from "react";
import {
  ArrowUp,
  BedSingle,
  Check,
  ChevronRight,
  CircleHelp,
  Moon,
  Shield,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { VentingMode } from "./components/VentingMode";
import { useWillLog } from "./lib/useWillLog";

export default function App() {
  const willLog = useWillLog();
  const {
    status,
    saveError,
    today,
    logs,
    bits,
    buffer,
    restPrompt,
    welcomeBack: showWelcomeBack,
  } = willLog;
  const [input, setInput] = useState("");
  const [showVenting, setShowVenting] = useState(false);
  const [showHibernation, setShowHibernation] = useState(false);
  const [restResult, setRestResult] = useState<string | null>(null);
  const [showSupport, setShowSupport] = useState(false);

  // 久しぶりに開いたときは、相談先を最初から見える状態にしておく
  useEffect(() => {
    if (showWelcomeBack) setShowSupport(true);
  }, [showWelcomeBack]);

  const addLog = (event: React.FormEvent) => {
    event.preventDefault();
    const task = input.trim();
    if (!task) return;
    willLog.addLog(task);
    setInput("");
  };

  const answerRest = (intentional: boolean) => {
    const gained = willLog.answerRest(intentional);
    setRestResult(
      intentional
        ? `休むと決めたことを記録しました。+${gained} BUFFER`
        : `おやすみの日として記録しました。+${gained} BUFFER`,
    );
    window.setTimeout(() => setRestResult(null), 4200);
  };

  if (status === "loading") {
    return <div className="min-h-dvh bg-background" />;
  }

  if (status === "error") {
    return (
      <div className="grid min-h-dvh place-items-center bg-background px-6 text-center font-mono">
        <div>
          <p className="text-sm text-[#a4ada8]">記録を読み込めませんでした。</p>
          <p className="mt-2 text-xs leading-6 text-[#626d67]">
            通信状態を確認して、ページを開き直してください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#111312] font-mono text-foreground selection:bg-primary selection:text-primary-foreground">
      {showVenting && (
        <VentingMode onClose={() => setShowVenting(false)} />
      )}

      {showHibernation && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#050807] px-6">
          <button
            type="button"
            onClick={() => setShowHibernation(false)}
            className="absolute right-5 top-5 grid size-11 place-items-center rounded-md border-2 border-[#22312b] text-[#739184] transition-colors hover:border-[#00E5FF] hover:text-[#00E5FF]"
            aria-label="冬眠モードを終了"
          >
            <X size={18} />
          </button>
          <div className="text-center">
            <div className="mx-auto mb-9 grid size-20 place-items-center rounded-md border-2 border-[#00E5FF]/40 bg-[#071114] shadow-[0_0_40px_rgba(0,229,255,0.12)]">
              <Moon className="text-[#00E5FF]" size={26} />
            </div>
            <p className="mb-3 text-[10px] tracking-[0.38em] text-[#00E5FF]/60">
              HIBERNATION MODE
            </p>
            <h2 className="text-xl font-bold text-[#dce6e1]">休むのも大事な選択です</h2>
            <p className="mx-auto mt-4 max-w-xs text-sm leading-7 text-[#718078]">
              今日はここまで。画面を閉じても、記録したものはなくなりません。
            </p>
            <button
              type="button"
              onClick={() => setShowHibernation(false)}
              className="mt-10 border-b border-[#52655c] pb-1 text-xs text-[#718078] transition-colors hover:border-[#00E5FF] hover:text-[#00E5FF]"
            >
              ログに戻る
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto grid min-h-dvh max-w-[1180px] lg:grid-cols-[280px_1fr] lg:gap-10 lg:px-8">
        <aside className="hidden border-x-2 border-[#252a27] bg-[#151816] lg:flex lg:flex-col lg:p-7">
          <div className="flex items-center gap-3 text-primary">
            <span className="grid size-9 place-items-center rounded-md border-2 border-primary">
              W
            </span>
            <div>
              <p className="text-sm font-bold tracking-[0.18em]">WILL LOG</p>
              <p className="mt-1 text-[9px] tracking-[0.2em] text-[#637068]">
                DIGITAL SHELTER
              </p>
            </div>
          </div>
          <div className="mt-16 border-l-2 border-primary pl-4">
            <p className="text-[10px] tracking-[0.25em] text-primary">STATUS</p>
            <p className="mt-3 text-sm text-[#b7c0bb]">あなたのペースで稼働中</p>
          </div>
          <div className="mt-auto text-[10px] leading-6 text-[#5d6862]">
            <p>ポイントは減りません。</p>
            <p>比較も、連続日数もありません。</p>
          </div>
        </aside>

        <div className="relative mx-auto flex min-h-dvh w-full max-w-[680px] flex-col border-x-0 border-[#2c322f] bg-background lg:my-5 lg:min-h-[calc(100vh-2.5rem)] lg:border-2">
          <header className="sticky top-0 z-20 border-b-2 border-border bg-background/95 px-5 pb-4 pt-5 backdrop-blur-md sm:px-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] tracking-[0.28em] text-[#66736c]">
                  WILL LOG / {today.replaceAll("-", ".")}
                </p>
                <h1 className="mt-2 text-base font-bold tracking-[0.12em]">
                  SYSTEM LOG
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setShowHibernation(true)}
                className="flex items-center gap-2 rounded-md border-2 border-[#35413b] px-3 py-2 text-xs text-[#9ca8a1] transition-colors hover:border-[#00E5FF] hover:text-[#00E5FF]"
              >
                <BedSingle size={15} />
                冬眠モード
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between rounded-md border-2 border-primary/60 bg-[#18241e] px-4 py-3">
                <div className="flex items-center gap-2 text-primary">
                  <Zap size={15} fill="currentColor" />
                  <span className="text-[10px] tracking-[0.18em]">BITS</span>
                </div>
                <strong className="text-lg text-primary">
                  {String(bits).padStart(4, "0")}
                </strong>
              </div>
              <div className="flex items-center justify-between rounded-md border-2 border-[#00E5FF]/50 bg-[#101f22] px-4 py-3">
                <div className="flex items-center gap-2 text-[#00E5FF]">
                  <Shield size={15} />
                  <span className="text-[10px] tracking-[0.16em]">BUFFER</span>
                </div>
                <strong className="text-lg text-[#00E5FF]">
                  {String(buffer).padStart(4, "0")}
                </strong>
              </div>
            </div>
          </header>

          <main className="flex-1 px-5 pb-36 pt-6 sm:px-7">
            {showWelcomeBack && (
              <section className="relative mb-5 rounded-md border-2 border-[#8A63D2] bg-[#211a2d] p-5">
                <button
                  type="button"
                  onClick={willLog.dismissWelcomeBack}
                  className="absolute right-3 top-3 text-[#8f7aae] hover:text-white"
                  aria-label="閉じる"
                >
                  <X size={16} />
                </button>
                <p className="text-[10px] tracking-[0.25em] text-[#a98ce2]">
                  WELCOME BACK
                </p>
                <h2 className="mt-3 text-lg font-bold">おかえりなさい。</h2>
                <p className="mt-2 text-sm leading-7 text-[#bcb3c9]">
                  戻ってきただけで十分です。空白のぶんを埋める必要はありません。
                </p>
                <button
                  type="button"
                  onClick={() => setShowSupport((current) => !current)}
                  className="mt-4 flex items-center gap-2 text-xs text-[#b99ce8] hover:text-white"
                >
                  <CircleHelp size={14} />
                  相談先をそっと見る
                  <ChevronRight size={14} />
                </button>
                {showSupport && (
                  <div className="mt-4 border-t border-[#57456f] pt-4 text-xs leading-6 text-[#a99eb7]">
                    <p>ひとりで抱えるのが難しいときは、話すだけでも大丈夫です。</p>
                    <a
                      href="tel:0120279338"
                      className="mt-2 inline-block text-[#d7c2fa] underline decoration-[#7f63ab] underline-offset-4"
                    >
                      よりそいホットライン：0120-279-338
                    </a>
                  </div>
                )}
              </section>
            )}

            {restPrompt && (
              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 rounded-md border-2 border-[#00E5FF]/55 bg-[#101d20] p-5"
              >
                <div className="flex items-start gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-md border-2 border-[#00E5FF]/40 text-[#00E5FF]">
                    <Moon size={18} />
                  </span>
                  <div>
                    <p className="text-[10px] tracking-[0.22em] text-[#00E5FF]">
                      REST CHECK / {restPrompt.days} DAY{restPrompt.days > 1 ? "S" : ""}
                    </p>
                    <h2 className="mt-2 text-base font-bold">休むと決めた？</h2>
                    <p className="mt-2 text-xs leading-6 text-[#92a5a7]">
                      記録がない日は、自動で「おやすみの日」になりました。
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
                  <button
                    type="button"
                    onClick={() => answerRest(true)}
                    className="rounded-md border-2 border-[#00E5FF] bg-[#00E5FF] px-4 py-3 text-xs font-bold text-[#061012] transition-transform active:translate-y-0.5"
                  >
                    うん、休むと決めた
                  </button>
                  <button
                    type="button"
                    onClick={() => answerRest(false)}
                    className="rounded-md border-2 border-[#34484a] px-4 py-3 text-xs text-[#9aabad] hover:border-[#00E5FF]/60"
                  >
                    ちがう
                  </button>
                </div>
                <p className="mt-3 text-[10px] text-[#607174]">
                  どちらを選んでもポイントは減りません
                </p>
              </motion.section>
            )}

            {restResult && (
              <div className="mb-5 flex items-center gap-3 rounded-md border-2 border-primary/50 bg-[#18241e] px-4 py-3 text-xs text-primary">
                <Check size={15} />
                {restResult}
              </div>
            )}

            <div className="mb-4 flex items-end justify-between border-b-2 border-[#2a302d] pb-3">
              <div>
                <p className="text-[10px] tracking-[0.2em] text-[#68736d]">
                  TODAY&apos;S OUTPUT
                </p>
                <p className="mt-1 text-xs text-[#9aa39e]">
                  小さくても、ここに置いておく
                </p>
              </div>
              <span className="text-[10px] text-[#68736d]">
                {String(logs.length).padStart(2, "0")} LOGS
              </span>
            </div>

            {logs.length === 0 ? (
              <div className="grid min-h-52 place-items-center rounded-md border-2 border-dashed border-[#303733] px-6 text-center">
                <div>
                  <span className="mx-auto mb-4 block h-2 w-2 bg-primary shadow-[0_0_16px_rgba(41,204,122,0.65)]" />
                  <p className="text-sm text-[#a4ada8]">まだ何もなくて大丈夫。</p>
                  <p className="mt-2 text-xs text-[#626d67]">
                    今日の意思を、ひとつだけ。
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log, index) => {
                  const completed = log.completed;
                  return (
                    <motion.article
                      key={log.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`group rounded-md border-2 p-4 transition-colors ${
                        completed
                          ? "border-primary/70 bg-[#18241e]"
                          : "border-border bg-card hover:border-[#4b5650]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => willLog.completeLog(log.id)}
                          className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-[4px] border-2 transition-colors ${
                            completed
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-[#4a554f] text-transparent hover:border-primary"
                          }`}
                          aria-label={completed ? "完了済み" : "完了にする"}
                        >
                          <Check size={14} strokeWidth={3} />
                        </button>
                        <button
                          type="button"
                          onClick={() => willLog.completeLog(log.id)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <p
                            className={`break-words text-sm leading-6 ${
                              completed ? "text-[#d6e7de]" : "text-[#d4d8d6]"
                            }`}
                          >
                            {log.task}
                          </p>
                          <div className="mt-3 flex items-center gap-3 text-[10px] text-[#66716b]">
                            <span>#{String(logs.length - index).padStart(2, "0")}</span>
                            <span>{log.timestamp}</span>
                            {completed && (
                              <span className="text-primary">&gt; 200 OK</span>
                            )}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => willLog.removeLog(log.id)}
                          className="text-[#515b56] opacity-40 transition-all hover:text-[#ff7474] group-hover:opacity-100"
                          aria-label="記録を削除"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </main>

          <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-border bg-background/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur-md lg:absolute sm:px-7">
            <div className="mx-auto flex max-w-[636px] gap-2">
              <button
                type="button"
                onClick={() => setShowVenting(true)}
                className="grid size-12 shrink-0 place-items-center rounded-md border-2 border-[#8A63D2]/60 bg-[#211a2d] text-[#a889e0] transition-colors hover:border-[#a889e0]"
                aria-label="吐き出しモード"
              >
                <span className="text-[10px] font-bold">NULL</span>
              </button>
              <form onSubmit={addLog} className="flex min-w-0 flex-1 gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="> 意思を入力..."
                  className="min-w-0 flex-1 rounded-md border-2 border-border bg-input-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-[#606a65] focus:border-primary"
                  aria-label="意思を入力"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="grid size-12 shrink-0 place-items-center rounded-md border-2 border-primary bg-primary text-primary-foreground transition-all hover:bg-[#35dd8a] disabled:border-[#343b37] disabled:bg-[#252a27] disabled:text-[#5d6862]"
                  aria-label="記録する"
                >
                  <ArrowUp size={19} strokeWidth={2.5} />
                </button>
              </form>
            </div>
            <p className="mx-auto mt-2 max-w-[636px] text-[9px] text-[#535d57]">
              {saveError
                ? "いまは保存できていません。通信が戻ると自動で送られます。"
                : "NULL = 吐き出す / ENTER = 記録する"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
