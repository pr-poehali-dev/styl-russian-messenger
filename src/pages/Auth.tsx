import { useState } from "react";
import Icon from "@/components/ui/icon";

type AuthMode = "login" | "register";

interface AuthProps {
  onAuth: (name: string, role: string) => void;
}

export default function Auth({ onAuth }: AuthProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  function submit() {
    setError("");

    if (mode === "login") {
      if (!phone.trim() || !password.trim()) {
        setError("Заполните все поля");
        return;
      }
      // Проверяем localStorage
      const stored = localStorage.getItem("stel_users");
      const users: { phone: string; password: string; name: string; role: string }[] = stored ? JSON.parse(stored) : [];
      const user = users.find(u => u.phone === phone.trim() && u.password === password);
      if (!user) {
        setError("Неверный номер или пароль");
        return;
      }
      onAuth(user.name, user.role);
    } else {
      if (!name.trim() || !phone.trim() || !password.trim()) {
        setError("Заполните все поля");
        return;
      }
      if (password.length < 6) {
        setError("Пароль должен быть не менее 6 символов");
        return;
      }
      if (password !== confirmPassword) {
        setError("Пароли не совпадают");
        return;
      }
      const stored = localStorage.getItem("stel_users");
      const users: { phone: string; password: string; name: string; role: string }[] = stored ? JSON.parse(stored) : [];
      if (users.find(u => u.phone === phone.trim())) {
        setError("Этот номер уже зарегистрирован");
        return;
      }
      users.push({ phone: phone.trim(), password, name: name.trim(), role: role.trim() || "Пользователь" });
      localStorage.setItem("stel_users", JSON.stringify(users));
      onAuth(name.trim(), role.trim() || "Пользователь");
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "hsl(var(--chat-bg))" }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-10 animate-fade-in select-none">
        <span
          className="font-display text-6xl font-semibold tracking-[0.15em]"
          style={{ color: "hsl(var(--gold))" }}
        >
          СТЕЛ
        </span>
        <span
          className="text-xs tracking-[0.5em] uppercase mt-1"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          защищённый мессенджер
        </span>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm animate-slide-up"
        style={{ background: "hsl(var(--panel))", border: "1px solid hsl(var(--divider))", borderRadius: "4px" }}
      >
        {/* Tabs */}
        <div className="flex" style={{ borderBottom: "1px solid hsl(var(--divider))" }}>
          {([["login", "Вход"], ["register", "Регистрация"]] as const).map(([m, label]) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className="flex-1 py-3.5 text-sm font-medium transition-all"
              style={{
                color: mode === m ? "hsl(var(--gold))" : "hsl(var(--muted-foreground))",
                borderBottom: mode === m ? "2px solid hsl(var(--gold))" : "2px solid transparent",
                background: "transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-3">
          {mode === "register" && (
            <>
              <div>
                <label className="text-xs uppercase tracking-widest block mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Имя и Фамилия
                </label>
                <input
                  className="w-full py-2.5 px-3 text-sm rounded outline-none"
                  style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--divider))" }}
                  placeholder="Василий Петров"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest block mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Должность (необязательно)
                </label>
                <input
                  className="w-full py-2.5 px-3 text-sm rounded outline-none"
                  style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--divider))" }}
                  placeholder="Директор"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs uppercase tracking-widest block mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>
              Номер телефона
            </label>
            <input
              className="w-full py-2.5 px-3 text-sm rounded outline-none"
              style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--divider))" }}
              placeholder="+7 900 000 00 00"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              type="tel"
              autoComplete="tel"
              inputMode="tel"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest block mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>
              Пароль
            </label>
            <div className="relative">
              <input
                className="w-full py-2.5 px-3 pr-10 text-sm rounded outline-none"
                style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--divider))" }}
                placeholder={mode === "register" ? "Минимум 6 символов" : "••••••••"}
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              <button
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "hsl(var(--muted-foreground))" }}
                type="button"
              >
                <Icon name={showPass ? "EyeOff" : "Eye"} size={15} />
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="text-xs uppercase tracking-widest block mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                Повторите пароль
              </label>
              <input
                className="w-full py-2.5 px-3 text-sm rounded outline-none"
                style={{ background: "hsl(var(--secondary))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--divider))" }}
                placeholder="••••••••"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
                autoComplete="new-password"
              />
            </div>
          )}

          {error && (
            <div
              className="py-2 px-3 rounded text-xs animate-fade-in"
              style={{ background: "#f8717115", color: "#f87171", border: "1px solid #f8717130" }}
            >
              {error}
            </div>
          )}

          <button
            onClick={submit}
            className="w-full py-3 text-sm font-medium rounded transition-all hover:opacity-90 mt-1"
            style={{ background: "hsl(var(--gold))", color: "hsl(var(--primary-foreground))" }}
          >
            {mode === "login" ? "Войти" : "Создать аккаунт"}
          </button>
        </div>
      </div>

      <p className="text-xs mt-6 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
        Надёжное шифрование · Приватность данных
      </p>

      <p
        className="fixed top-3 left-0 right-0 text-center text-xs select-none"
        style={{ color: "hsl(var(--muted-foreground) / 0.5)" }}
      >
        Сделано с <a href="https://poehali.dev" target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity" style={{ color: "hsl(var(--gold) / 0.6)" }}>poehali.dev</a>
      </p>
    </div>
  );
}