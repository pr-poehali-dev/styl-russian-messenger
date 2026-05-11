import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

type Section = "chats" | "channels" | "contacts" | "notifications" | "profile" | "settings";
type ChatFilter = "all" | "pinned" | "favorite";

interface Message {
  id: number;
  text: string;
  time: string;
  own: boolean;
  pinned?: boolean;
  voice?: boolean;
  fileUrl?: string;
  fileName?: string;
}

interface Chat {
  id: number;
  name: string;
  initials: string;
  online: boolean;
  pinned: boolean;
  favorite: boolean;
  muted: boolean;
  unread: number;
  lastMsg: string;
  lastTime: string;
  isGroup: boolean;
}

interface Contact {
  id: number;
  name: string;
  initials: string;
  online: boolean;
  favorite: boolean;
}

interface Notification {
  id: number;
  icon: string;
  text: string;
  time: string;
  read: boolean;
}

const NAV: { id: Section; icon: string; label: string }[] = [
  { id: "chats", icon: "MessageSquare", label: "Чаты" },
  { id: "channels", icon: "Radio", label: "Каналы" },
  { id: "contacts", icon: "Users", label: "Контакты" },
  { id: "notifications", icon: "Bell", label: "Уведом." },
  { id: "profile", icon: "User", label: "Профиль" },
  { id: "settings", icon: "Settings", label: "Настройки" },
];

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function nowTime() {
  return new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
}

function Avatar({
  initials, size = "md", online,
}: { initials: string; size?: "sm" | "md" | "lg"; online?: boolean }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-16 h-16 text-xl" };
  return (
    <div className="relative flex-shrink-0">
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold font-display select-none`}
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

function EmptyState({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 select-none animate-fade-in p-8 text-center">
      <Icon name={icon} size={40} style={{ color: "hsl(var(--gold) / 0.2)" }} />
      <div>
        <p className="text-sm font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>{title}</p>
        {sub && <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground) / 0.6)" }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function Index() {
  const [section, setSection] = useState<Section>("chats");
  const [chats, setChats] = useState<Chat[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Record<number, Message[]>>({});
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [filter, setFilter] = useState<ChatFilter>("all");
  const [msgInput, setMsgInput] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewContact, setShowNewContact] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [newChatGroup, setNewChatGroup] = useState(false);
  const [newContactName, setNewContactName] = useState("");

  // Profile edit
  const [profileName, setProfileName] = useState("Имя Фамилия");
  const [profileRole, setProfileRole] = useState("Должность");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileNameDraft, setProfileNameDraft] = useState("");
  const [profileRoleDraft, setProfileRoleDraft] = useState("");

  // Settings toggles
  const [settingSound, setSettingSound] = useState(true);
  const [settingNotify, setSettingNotify] = useState(true);
  const [setting2fa, setSetting2fa] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChat]);

  const currentChat = activeChat !== null ? chats.find(c => c.id === activeChat) ?? null : null;
  const currentMessages = activeChat !== null ? (messages[activeChat] ?? []) : [];
  const pinnedMsg = currentMessages.find(m => m.pinned);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredChats = chats.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "pinned") return c.pinned;
    if (filter === "favorite") return c.favorite;
    return true;
  });

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Actions
  function createChat() {
    if (!newChatName.trim()) return;
    const name = newChatName.trim();
    const id = Date.now();
    const newChat: Chat = {
      id,
      name,
      initials: getInitials(name),
      online: false,
      pinned: false,
      favorite: false,
      muted: false,
      unread: 0,
      lastMsg: "",
      lastTime: "",
      isGroup: newChatGroup,
    };
    setChats(prev => [newChat, ...prev]);
    setMessages(prev => ({ ...prev, [id]: [] }));
    setActiveChat(id);
    setSection("chats");
    setShowNewChat(false);
    setNewChatName("");
    setNewChatGroup(false);
  }

  function createContact() {
    if (!newContactName.trim()) return;
    const name = newContactName.trim();
    const id = Date.now();
    setContacts(prev => [...prev, { id, name, initials: getInitials(name), online: false, favorite: false }]);
    setShowNewContact(false);
    setNewContactName("");
  }

  function sendMessage() {
    if (!msgInput.trim() || activeChat === null) return;
    const msg: Message = {
      id: Date.now(),
      text: msgInput.trim(),
      time: nowTime(),
      own: true,
    };
    setMessages(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] ?? []), msg] }));
    setChats(prev => prev.map(c => c.id === activeChat
      ? { ...c, lastMsg: msg.text, lastTime: msg.time, unread: 0 }
      : c
    ));
    setMsgInput("");
  }

  function togglePin(id: number) {
    setChats(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  }

  function toggleFavorite(id: number) {
    setChats(prev => prev.map(c => c.id === id ? { ...c, favorite: !c.favorite } : c));
  }

  function toggleMute(id: number) {
    setChats(prev => prev.map(c => c.id === id ? { ...c, muted: !c.muted } : c));
  }

  function deleteChat(id: number) {
    setChats(prev => prev.filter(c => c.id !== id));
    setMessages(prev => { const n = { ...prev }; delete n[id]; return n; });
    if (activeChat === id) { setActiveChat(null); setShowInfo(false); }
  }

  function pinMessage(chatId: number, msgId: number) {
    setMessages(prev => ({
      ...prev,
      [chatId]: prev[chatId].map(m => ({ ...m, pinned: m.id === msgId ? !m.pinned : false })),
    }));
  }

  function toggleContactFavorite(id: number) {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, favorite: !c.favorite } : c));
  }

  function deleteContact(id: number) {
    setContacts(prev => prev.filter(c => c.id !== id));
  }

  function startChatWithContact(contact: Contact) {
    const existing = chats.find(c => c.name === contact.name && !c.isGroup);
    if (existing) {
      setActiveChat(existing.id);
      setSection("chats");
      return;
    }
    const id = Date.now();
    const newChat: Chat = {
      id, name: contact.name, initials: contact.initials,
      online: contact.online, pinned: false, favorite: false, muted: false,
      unread: 0, lastMsg: "", lastTime: "", isGroup: false,
    };
    setChats(prev => [newChat, ...prev]);
    setMessages(prev => ({ ...prev, [id]: [] }));
    setActiveChat(id);
    setSection("chats");
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  function saveProfile() {
    if (profileNameDraft.trim()) setProfileName(profileNameDraft.trim());
    if (profileRoleDraft.trim()) setProfileRole(profileRoleDraft.trim());
    setEditingProfile(false);
  }

  const profileInitials = getInitials(profileName);

  // Modal backdrop
  function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)" }} onClick={onClose}>
        <div className="animate-scale-in" onClick={e => e.stopPropagation()}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "hsl(var(--chat-bg))" }}>

      {/* New chat modal */}
      {showNewChat && (
        <Modal onClose={() => setShowNewChat(false)}>
          <div className="w-80 p-6 rounded" style={{ background: "hsl(var(--panel))", border: "1px solid hsl(var(--divider))" }}>
            <div className="font-display text-xl font-semibold mb-4" style={{ color: "hsl(var(--foreground))" }}>Новый чат</div>
            <input
              className="w-full py-2 px-3 text-sm rounded outline-none mb-3"
              style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--divider))" }}
              placeholder="Имя или название группы"
              value={newChatName}
              onChange={e => setNewChatName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createChat()}
              autoFocus
            />
            <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
              <div
                onClick={() => setNewChatGroup(v => !v)}
                className="w-4 h-4 rounded flex items-center justify-center transition-all"
                style={{ background: newChatGroup ? "hsl(var(--gold))" : "hsl(var(--secondary))", border: "1px solid hsl(var(--divider))" }}
              >
                {newChatGroup && <Icon name="Check" size={10} style={{ color: "hsl(var(--primary-foreground))" }} />}
              </div>
              <span className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Групповой чат</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewChat(false)}
                className="flex-1 py-2 text-sm rounded"
                style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))" }}
              >Отмена</button>
              <button
                onClick={createChat}
                className="flex-1 py-2 text-sm rounded font-medium"
                style={{ background: "hsl(var(--gold))", color: "hsl(var(--primary-foreground))" }}
              >Создать</button>
            </div>
          </div>
        </Modal>
      )}

      {/* New contact modal */}
      {showNewContact && (
        <Modal onClose={() => setShowNewContact(false)}>
          <div className="w-80 p-6 rounded" style={{ background: "hsl(var(--panel))", border: "1px solid hsl(var(--divider))" }}>
            <div className="font-display text-xl font-semibold mb-4" style={{ color: "hsl(var(--foreground))" }}>Новый контакт</div>
            <input
              className="w-full py-2 px-3 text-sm rounded outline-none mb-4"
              style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--divider))" }}
              placeholder="Имя Фамилия"
              value={newContactName}
              onChange={e => setNewContactName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createContact()}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewContact(false)}
                className="flex-1 py-2 text-sm rounded"
                style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))" }}
              >Отмена</button>
              <button
                onClick={createContact}
                className="flex-1 py-2 text-sm rounded font-medium"
                style={{ background: "hsl(var(--gold))", color: "hsl(var(--primary-foreground))" }}
              >Добавить</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── NAV ── */}
      <nav
        className="flex flex-col items-center py-4 w-16 flex-shrink-0"
        style={{ background: "hsl(var(--sidebar-background))", borderRight: "1px solid hsl(var(--sidebar-border))" }}
      >
        <div className="mb-6 flex flex-col items-center select-none">
          <span className="font-display text-2xl font-semibold tracking-widest" style={{ color: "hsl(var(--gold))" }}>С</span>
          <span className="text-[8px] tracking-[0.25em] uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>тел</span>
        </div>
        <div className="flex flex-col gap-0.5 flex-1 w-full">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => { setSection(item.id); setSearchQuery(""); }}
              className={`nav-item w-full ${section === item.id ? "active" : ""}`}
            >
              <Icon name={item.icon} size={18} />
              <span className="text-[9px] tracking-wide uppercase">{item.label}</span>
              {item.id === "notifications" && unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 badge-unread">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>
        <button
          className="mt-4 mb-1"
          onClick={() => setSection("profile")}
          title="Профиль"
        >
          <Avatar initials={profileInitials} size="sm" online={true} />
        </button>
      </nav>

      {/* ── LEFT PANEL ── */}
      <aside
        className="w-72 flex flex-col flex-shrink-0"
        style={{ background: "hsl(var(--panel))", borderRight: "1px solid hsl(var(--divider))" }}
      >

        {/* CHATS */}
        {section === "chats" && (
          <>
            <div className="flex items-center justify-between px-4 pt-5 pb-1">
              <h2 className="font-display text-2xl font-semibold" style={{ color: "hsl(var(--foreground))" }}>Сообщения</h2>
              <button
                onClick={() => setShowNewChat(true)}
                className="w-7 h-7 rounded flex items-center justify-center transition-all hover:bg-secondary"
                title="Новый чат"
                style={{ color: "hsl(var(--gold))" }}
              >
                <Icon name="Plus" size={16} />
              </button>
            </div>

            <div className="relative mx-4 my-3">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--muted-foreground))" }} />
              <input
                className="w-full pl-8 pr-3 py-2 text-sm rounded outline-none"
                style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--divider))" }}
                placeholder="Поиск по чатам..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

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
                >{label}</button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredChats.length === 0 ? (
                <EmptyState
                  icon="MessageSquare"
                  title={chats.length === 0 ? "Нет чатов" : "Ничего не найдено"}
                  sub={chats.length === 0 ? "Нажмите + чтобы начать общение" : undefined}
                />
              ) : (
                filteredChats.map((chat, i) => (
                  <div
                    key={chat.id}
                    onClick={() => { setActiveChat(chat.id); setShowInfo(false); }}
                    className={`chat-row animate-fade-in ${activeChat === chat.id ? "active" : ""}`}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <Avatar initials={chat.initials} online={chat.online} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate" style={{ color: "hsl(var(--foreground))" }}>
                          {chat.pinned && <Icon name="Pin" size={10} className="inline mr-1" style={{ color: "hsl(var(--gold-dim))" }} />}
                          {chat.isGroup && <Icon name="Users" size={10} className="inline mr-1" style={{ color: "hsl(var(--muted-foreground))" }} />}
                          {chat.name}
                        </span>
                        <span className="text-[10px] ml-1 flex-shrink-0" style={{ color: "hsl(var(--muted-foreground))" }}>{chat.lastTime}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs truncate" style={{ color: "hsl(var(--muted-foreground))" }}>
                          {chat.lastMsg || "Нет сообщений"}
                        </span>
                        {chat.unread > 0
                          ? <span className="badge-unread ml-1">{chat.unread}</span>
                          : chat.muted
                            ? <Icon name="BellOff" size={10} style={{ color: "hsl(var(--muted-foreground))" }} />
                            : chat.favorite
                              ? <Icon name="Star" size={10} style={{ color: "hsl(var(--gold-dim))" }} />
                              : null
                        }
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* CHANNELS */}
        {section === "channels" && (
          <>
            <div className="px-4 pt-5 pb-1">
              <h2 className="font-display text-2xl font-semibold" style={{ color: "hsl(var(--foreground))" }}>Каналы</h2>
            </div>
            <EmptyState icon="Radio" title="Каналы пока недоступны" sub="Функция появится в следующем обновлении" />
          </>
        )}

        {/* CONTACTS */}
        {section === "contacts" && (
          <>
            <div className="flex items-center justify-between px-4 pt-5 pb-1">
              <h2 className="font-display text-2xl font-semibold" style={{ color: "hsl(var(--foreground))" }}>Контакты</h2>
              <button
                onClick={() => setShowNewContact(true)}
                className="w-7 h-7 rounded flex items-center justify-center transition-all hover:bg-secondary"
                title="Добавить контакт"
                style={{ color: "hsl(var(--gold))" }}
              >
                <Icon name="UserPlus" size={15} />
              </button>
            </div>

            <div className="relative mx-4 my-3">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--muted-foreground))" }} />
              <input
                className="w-full pl-8 pr-3 py-2 text-sm rounded outline-none"
                style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--divider))" }}
                placeholder="Поиск контактов..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredContacts.length === 0 ? (
                <EmptyState icon="Users" title="Нет контактов" sub="Нажмите + чтобы добавить первый контакт" />
              ) : (
                filteredContacts.map((ct, i) => (
                  <div
                    key={ct.id}
                    className="chat-row animate-fade-in"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <Avatar initials={ct.initials} online={ct.online} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: "hsl(var(--foreground))" }}>{ct.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: ct.online ? "#4ade80" : "hsl(var(--muted-foreground))" }}>
                        {ct.online ? "В сети" : "Не в сети"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-1">
                      <button
                        onClick={() => toggleContactFavorite(ct.id)}
                        className="p-1.5 rounded transition-all hover:bg-secondary"
                        title={ct.favorite ? "Убрать из избранного" : "В избранное"}
                        style={{ color: ct.favorite ? "hsl(var(--gold))" : "hsl(var(--muted-foreground))" }}
                      >
                        <Icon name="Star" size={13} />
                      </button>
                      <button
                        onClick={() => startChatWithContact(ct)}
                        className="p-1.5 rounded transition-all hover:bg-secondary"
                        title="Написать"
                        style={{ color: "hsl(var(--muted-foreground))" }}
                      >
                        <Icon name="MessageSquare" size={13} />
                      </button>
                      <button
                        onClick={() => deleteContact(ct.id)}
                        className="p-1.5 rounded transition-all hover:bg-secondary"
                        title="Удалить"
                        style={{ color: "hsl(var(--muted-foreground))" }}
                      >
                        <Icon name="Trash2" size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* NOTIFICATIONS */}
        {section === "notifications" && (
          <>
            <div className="flex items-center justify-between px-4 pt-5 pb-3">
              <h2 className="font-display text-2xl font-semibold" style={{ color: "hsl(var(--foreground))" }}>Уведомления</h2>
              {notifications.length > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs transition-all hover:opacity-80"
                  style={{ color: "hsl(var(--gold))" }}
                >Прочитать все</button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto px-4 space-y-2">
              {notifications.length === 0 ? (
                <EmptyState icon="Bell" title="Нет уведомлений" />
              ) : (
                notifications.map((n, i) => (
                  <div
                    key={n.id}
                    className="flex gap-3 p-3 rounded animate-fade-in cursor-pointer transition-all hover:bg-secondary"
                    style={{
                      animationDelay: `${i * 40}ms`,
                      background: n.read ? "transparent" : "hsl(var(--secondary))",
                      border: "1px solid hsl(var(--divider))",
                    }}
                    onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "hsl(var(--accent))" }}>
                      <Icon name={n.icon} size={14} style={{ color: "hsl(var(--gold))" }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--foreground))" }}>{n.text}</p>
                      <span className="text-[10px] mt-1 block" style={{ color: "hsl(var(--muted-foreground))" }}>{n.time}</span>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: "hsl(var(--gold))" }} />}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* PROFILE */}
        {section === "profile" && (
          <>
            <div className="px-4 pt-5 pb-3">
              <h2 className="font-display text-2xl font-semibold" style={{ color: "hsl(var(--foreground))" }}>Профиль</h2>
            </div>
            <div className="flex flex-col items-center px-4 pt-2 gap-3">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-display font-semibold"
                style={{ background: "hsl(var(--accent))", color: "hsl(var(--gold))", border: "2px solid hsl(var(--gold) / 0.4)" }}
              >
                {profileInitials}
              </div>

              {editingProfile ? (
                <div className="w-full space-y-2">
                  <input
                    className="w-full py-2 px-3 text-sm rounded outline-none"
                    style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--divider))" }}
                    placeholder="Имя Фамилия"
                    value={profileNameDraft}
                    onChange={e => setProfileNameDraft(e.target.value)}
                    autoFocus
                  />
                  <input
                    className="w-full py-2 px-3 text-sm rounded outline-none"
                    style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--divider))" }}
                    placeholder="Должность"
                    value={profileRoleDraft}
                    onChange={e => setProfileRoleDraft(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingProfile(false)}
                      className="flex-1 py-2 text-xs rounded"
                      style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))" }}
                    >Отмена</button>
                    <button
                      onClick={saveProfile}
                      className="flex-1 py-2 text-xs rounded font-medium"
                      style={{ background: "hsl(var(--gold))", color: "hsl(var(--primary-foreground))" }}
                    >Сохранить</button>
                  </div>
                </div>
              ) : (
                <div className="text-center w-full">
                  <div className="font-display text-lg font-semibold" style={{ color: "hsl(var(--foreground))" }}>{profileName}</div>
                  <div className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{profileRole}</div>
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#4ade80" }} />
                    <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>В сети</span>
                  </div>
                  <button
                    onClick={() => { setProfileNameDraft(profileName); setProfileRoleDraft(profileRole); setEditingProfile(true); }}
                    className="mt-4 flex items-center gap-1.5 mx-auto text-xs px-3 py-1.5 rounded transition-all hover:bg-secondary"
                    style={{ color: "hsl(var(--gold))", border: "1px solid hsl(var(--gold) / 0.3)" }}
                  >
                    <Icon name="Pencil" size={11} />
                    Редактировать
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* SETTINGS */}
        {section === "settings" && (
          <>
            <div className="px-4 pt-5 pb-3">
              <h2 className="font-display text-2xl font-semibold" style={{ color: "hsl(var(--foreground))" }}>Настройки</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-3 space-y-1">

              {/* Toggle rows */}
              {[
                { icon: "Volume2", label: "Звук", desc: "Звуковые уведомления", val: settingSound, toggle: () => setSettingSound(v => !v) },
                { icon: "Bell", label: "Уведомления", desc: "Push-уведомления", val: settingNotify, toggle: () => setSettingNotify(v => !v) },
                { icon: "Shield", label: "Двухфакторная защита", desc: "Дополнительный код при входе", val: setting2fa, toggle: () => setSetting2fa(v => !v) },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded animate-fade-in"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ background: "hsl(var(--accent))" }}>
                    <Icon name={s.icon} size={14} style={{ color: "hsl(var(--gold))" }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>{s.label}</div>
                    <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{s.desc}</div>
                  </div>
                  <button
                    onClick={s.toggle}
                    className="w-9 h-5 rounded-full transition-all relative flex-shrink-0"
                    style={{ background: s.val ? "hsl(var(--gold))" : "hsl(var(--secondary))" }}
                  >
                    <span
                      className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                      style={{ background: "#fff", left: s.val ? "calc(100% - 18px)" : "2px" }}
                    />
                  </button>
                </div>
              ))}

              <div style={{ borderTop: "1px solid hsl(var(--divider))", margin: "8px 0" }} />

              {/* Nav buttons */}
              {[
                { icon: "Lock", label: "Конфиденциальность", desc: "Шифрование и доступ" },
                { icon: "Palette", label: "Оформление", desc: "Тема и интерфейс" },
                { icon: "HardDrive", label: "Хранилище", desc: "Файлы и кэш" },
              ].map((s, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 p-3 rounded text-left transition-all hover:bg-secondary animate-fade-in"
                  style={{ animationDelay: `${(i + 3) * 40}ms` }}
                >
                  <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ background: "hsl(var(--accent))" }}>
                    <Icon name={s.icon} size={14} style={{ color: "hsl(var(--gold))" }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>{s.label}</div>
                    <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{s.desc}</div>
                  </div>
                  <Icon name="ChevronRight" size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
                </button>
              ))}

              <div style={{ borderTop: "1px solid hsl(var(--divider))", margin: "8px 0" }} />

              <button
                className="w-full flex items-center gap-3 p-3 rounded text-left transition-all hover:bg-secondary"
                onClick={() => window.location.reload()}
              >
                <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ background: "#f8717115" }}>
                  <Icon name="LogOut" size={14} style={{ color: "#f87171" }} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: "#f87171" }}>Выйти</div>
                  <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Завершить сессию</div>
                </div>
              </button>
            </div>
          </>
        )}
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {currentChat && section === "chats" ? (
          <>
            {/* Header */}
            <header
              className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
              style={{ background: "hsl(var(--panel))", borderBottom: "1px solid hsl(var(--divider))" }}
            >
              <Avatar initials={currentChat.initials} online={currentChat.online} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate" style={{ color: "hsl(var(--foreground))" }}>{currentChat.name}</div>
                <div className="text-xs" style={{ color: currentChat.online ? "#4ade80" : "hsl(var(--muted-foreground))" }}>
                  {currentChat.isGroup ? `Группа` : currentChat.online ? "В сети" : "Не в сети"}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => togglePin(currentChat.id)}
                  className="p-1.5 rounded transition-all hover:bg-secondary"
                  title={currentChat.pinned ? "Открепить" : "Закрепить"}
                  style={{ color: currentChat.pinned ? "hsl(var(--gold))" : "hsl(var(--muted-foreground))" }}
                >
                  <Icon name="Pin" size={15} />
                </button>
                <button
                  onClick={() => toggleFavorite(currentChat.id)}
                  className="p-1.5 rounded transition-all hover:bg-secondary"
                  title={currentChat.favorite ? "Убрать из избранного" : "В избранное"}
                  style={{ color: currentChat.favorite ? "hsl(var(--gold))" : "hsl(var(--muted-foreground))" }}
                >
                  <Icon name="Star" size={15} />
                </button>
                <button
                  onClick={() => toggleMute(currentChat.id)}
                  className="p-1.5 rounded transition-all hover:bg-secondary"
                  title={currentChat.muted ? "Включить звук" : "Отключить звук"}
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  <Icon name={currentChat.muted ? "BellOff" : "Bell"} size={15} />
                </button>
                <button
                  onClick={() => setShowInfo(v => !v)}
                  className="p-1.5 rounded transition-all hover:bg-secondary"
                  title="Информация"
                  style={{ color: showInfo ? "hsl(var(--gold))" : "hsl(var(--muted-foreground))" }}
                >
                  <Icon name="Info" size={15} />
                </button>
                <button
                  onClick={() => deleteChat(currentChat.id)}
                  className="p-1.5 rounded transition-all hover:bg-secondary"
                  title="Удалить чат"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  <Icon name="Trash2" size={15} />
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
                <span className="truncate flex-1" style={{ color: "hsl(var(--muted-foreground))" }}>{pinnedMsg.text}</span>
                <button onClick={() => pinMessage(currentChat.id, pinnedMsg.id)} style={{ color: "hsl(var(--muted-foreground))" }}>
                  <Icon name="X" size={11} />
                </button>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
              {currentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 select-none animate-fade-in">
                  <Icon name="MessageSquare" size={36} style={{ color: "hsl(var(--gold) / 0.15)" }} />
                  <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Начните общение</p>
                </div>
              ) : (
                currentMessages.map((msg, i) => (
                  <div
                    key={msg.id}
                    className={`flex group animate-fade-in ${msg.own ? "justify-end" : "justify-start"}`}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    {!msg.own && <Avatar initials={currentChat.initials} size="sm" />}
                    <div className={`max-w-[65%] ${msg.own ? "ml-2" : "ml-2"}`}>
                      <div
                        className="px-4 py-2.5 text-sm leading-relaxed relative"
                        style={{
                          background: msg.own ? "hsl(var(--msg-own))" : "hsl(var(--msg-other))",
                          color: "hsl(var(--foreground))",
                          border: `1px solid ${msg.own ? "hsl(var(--gold) / 0.15)" : "hsl(var(--divider))"}`,
                          borderRadius: "2px",
                        }}
                      >
                        {msg.text}
                        {/* pin button on hover */}
                        <button
                          onClick={() => pinMessage(currentChat.id, msg.id)}
                          className="absolute -top-2 right-1 opacity-0 group-hover:opacity-100 transition-all p-0.5 rounded"
                          title={msg.pinned ? "Открепить" : "Закрепить"}
                          style={{ background: "hsl(var(--panel))", color: "hsl(var(--muted-foreground))" }}
                        >
                          <Icon name="Pin" size={10} />
                        </button>
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
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="px-4 py-3 flex items-center gap-2 flex-shrink-0"
              style={{ background: "hsl(var(--panel))", borderTop: "1px solid hsl(var(--divider))" }}
            >
              <button className="p-2 rounded transition-all hover:bg-secondary" title="Прикрепить файл" style={{ color: "hsl(var(--muted-foreground))" }}>
                <Icon name="Paperclip" size={16} />
              </button>
              <input
                className="flex-1 py-2 px-4 text-sm outline-none transition-all"
                style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--divider))", borderRadius: "2px" }}
                placeholder="Введите сообщение..."
                value={msgInput}
                onChange={e => setMsgInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              />
              <button className="p-2 rounded transition-all hover:bg-secondary" title="Голосовое сообщение" style={{ color: "hsl(var(--muted-foreground))" }}>
                <Icon name="Mic" size={16} />
              </button>
              <button
                onClick={sendMessage}
                className="p-2.5 rounded transition-all hover:opacity-90"
                style={{ background: msgInput.trim() ? "hsl(var(--gold))" : "hsl(var(--secondary))", color: msgInput.trim() ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))", borderRadius: "2px" }}
                title="Отправить"
              >
                <Icon name="Send" size={15} />
              </button>
            </div>
          </>
        ) : (
          /* Empty main */
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in select-none">
            <div className="font-display text-8xl font-semibold tracking-widest mb-4" style={{ color: "hsl(var(--gold) / 0.1)" }}>
              СТЕЛ
            </div>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              {section === "chats"
                ? chats.length === 0
                  ? "Создайте первый чат — нажмите + в панели слева"
                  : "Выберите диалог для начала общения"
                : "Выберите раздел в меню слева"
              }
            </p>
          </div>
        )}
      </main>

      {/* ── RIGHT INFO PANEL ── */}
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
            <Avatar initials={currentChat.initials} size="lg" online={currentChat.online} />
            <div className="font-display text-base font-semibold text-center mt-1" style={{ color: "hsl(var(--foreground))" }}>
              {currentChat.name}
            </div>
            <div className="text-xs" style={{ color: currentChat.online ? "#4ade80" : "hsl(var(--muted-foreground))" }}>
              {currentChat.isGroup ? "Группа" : currentChat.online ? "В сети" : "Не в сети"}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-px flex-shrink-0" style={{ borderBottom: "1px solid hsl(var(--divider))", background: "hsl(var(--divider))" }}>
            {[
              { icon: "Pin", label: currentChat.pinned ? "Открепить" : "Закрепить", action: () => togglePin(currentChat.id) },
              { icon: "Star", label: currentChat.favorite ? "Убрать" : "Избранное", action: () => toggleFavorite(currentChat.id) },
              { icon: currentChat.muted ? "Volume2" : "BellOff", label: currentChat.muted ? "Звук вкл." : "Без звука", action: () => toggleMute(currentChat.id) },
            ].map(a => (
              <button
                key={a.label}
                onClick={a.action}
                className="flex flex-col items-center gap-1 py-3 transition-all hover:opacity-80"
                style={{ background: "hsl(var(--panel))" }}
              >
                <Icon name={a.icon} size={15} style={{ color: "hsl(var(--gold))" }} />
                <span className="text-[9px] uppercase tracking-wide" style={{ color: "hsl(var(--muted-foreground))" }}>{a.label}</span>
              </button>
            ))}
          </div>

          <div className="px-4 pt-4 pb-2">
            <div className="text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Сообщений</div>
            <div className="font-display text-2xl font-semibold" style={{ color: "hsl(var(--gold))" }}>{currentMessages.length}</div>
          </div>

          <div className="px-4 pt-2 pb-3">
            <div className="text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>Закреплённые</div>
            {currentMessages.filter(m => m.pinned).length === 0 ? (
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Нет закреплённых</p>
            ) : (
              currentMessages.filter(m => m.pinned).map(m => (
                <div
                  key={m.id}
                  className="p-2 rounded text-xs mb-1"
                  style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--divider))" }}
                >
                  {m.text}
                </div>
              ))
            )}
          </div>

          <div className="px-4 mt-auto pb-4">
            <button
              onClick={() => deleteChat(currentChat.id)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded text-sm transition-all"
              style={{ background: "#f8717115", color: "#f87171", border: "1px solid #f8717130" }}
            >
              <Icon name="Trash2" size={14} />
              Удалить чат
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
