import { useState } from "react";
import Icon from "@/components/ui/icon";

const CORRECT = "io89io89";

type AdminTab = "accounts" | "chats" | "channels" | "logs";

interface Account {
  id: number;
  name: string;
  role: string;
  initials: string;
  status: "active" | "blocked" | "suspended";
  registered: string;
  lastSeen: string;
  chats: number;
}

interface ChatRecord {
  id: number;
  name: string;
  type: "personal" | "group";
  members: number;
  messages: number;
  created: string;
  status: "active" | "archived" | "blocked";
}

const ACCOUNTS: Account[] = [
  { id: 1, name: "Александр Громов", role: "Генеральный директор", initials: "АГ", status: "active", registered: "12.01.2026", lastSeen: "сегодня, 14:32", chats: 18 },
  { id: 2, name: "Елена Соколова", role: "Финансовый директор", initials: "ЕС", status: "active", registered: "15.01.2026", lastSeen: "сегодня, 11:48", chats: 12 },
  { id: 3, name: "Михаил Ветров", role: "Советник", initials: "МВ", status: "active", registered: "20.01.2026", lastSeen: "вчера, 18:00", chats: 7 },
  { id: 4, name: "Ольга Нестерова", role: "Руководитель аналитики", initials: "ОН", status: "suspended", registered: "25.01.2026", lastSeen: "3 дня назад", chats: 4 },
  { id: 5, name: "Дмитрий Кравцов", role: "Внешний партнёр", initials: "ДК", status: "blocked", registered: "02.02.2026", lastSeen: "неделю назад", chats: 2 },
  { id: 6, name: "Василий Петров", role: "Управляющий партнёр", initials: "ВП", status: "active", registered: "10.01.2026", lastSeen: "сейчас", chats: 24 },
];

const CHATS_DATA: ChatRecord[] = [
  { id: 1, name: "Совет директоров", type: "group", members: 8, messages: 342, created: "12.01.2026", status: "active" },
  { id: 2, name: "Юридический отдел", type: "group", members: 5, messages: 187, created: "15.01.2026", status: "active" },
  { id: 3, name: "Финансы", type: "group", members: 6, messages: 512, created: "12.01.2026", status: "active" },
  { id: 4, name: "Александр Громов — Елена Соколова", type: "personal", members: 2, messages: 94, created: "18.01.2026", status: "active" },
  { id: 5, name: "Устаревший проект 2025", type: "group", members: 3, messages: 28, created: "01.11.2025", status: "archived" },
];

const STATUS_LABELS: Record<string, string> = {
  active: "Активен",
  blocked: "Заблокирован",
  suspended: "Приостановлен",
  archived: "Архив",
};

const STATUS_COLORS: Record<string, string> = {
  active: "#4ade80",
  blocked: "#f87171",
  suspended: "#fbbf24",
  archived: "hsl(var(--muted-foreground))",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide"
      style={{ background: `${STATUS_COLORS[status]}18`, color: STATUS_COLORS[status], border: `1px solid ${STATUS_COLORS[status]}40` }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<AdminTab>("accounts");
  const [accounts, setAccounts] = useState(ACCOUNTS);
  const [chats, setChats] = useState(CHATS_DATA);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatRecord | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ label: string; fn: () => void } | null>(null);

  function login() {
    if (pwd === CORRECT) {
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
      setPwd("");
    }
  }

  function setAccountStatus(id: number, status: Account["status"]) {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    setSelectedAccount(prev => prev?.id === id ? { ...prev, status } : prev);
    setConfirmAction(null);
  }

  function deleteAccount(id: number) {
    setAccounts(prev => prev.filter(a => a.id !== id));
    setSelectedAccount(null);
    setConfirmAction(null);
  }

  function setChatStatus(id: number, status: ChatRecord["status"]) {
    setChats(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    setSelectedChat(prev => prev?.id === id ? { ...prev, status } : prev);
    setConfirmAction(null);
  }

  function deleteChat(id: number) {
    setChats(prev => prev.filter(c => c.id !== id));
    setSelectedChat(null);
    setConfirmAction(null);
  }

  const TABS: { id: AdminTab; icon: string; label: string }[] = [
    { id: "accounts", icon: "Users", label: "Аккаунты" },
    { id: "chats", icon: "MessageSquare", label: "Чаты" },
    { id: "channels", icon: "Radio", label: "Каналы" },
    { id: "logs", icon: "ScrollText", label: "Журнал" },
  ];

  if (!authed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "hsl(var(--chat-bg))" }}
      >
        <div className="w-80 animate-scale-in">
          <div className="text-center mb-8">
            <div className="font-display text-5xl font-semibold tracking-[0.2em] mb-1" style={{ color: "hsl(var(--gold))" }}>СТЕЛ</div>
            <div className="text-xs tracking-[0.4em] uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>Административный доступ</div>
          </div>

          <div
            className="p-6 rounded"
            style={{ background: "hsl(var(--panel))", border: "1px solid hsl(var(--divider))" }}
          >
            <div className="mb-4">
              <input
                type="password"
                className="w-full py-2.5 px-4 text-sm outline-none rounded"
                style={{
                  background: "hsl(var(--secondary))",
                  color: "hsl(var(--foreground))",
                  border: `1px solid ${error ? "#f87171" : "hsl(var(--divider))"}`,
                  letterSpacing: "0.15em",
                }}
                placeholder="••••••••"
                value={pwd}
                onChange={e => { setPwd(e.target.value); setError(false); }}
                onKeyDown={e => e.key === "Enter" && login()}
                autoFocus
              />
              {error && (
                <p className="text-xs mt-2" style={{ color: "#f87171" }}>Неверный пароль</p>
              )}
            </div>
            <button
              onClick={login}
              className="w-full py-2.5 text-sm font-medium tracking-wide rounded transition-all hover:opacity-90"
              style={{ background: "hsl(var(--gold))", color: "hsl(var(--primary-foreground))" }}
            >
              Войти
            </button>
          </div>

          <div className="text-center mt-4">
            <a href="/" className="text-xs transition-all hover:opacity-80" style={{ color: "hsl(var(--muted-foreground))" }}>
              ← Вернуться в СТЕЛ
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "hsl(var(--chat-bg))" }}>

      {/* Confirm modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="w-72 p-6 rounded animate-scale-in" style={{ background: "hsl(var(--panel))", border: "1px solid hsl(var(--divider))" }}>
            <div className="font-display text-lg font-semibold mb-2" style={{ color: "hsl(var(--foreground))" }}>Подтверждение</div>
            <p className="text-sm mb-5" style={{ color: "hsl(var(--muted-foreground))" }}>
              {confirmAction.label}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2 text-sm rounded transition-all"
                style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))" }}
              >
                Отмена
              </button>
              <button
                onClick={confirmAction.fn}
                className="flex-1 py-2 text-sm rounded transition-all"
                style={{ background: "#f87171", color: "#fff" }}
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <nav
        className="flex flex-col py-5 w-52 flex-shrink-0"
        style={{ background: "hsl(var(--sidebar-background))", borderRight: "1px solid hsl(var(--sidebar-border))" }}
      >
        <div className="px-5 mb-6">
          <div className="font-display text-xl font-semibold tracking-widest" style={{ color: "hsl(var(--gold))" }}>СТЕЛ</div>
          <div className="text-[9px] uppercase tracking-[0.3em] mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>Панель управления</div>
        </div>

        <div className="flex flex-col gap-0.5 px-2 flex-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSelectedAccount(null); setSelectedChat(null); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-left transition-all ${tab === t.id ? "active" : ""}`}
              style={{
                background: tab === t.id ? "hsl(var(--accent))" : "transparent",
                color: tab === t.id ? "hsl(var(--gold))" : "hsl(var(--muted-foreground))",
                border: tab === t.id ? "1px solid hsl(var(--gold) / 0.2)" : "1px solid transparent",
              }}
            >
              <Icon name={t.icon} size={15} />
              <span className="text-sm">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="px-5 pt-4" style={{ borderTop: "1px solid hsl(var(--sidebar-border))" }}>
          <div className="text-xs mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Вы вошли как</div>
          <div className="text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>Администратор</div>
          <button
            onClick={() => { setAuthed(false); setPwd(""); }}
            className="flex items-center gap-1.5 mt-3 text-xs transition-all hover:opacity-80"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            <Icon name="LogOut" size={12} />
            Выйти
          </button>
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 flex min-w-0">

        {/* List panel */}
        <div
          className="w-80 flex flex-col flex-shrink-0"
          style={{ background: "hsl(var(--panel))", borderRight: "1px solid hsl(var(--divider))" }}
        >
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-px flex-shrink-0" style={{ borderBottom: "1px solid hsl(var(--divider))", background: "hsl(var(--divider))" }}>
            {tab === "accounts" && [
              { label: "Всего", val: accounts.length },
              { label: "Активны", val: accounts.filter(a => a.status === "active").length },
              { label: "Блок.", val: accounts.filter(a => a.status !== "active").length },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center py-3" style={{ background: "hsl(var(--panel))" }}>
                <span className="font-display text-xl font-semibold" style={{ color: "hsl(var(--gold))" }}>{s.val}</span>
                <span className="text-[9px] uppercase tracking-wide" style={{ color: "hsl(var(--muted-foreground))" }}>{s.label}</span>
              </div>
            ))}
            {tab === "chats" && [
              { label: "Всего", val: chats.length },
              { label: "Активны", val: chats.filter(c => c.status === "active").length },
              { label: "Архив", val: chats.filter(c => c.status !== "active").length },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center py-3" style={{ background: "hsl(var(--panel))" }}>
                <span className="font-display text-xl font-semibold" style={{ color: "hsl(var(--gold))" }}>{s.val}</span>
                <span className="text-[9px] uppercase tracking-wide" style={{ color: "hsl(var(--muted-foreground))" }}>{s.label}</span>
              </div>
            ))}
            {(tab === "channels" || tab === "logs") && (
              <div className="col-span-3 flex items-center justify-center py-3" style={{ background: "hsl(var(--panel))" }}>
                <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Раздел в разработке</span>
              </div>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {tab === "accounts" && accounts.map((acc, i) => (
              <div
                key={acc.id}
                onClick={() => setSelectedAccount(acc)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-b animate-fade-in"
                style={{
                  borderColor: "hsl(var(--divider))",
                  background: selectedAccount?.id === acc.id ? "hsl(var(--accent))" : "transparent",
                  animationDelay: `${i * 40}ms`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-display font-semibold flex-shrink-0"
                  style={{ background: "hsl(var(--accent))", color: "hsl(var(--gold))", border: "1px solid hsl(var(--gold) / 0.2)" }}
                >
                  {acc.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-medium truncate" style={{ color: "hsl(var(--foreground))" }}>{acc.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge status={acc.status} />
                  </div>
                </div>
              </div>
            ))}

            {tab === "chats" && chats.map((ch, i) => (
              <div
                key={ch.id}
                onClick={() => setSelectedChat(ch)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-b animate-fade-in"
                style={{
                  borderColor: "hsl(var(--divider))",
                  background: selectedChat?.id === ch.id ? "hsl(var(--accent))" : "transparent",
                  animationDelay: `${i * 40}ms`,
                }}
              >
                <div
                  className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0"
                  style={{ background: "hsl(var(--accent))" }}
                >
                  <Icon name={ch.type === "group" ? "Users" : "User"} size={14} style={{ color: "hsl(var(--gold))" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: "hsl(var(--foreground))" }}>{ch.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge status={ch.status} />
                    <span className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{ch.messages} сообщ.</span>
                  </div>
                </div>
              </div>
            ))}

            {(tab === "channels" || tab === "logs") && (
              <div className="flex flex-col items-center justify-center h-48 gap-2">
                <Icon name="Clock" size={24} style={{ color: "hsl(var(--muted-foreground))" }} />
                <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Скоро</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Account detail */}
          {tab === "accounts" && selectedAccount && (
            <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
              <div className="max-w-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-display font-semibold"
                    style={{ background: "hsl(var(--accent))", color: "hsl(var(--gold))", border: "1px solid hsl(var(--gold) / 0.3)" }}
                  >
                    {selectedAccount.initials}
                  </div>
                  <div>
                    <div className="font-display text-2xl font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                      {selectedAccount.name}
                    </div>
                    <div className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{selectedAccount.role}</div>
                    <div className="mt-1"><StatusBadge status={selectedAccount.status} /></div>
                  </div>
                </div>

                {/* Info grid */}
                <div
                  className="rounded p-4 mb-4 space-y-0"
                  style={{ background: "hsl(var(--panel))", border: "1px solid hsl(var(--divider))" }}
                >
                  {[
                    ["ID аккаунта", `#${selectedAccount.id}`],
                    ["Зарегистрирован", selectedAccount.registered],
                    ["Последняя активность", selectedAccount.lastSeen],
                    ["Активных чатов", String(selectedAccount.chats)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2.5" style={{ borderBottom: "1px solid hsl(var(--divider))" }}>
                      <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{k}</span>
                      <span className="text-xs font-medium" style={{ color: "hsl(var(--foreground))" }}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div
                  className="rounded p-4"
                  style={{ background: "hsl(var(--panel))", border: "1px solid hsl(var(--divider))" }}
                >
                  <div className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Управление аккаунтом
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedAccount.status !== "active" && (
                      <button
                        onClick={() => setConfirmAction({ label: `Активировать аккаунт «${selectedAccount.name}»?`, fn: () => setAccountStatus(selectedAccount.id, "active") })}
                        className="flex items-center gap-2 px-3 py-2.5 rounded text-sm transition-all"
                        style={{ background: "hsl(var(--secondary))", color: "#4ade80", border: "1px solid #4ade8030" }}
                      >
                        <Icon name="CheckCircle" size={14} />
                        Активировать
                      </button>
                    )}
                    {selectedAccount.status !== "suspended" && (
                      <button
                        onClick={() => setConfirmAction({ label: `Приостановить аккаунт «${selectedAccount.name}»?`, fn: () => setAccountStatus(selectedAccount.id, "suspended") })}
                        className="flex items-center gap-2 px-3 py-2.5 rounded text-sm transition-all"
                        style={{ background: "hsl(var(--secondary))", color: "#fbbf24", border: "1px solid #fbbf2430" }}
                      >
                        <Icon name="PauseCircle" size={14} />
                        Приостановить
                      </button>
                    )}
                    {selectedAccount.status !== "blocked" && (
                      <button
                        onClick={() => setConfirmAction({ label: `Заблокировать аккаунт «${selectedAccount.name}»? Пользователь потеряет доступ.`, fn: () => setAccountStatus(selectedAccount.id, "blocked") })}
                        className="flex items-center gap-2 px-3 py-2.5 rounded text-sm transition-all"
                        style={{ background: "hsl(var(--secondary))", color: "#f87171", border: "1px solid #f8717130" }}
                      >
                        <Icon name="Ban" size={14} />
                        Заблокировать
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmAction({ label: `Удалить аккаунт «${selectedAccount.name}» без возможности восстановления?`, fn: () => deleteAccount(selectedAccount.id) })}
                      className="flex items-center gap-2 px-3 py-2.5 rounded text-sm transition-all"
                      style={{ background: "#f8717115", color: "#f87171", border: "1px solid #f8717130" }}
                    >
                      <Icon name="Trash2" size={14} />
                      Удалить аккаунт
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat detail */}
          {tab === "chats" && selectedChat && (
            <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
              <div className="max-w-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-14 h-14 rounded flex items-center justify-center"
                    style={{ background: "hsl(var(--accent))", border: "1px solid hsl(var(--gold) / 0.3)" }}
                  >
                    <Icon name={selectedChat.type === "group" ? "Users" : "User"} size={22} style={{ color: "hsl(var(--gold))" }} />
                  </div>
                  <div>
                    <div className="font-display text-2xl font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                      {selectedChat.name}
                    </div>
                    <div className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {selectedChat.type === "group" ? "Групповой чат" : "Личный диалог"}
                    </div>
                    <div className="mt-1"><StatusBadge status={selectedChat.status} /></div>
                  </div>
                </div>

                <div
                  className="rounded p-4 mb-4"
                  style={{ background: "hsl(var(--panel))", border: "1px solid hsl(var(--divider))" }}
                >
                  {[
                    ["ID чата", `#${selectedChat.id}`],
                    ["Участников", String(selectedChat.members)],
                    ["Сообщений", String(selectedChat.messages)],
                    ["Создан", selectedChat.created],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2.5" style={{ borderBottom: "1px solid hsl(var(--divider))" }}>
                      <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{k}</span>
                      <span className="text-xs font-medium" style={{ color: "hsl(var(--foreground))" }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div
                  className="rounded p-4"
                  style={{ background: "hsl(var(--panel))", border: "1px solid hsl(var(--divider))" }}
                >
                  <div className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Управление чатом
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedChat.status !== "active" && (
                      <button
                        onClick={() => setConfirmAction({ label: `Разблокировать чат «${selectedChat.name}»?`, fn: () => setChatStatus(selectedChat.id, "active") })}
                        className="flex items-center gap-2 px-3 py-2.5 rounded text-sm transition-all"
                        style={{ background: "hsl(var(--secondary))", color: "#4ade80", border: "1px solid #4ade8030" }}
                      >
                        <Icon name="Unlock" size={14} />
                        Разблокировать
                      </button>
                    )}
                    {selectedChat.status !== "blocked" && (
                      <button
                        onClick={() => setConfirmAction({ label: `Заблокировать чат «${selectedChat.name}»? Участники не смогут отправлять сообщения.`, fn: () => setChatStatus(selectedChat.id, "blocked") })}
                        className="flex items-center gap-2 px-3 py-2.5 rounded text-sm transition-all"
                        style={{ background: "hsl(var(--secondary))", color: "#f87171", border: "1px solid #f8717130" }}
                      >
                        <Icon name="Lock" size={14} />
                        Заблокировать
                      </button>
                    )}
                    {selectedChat.status !== "archived" && (
                      <button
                        onClick={() => setConfirmAction({ label: `Архивировать чат «${selectedChat.name}»?`, fn: () => setChatStatus(selectedChat.id, "archived") })}
                        className="flex items-center gap-2 px-3 py-2.5 rounded text-sm transition-all"
                        style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--divider))" }}
                      >
                        <Icon name="Archive" size={14} />
                        Архивировать
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmAction({ label: `Удалить чат «${selectedChat.name}» со всей историей сообщений?`, fn: () => deleteChat(selectedChat.id) })}
                      className="flex items-center gap-2 px-3 py-2.5 rounded text-sm transition-all"
                      style={{ background: "#f8717115", color: "#f87171", border: "1px solid #f8717130" }}
                    >
                      <Icon name="Trash2" size={14} />
                      Удалить чат
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {((tab === "accounts" && !selectedAccount) || (tab === "chats" && !selectedChat)) && (
            <div className="flex-1 flex flex-col items-center justify-center animate-fade-in select-none">
              <div className="font-display text-6xl font-semibold tracking-widest mb-3" style={{ color: "hsl(var(--gold) / 0.1)" }}>
                СТЕЛ
              </div>
              <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Выберите запись из списка</p>
            </div>
          )}

          {(tab === "channels" || tab === "logs") && (
            <div className="flex-1 flex flex-col items-center justify-center select-none">
              <Icon name="Clock" size={32} style={{ color: "hsl(var(--gold) / 0.3)" }} />
              <p className="text-sm mt-3" style={{ color: "hsl(var(--muted-foreground))" }}>Раздел в разработке</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
