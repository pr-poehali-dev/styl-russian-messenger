import { useState } from "react";
import Icon from "@/components/ui/icon";

type Section = "chats" | "channels" | "contacts" | "notifications" | "profile" | "settings";

interface Message {
  id: number;
  text: string;
  time: string;
  own: boolean;
  pinned?: boolean;
  voice?: boolean;
}

interface Chat {
  id: number;
  name: string;
  lastMsg: string;
  time: string;
  unread: number;
  online: boolean;
  pinned?: boolean;
  favorite?: boolean;
  initials: string;
}

interface Channel {
  id: number;
  name: string;
  members: number;
  lastPost: string;
  initials: string;
}

interface Contact {
  id: number;
  name: string;
  role: string;
  online: boolean;
  initials: string;
  favorite?: boolean;
}

const CHATS: Chat[] = [
  { id: 1, name: "Александр Громов", lastMsg: "Документы получены, рассматриваем.", time: "14:32", unread: 3, online: true, pinned: true, favorite: true, initials: "АГ" },
  { id: 2, name: "Совет директоров", lastMsg: "Собрание в пятницу в 15:00", time: "13:10", unread: 1, online: false, pinned: true, initials: "СД" },
  { id: 3, name: "Елена Соколова", lastMsg: "Отчёт подготовлю к утру.", time: "11:48", unread: 0, online: true, initials: "ЕС" },
  { id: 4, name: "Юридический отдел", lastMsg: "Договор на проверке у советника.", time: "10:05", unread: 0, online: false, initials: "ЮО" },
  { id: 5, name: "Михаил Ветров", lastMsg: "🎤 Голосовое сообщение", time: "вчера", unread: 0, online: false, initials: "МВ" },
  { id: 6, name: "Финансы", lastMsg: "Бюджет Q2 утверждён.", time: "вчера", unread: 0, online: false, initials: "Фн" },
];

const MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 1, text: "Александр, добрый день. Передаю пакет документов по сделке.", time: "14:10", own: true },
    { id: 2, text: "Получил. Изучаем. Есть вопросы по разделу 4.", time: "14:20", own: false },
    { id: 3, text: "Готов ответить. Уточните, пожалуйста, что именно вызвало вопросы.", time: "14:25", own: true },
    { id: 4, text: "Документы получены, рассматриваем.", time: "14:32", own: false, pinned: true },
  ],
  2: [
    { id: 1, text: "Коллеги, напоминаю о собрании совета в пятницу.", time: "12:00", own: false },
    { id: 2, text: "Подтверждаю участие.", time: "13:10", own: true },
  ],
};

const CHANNELS: Channel[] = [
  { id: 1, name: "Корпоративные новости", members: 1240, lastPost: "Итоги квартала опубликованы сегодня в 12:00", initials: "КН" },
  { id: 2, name: "Аналитика рынка", members: 540, lastPost: "Обзор за 10 мая 2026 — ключевые тренды недели", initials: "АР" },
  { id: 3, name: "Регуляторные изменения", members: 320, lastPost: "Новые требования ЦБ: срок вступления — июль 2026", initials: "РИ" },
];

const CONTACTS: Contact[] = [
  { id: 1, name: "Александр Громов", role: "Генеральный директор", online: true, initials: "АГ", favorite: true },
  { id: 2, name: "Елена Соколова", role: "Финансовый директор", online: true, initials: "ЕС", favorite: true },
  { id: 3, name: "Михаил Ветров", role: "Советник по правовым вопросам", online: false, initials: "МВ" },
  { id: 4, name: "Ольга Нестерова", role: "Руководитель аналитики", online: false, initials: "ОН" },
  { id: 5, name: "Дмитрий Кравцов", role: "Партнёр, внешний контакт", online: false, initials: "ДК" },
];

const NAV_ITEMS: { id: Section; icon: string; label: string }[] = [
  { id: "chats", icon: "MessageSquare", label: "Чаты" },
  { id: "channels", icon: "Radio", label: "Каналы" },
  { id: "contacts", icon: "Users", label: "Контакты" },
  { id: "notifications", icon: "Bell", label: "Уведом." },
  { id: "profile", icon: "User", label: "Профиль" },
  { id: "settings", icon: "Settings", label: "Настройки" },
];

function Avatar({ initials, size = "md", online }: { initials: string; size?: "sm" | "md" | "lg"; online?: boolean }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg" };
  return (
    <div className="relative flex-shrink-0">
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold font-display`}
        style={{ background: "hsl(var(--accent))", color: "hsl(var(--gold))", border: "1px solid hsl(var(--gold) / 0.25)" }}
      >
        {initials}
      </div>
      {online !== undefined && (
        <span
          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
          style={{ background: online ? "#4ade80" : "hsl(var(--muted-foreground))", borderColor: "hsl(var(--sidebar-background))" }}
        />
      )}
    </div>
  );
}

function SearchBar({ placeholder }: { placeholder: string }) {
  return (
    <div className="relative mx-4 my-3">
      <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--muted-foreground))" }} />
      <input
        className="w-full pl-8 pr-3 py-2 text-sm rounded outline-none"
        style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--divider))" }}
        placeholder={placeholder}
      />
    </div>
  );
}

export default function Index() {
  const [section, setSection] = useState<Section>("chats");
  const [activeChat, setActiveChat] = useState<number | null>(1);
  const [filter, setFilter] = useState<"all" | "pinned" | "favorite">("all");
  const [msgInput, setMsgInput] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [messages, setMessages] = useState(MESSAGES);

  const filteredChats = CHATS.filter(c => {
    if (filter === "pinned") return c.pinned;
    if (filter === "favorite") return c.favorite;
    return true;
  });

  const currentChat = activeChat ? CHATS.find(c => c.id === activeChat) : null;
  const currentMessages = activeChat ? (messages[activeChat] || []) : [];
  const pinnedMsg = currentMessages.find(m => m.pinned);

  function sendMessage() {
    if (!msgInput.trim() || !activeChat) return;
    const newMsg: Message = {
      id: Date.now(),
      text: msgInput.trim(),
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      own: true,
    };
    setMessages(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), newMsg] }));
    setMsgInput("");
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "hsl(var(--chat-bg))" }}>

      {/* Sidebar nav */}
      <nav
        className="flex flex-col items-center py-4 w-16 flex-shrink-0"
        style={{ background: "hsl(var(--sidebar-background))", borderRight: "1px solid hsl(var(--sidebar-border))" }}
      >
        <div className="mb-6 flex flex-col items-center select-none">
          <span className="font-display text-2xl font-semibold tracking-widest" style={{ color: "hsl(var(--gold))" }}>С</span>
          <span className="text-[8px] tracking-[0.25em] uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>тел</span>
        </div>

        <div className="flex flex-col gap-0.5 flex-1 w-full">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`nav-item w-full ${section === item.id ? "active" : ""}`}
            >
              <Icon name={item.icon} size={18} />
              <span className="text-[9px] tracking-wide uppercase">{item.label}</span>
              {item.id === "notifications" && (
                <span className="absolute top-1.5 right-1.5 badge-unread">4</span>
              )}
            </button>
          ))}
        </div>

        <button className="mt-4 mb-1">
          <Avatar initials="ВП" size="sm" online={true} />
        </button>
      </nav>

      {/* Left panel */}
      <aside
        className="w-72 flex flex-col flex-shrink-0"
        style={{ background: "hsl(var(--panel))", borderRight: "1px solid hsl(var(--divider))" }}
      >

        {section === "chats" && (
          <>
            <div className="px-4 pt-5 pb-1">
              <h2 className="font-display text-2xl font-semibold" style={{ color: "hsl(var(--foreground))" }}>Сообщения</h2>
            </div>
            <SearchBar placeholder="Поиск по чатам..." />

            <div className="flex gap-1 px-4 mb-2">
              {([["all", "Все"], ["pinned", "Закрепл."], ["favorite", "Избр."]] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className="text-xs px-2.5 py-1 rounded transition-all"
                  style={{
                    background: filter === key ? "hsl(var(--gold))" : "hsl(var(--secondary))",
                    color: filter === key ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredChats.map((chat, i) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`chat-row animate-fade-in ${activeChat === chat.id ? "active" : ""}`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <Avatar initials={chat.initials} online={chat.online} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate" style={{ color: "hsl(var(--foreground))" }}>
                        {chat.pinned && (
                          <Icon name="Pin" size={10} className="inline mr-1" style={{ color: "hsl(var(--gold-dim))" }} />
                        )}
                        {chat.name}
                      </span>
                      <span className="text-[10px] ml-1 flex-shrink-0" style={{ color: "hsl(var(--muted-foreground))" }}>{chat.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs truncate" style={{ color: "hsl(var(--muted-foreground))" }}>{chat.lastMsg}</span>
                      {chat.unread > 0
                        ? <span className="badge-unread ml-1">{chat.unread}</span>
                        : chat.favorite && <Icon name="Star" size={10} style={{ color: "hsl(var(--gold-dim))" }} />
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {section === "channels" && (
          <>
            <div className="px-4 pt-5 pb-1">
              <h2 className="font-display text-2xl font-semibold" style={{ color: "hsl(var(--foreground))" }}>Каналы</h2>
            </div>
            <SearchBar placeholder="Поиск каналов..." />
            <div className="flex-1 overflow-y-auto px-3 space-y-2 pt-1">
              {CHANNELS.map((ch, i) => (
                <div
                  key={ch.id}
                  className="p-3 rounded cursor-pointer transition-all hover:bg-secondary animate-fade-in"
                  style={{ animationDelay: `${i * 60}ms`, background: "hsl(var(--secondary))", border: "1px solid hsl(var(--divider))" }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-9 h-9 rounded flex items-center justify-center text-sm font-display font-semibold flex-shrink-0"
                      style={{ background: "hsl(var(--accent))", color: "hsl(var(--gold))" }}
                    >
                      {ch.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>{ch.name}</div>
                      <div className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{ch.members.toLocaleString("ru")} подписчиков</div>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>{ch.lastPost}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {section === "contacts" && (
          <>
            <div className="px-4 pt-5 pb-1">
              <h2 className="font-display text-2xl font-semibold" style={{ color: "hsl(var(--foreground))" }}>Контакты</h2>
            </div>
            <SearchBar placeholder="Поиск контактов..." />
            <div className="flex-1 overflow-y-auto">
              {CONTACTS.map((ct, i) => (
                <div key={ct.id} className="chat-row animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <Avatar initials={ct.initials} online={ct.online} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>{ct.name}</span>
                      {ct.favorite && <Icon name="Star" size={12} style={{ color: "hsl(var(--gold))" }} />}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{ct.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {section === "notifications" && (
          <>
            <div className="px-4 pt-5 pb-3">
              <h2 className="font-display text-2xl font-semibold" style={{ color: "hsl(var(--foreground))" }}>Уведомления</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-4 space-y-2">
              {[
                { icon: "MessageSquare", text: "Александр Громов ответил на документ", time: "14:32" },
                { icon: "Pin", text: "Сообщение закреплено в «Совете директоров»", time: "13:05" },
                { icon: "Star", text: "Елена Соколова добавлена в избранное", time: "11:00" },
                { icon: "File", text: "Новый файл в «Юридическом отделе»", time: "вчера" },
              ].map((n, i) => (
                <div
                  key={i}
                  className="flex gap-3 p-3 rounded animate-fade-in"
                  style={{ animationDelay: `${i * 60}ms`, background: "hsl(var(--secondary))", border: "1px solid hsl(var(--divider))" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "hsl(var(--accent))" }}
                  >
                    <Icon name={n.icon} size={14} style={{ color: "hsl(var(--gold))" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--foreground))" }}>{n.text}</p>
                    <span className="text-[10px] mt-1 block" style={{ color: "hsl(var(--muted-foreground))" }}>{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {section === "profile" && (
          <>
            <div className="px-4 pt-5 pb-3">
              <h2 className="font-display text-2xl font-semibold" style={{ color: "hsl(var(--foreground))" }}>Профиль</h2>
            </div>
            <div className="flex flex-col items-center px-4 pt-4 gap-3">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-display font-semibold pulse-gold"
                style={{ background: "hsl(var(--accent))", color: "hsl(var(--gold))", border: "2px solid hsl(var(--gold) / 0.4)" }}
              >
                ВП
              </div>
              <div className="text-center">
                <div className="font-display text-lg font-semibold" style={{ color: "hsl(var(--foreground))" }}>Василий Петров</div>
                <div className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>Управляющий партнёр</div>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#4ade80" }} />
                  <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>В сети</span>
                </div>
              </div>
              <div className="w-full mt-2 space-y-0">
                {[
                  ["Должность", "Управляющий партнёр"],
                  ["Отдел", "Стратегическое управление"],
                  ["Телефон", "+7 (495) 000-00-00"],
                  ["Email", "v.petrov@stel.ru"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between items-start py-2.5"
                    style={{ borderBottom: "1px solid hsl(var(--divider))" }}
                  >
                    <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{k}</span>
                    <span className="text-xs font-medium text-right ml-4" style={{ color: "hsl(var(--foreground))" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {section === "settings" && (
          <>
            <div className="px-4 pt-5 pb-3">
              <h2 className="font-display text-2xl font-semibold" style={{ color: "hsl(var(--foreground))" }}>Настройки</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-3 space-y-1">
              {[
                { icon: "Bell", label: "Уведомления", desc: "Звуки и оповещения" },
                { icon: "Lock", label: "Конфиденциальность", desc: "Шифрование и доступ" },
                { icon: "Palette", label: "Оформление", desc: "Тема и интерфейс" },
                { icon: "Shield", label: "Безопасность", desc: "Двухфакторная защита" },
                { icon: "HardDrive", label: "Хранилище", desc: "Файлы и кэш" },
                { icon: "LogOut", label: "Выйти", desc: "Завершить сессию" },
              ].map((s, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 p-3 rounded text-left transition-all hover:bg-secondary animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: "hsl(var(--accent))" }}
                  >
                    <Icon name={s.icon} size={14} style={{ color: "hsl(var(--gold))" }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>{s.label}</div>
                    <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{s.desc}</div>
                  </div>
                  <Icon name="ChevronRight" size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
                </button>
              ))}
            </div>
          </>
        )}
      </aside>

      {/* Main area */}
      <main className="flex-1 flex flex-col min-w-0">
        {currentChat && section === "chats" ? (
          <>
            {/* Header */}
            <header
              className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
              style={{ background: "hsl(var(--panel))", borderBottom: "1px solid hsl(var(--divider))" }}
            >
              <Avatar initials={currentChat.initials} online={currentChat.online} />
              <div className="flex-1">
                <div className="font-medium text-sm" style={{ color: "hsl(var(--foreground))" }}>{currentChat.name}</div>
                <div className="text-xs" style={{ color: currentChat.online ? "#4ade80" : "hsl(var(--muted-foreground))" }}>
                  {currentChat.online ? "В сети" : "Не в сети"}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {[
                  { icon: "Search", label: "Поиск" },
                  { icon: "Phone", label: "Звонок" },
                ].map(btn => (
                  <button
                    key={btn.icon}
                    className="p-1.5 rounded transition-all hover:bg-secondary"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                    title={btn.label}
                  >
                    <Icon name={btn.icon} size={16} />
                  </button>
                ))}
                <button
                  onClick={() => setShowInfo(v => !v)}
                  className="p-1.5 rounded transition-all hover:bg-secondary"
                  style={{ color: showInfo ? "hsl(var(--gold))" : "hsl(var(--muted-foreground))" }}
                  title="Информация"
                >
                  <Icon name="Info" size={16} />
                </button>
              </div>
            </header>

            {/* Pinned */}
            {pinnedMsg && (
              <div
                className="flex items-center gap-2 px-5 py-2 text-xs flex-shrink-0"
                style={{ background: "hsl(var(--accent))", borderBottom: "1px solid hsl(var(--gold) / 0.2)" }}
              >
                <Icon name="Pin" size={11} style={{ color: "hsl(var(--gold))" }} />
                <span style={{ color: "hsl(var(--gold))" }}>Закреплено:</span>
                <span className="truncate" style={{ color: "hsl(var(--muted-foreground))" }}>{pinnedMsg.text}</span>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {currentMessages.map((msg, i) => (
                <div
                  key={msg.id}
                  className={`flex animate-fade-in ${msg.own ? "justify-end" : "justify-start"}`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {!msg.own && <Avatar initials={currentChat.initials} size="sm" />}
                  <div className={`max-w-[65%] ${msg.own ? "ml-2" : "ml-2"}`}>
                    <div
                      className="px-4 py-2.5 text-sm leading-relaxed"
                      style={{
                        background: msg.own ? "hsl(var(--msg-own))" : "hsl(var(--msg-other))",
                        color: "hsl(var(--foreground))",
                        border: `1px solid ${msg.own ? "hsl(var(--gold) / 0.15)" : "hsl(var(--divider))"}`,
                        borderRadius: "2px",
                      }}
                    >
                      {msg.voice ? (
                        <div className="flex items-center gap-2">
                          <button
                            className="w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: "hsl(var(--gold))" }}
                          >
                            <Icon name="Play" size={10} style={{ color: "hsl(var(--primary-foreground))" }} />
                          </button>
                          <div className="flex gap-0.5 items-end h-5">
                            {[3, 5, 4, 7, 6, 3, 5, 8, 4, 6].map((h, j) => (
                              <div key={j} className="w-0.5 rounded-full" style={{ height: `${h * 2}px`, background: "hsl(var(--gold-dim))" }} />
                            ))}
                          </div>
                          <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>0:12</span>
                        </div>
                      ) : msg.text}
                    </div>
                    <div
                      className={`text-[10px] mt-1 flex items-center gap-1 ${msg.own ? "justify-end" : "justify-start"}`}
                      style={{ color: "hsl(var(--muted-foreground))" }}
                    >
                      {msg.time}
                      {msg.own && <Icon name="CheckCheck" size={11} style={{ color: "hsl(var(--gold-dim))" }} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div
              className="px-4 py-3 flex items-center gap-2 flex-shrink-0"
              style={{ background: "hsl(var(--panel))", borderTop: "1px solid hsl(var(--divider))" }}
            >
              <button className="p-2 rounded transition-all hover:bg-secondary" style={{ color: "hsl(var(--muted-foreground))" }}>
                <Icon name="Paperclip" size={16} />
              </button>
              <input
                className="flex-1 py-2 px-4 text-sm outline-none transition-all"
                style={{
                  background: "hsl(var(--secondary))",
                  color: "hsl(var(--foreground))",
                  border: "1px solid hsl(var(--divider))",
                  borderRadius: "2px",
                }}
                placeholder="Введите сообщение..."
                value={msgInput}
                onChange={e => setMsgInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
              />
              <button className="p-2 rounded transition-all hover:bg-secondary" style={{ color: "hsl(var(--muted-foreground))" }}>
                <Icon name="Mic" size={16} />
              </button>
              <button
                onClick={sendMessage}
                className="p-2.5 rounded transition-all"
                style={{ background: "hsl(var(--gold))", color: "hsl(var(--primary-foreground))", borderRadius: "2px" }}
              >
                <Icon name="Send" size={15} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in select-none">
            <div className="font-display text-8xl font-semibold tracking-widest mb-4" style={{ color: "hsl(var(--gold) / 0.12)" }}>
              СТЕЛ
            </div>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              {section === "chats" ? "Выберите диалог для начала общения" : "Раздел открыт на панели слева"}
            </p>
          </div>
        )}
      </main>

      {/* Right info panel */}
      {showInfo && currentChat && section === "chats" && (
        <aside
          className="w-64 flex flex-col flex-shrink-0 animate-slide-in-right"
          style={{ background: "hsl(var(--panel))", borderLeft: "1px solid hsl(var(--divider))" }}
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-3" style={{ borderBottom: "1px solid hsl(var(--divider))" }}>
            <span className="text-xs uppercase tracking-widest font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Информация</span>
            <button onClick={() => setShowInfo(false)} style={{ color: "hsl(var(--muted-foreground))" }}>
              <Icon name="X" size={14} />
            </button>
          </div>

          <div className="flex flex-col items-center px-4 py-5 gap-2" style={{ borderBottom: "1px solid hsl(var(--divider))" }}>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center font-display text-xl font-semibold"
              style={{ background: "hsl(var(--accent))", color: "hsl(var(--gold))", border: "1px solid hsl(var(--gold) / 0.3)" }}
            >
              {currentChat.initials}
            </div>
            <div className="font-display text-base font-semibold text-center" style={{ color: "hsl(var(--foreground))" }}>
              {currentChat.name}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: currentChat.online ? "#4ade80" : "hsl(var(--muted-foreground))" }} />
              <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{currentChat.online ? "В сети" : "Не в сети"}</span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-1 px-3 py-3" style={{ borderBottom: "1px solid hsl(var(--divider))" }}>
            {[
              { icon: "Phone", label: "Звонок" },
              { icon: "Star", label: "Избранное" },
              { icon: "Bell", label: "Тихо" },
            ].map(a => (
              <button key={a.icon} className="flex flex-col items-center gap-1 py-2 rounded transition-all hover:bg-secondary">
                <Icon name={a.icon} size={15} style={{ color: "hsl(var(--gold))" }} />
                <span className="text-[9px] uppercase tracking-wide" style={{ color: "hsl(var(--muted-foreground))" }}>{a.label}</span>
              </button>
            ))}
          </div>

          {/* Shared files */}
          <div className="px-4 pt-3 pb-2">
            <div className="text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Файлы</div>
            <div className="space-y-1.5">
              {[
                { icon: "FileText", name: "Договор_сделка.pdf", size: "340 КБ" },
                { icon: "FileSpreadsheet", name: "Отчёт_Q1_2026.xlsx", size: "128 КБ" },
                { icon: "File", name: "Приложение_1.docx", size: "85 КБ" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded cursor-pointer transition-all hover:bg-secondary">
                  <Icon name={f.icon} size={14} style={{ color: "hsl(var(--gold-dim))" }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs truncate" style={{ color: "hsl(var(--foreground))" }}>{f.name}</div>
                    <div className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>{f.size}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pinned messages */}
          <div className="px-4 pt-2 pb-3">
            <div className="text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Закреплённые</div>
            {currentMessages.filter(m => m.pinned).length === 0 ? (
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Нет закреплённых</p>
            ) : (
              currentMessages.filter(m => m.pinned).map(m => (
                <div key={m.id} className="p-2 rounded text-xs" style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))" }}>
                  {m.text}
                </div>
              ))
            )}
          </div>
        </aside>
      )}
    </div>
  );
}