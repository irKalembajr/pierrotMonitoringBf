"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

type State = {
  relay1: boolean;
  relay2: boolean;
  switch: boolean;
  source?: string;
  at: string;
} | null;

async function jsonFetch(url: string, opts?: RequestInit) {
  const res = await fetch(url, { ...opts, headers: { "Content-Type": "application/json", ...(opts?.headers || {}) } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function Page() {
  const [state, setState] = useState<State>(null);
  const [busy, setBusy] = useState(false);
  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""), []);

  // Poll state every 2s
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const data = await jsonFetch("/api/state");
        if (alive) setState(data.state);
      } catch {}
    };
    tick();
    const id = setInterval(tick, 2000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const sendCmd = useCallback(async (k: "relay1" | "relay2", v: boolean) => {
    setBusy(true);
    try {
      await jsonFetch("/api/command", {
        method: "POST",
        headers: token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : {},
        body: JSON.stringify({ [k]: v })
      });
    } finally {
      setBusy(false);
    }
  }, [token]);

  const setToken = (t: string) => {
    localStorage.setItem("token", t);
    window.location.reload();
  };

  return (
    <main className="container mx-auto max-w-3xl p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">Tableau de bord ESP32</h1>
        <p className="text-sm text-gray-600">Suivi des relais & interaction simple. Déployable sur Vercel.</p>
      </header>

      <section className="mb-6 rounded-2xl bg-white shadow p-4">
        <h2 className="text-xl font-medium mb-3">Authentification (optionnelle)</h2>
        <div className="flex gap-2 items-center">
          <input
            className="flex-1 border rounded-xl px-3 py-2"
            placeholder="Bearer VOTRE_TOKEN (ou juste le token)"
            defaultValue={token}
            onBlur={(e) => setToken(e.target.value.trim())}
          />
          <button className="px-4 py-2 rounded-xl bg-gray-100" onClick={() => setToken("")}>Effacer</button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Si <code>SHARED_SECRET</code> n'est pas défini côté serveur, aucun token n'est requis.</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white shadow p-5">
          <h3 className="text-lg font-semibold mb-2">État actuel</h3>
          {state ? (
            <ul className="space-y-1">
              <li>Relais 1 : <b>{state.relay1 ? "ON" : "OFF"}</b></li>
              <li>Relais 2 : <b>{state.relay2 ? "ON" : "OFF"}</b></li>
              <li>Interrupteur : <b>{state.switch ? "APPUI" : "REPOS"}</b></li>
              <li className="text-xs text-gray-500">Source: {state.source || "n/a"} — {new Date(state.at).toLocaleString()}</li>
            </ul>
          ) : (
            <p className="text-gray-500">Aucun état reçu pour le moment.</p>
          )}
        </div>

        <div className="rounded-2xl bg-white shadow p-5">
          <h3 className="text-lg font-semibold mb-3">Commandes</h3>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-24">Relais 1</span>
            <button
              disabled={busy}
              onClick={() => sendCmd("relay1", true)}
              className="px-4 py-2 rounded-xl bg-green-100 disabled:opacity-50"
            >ON</button>
            <button
              disabled={busy}
              onClick={() => sendCmd("relay1", false)}
              className="px-4 py-2 rounded-xl bg-red-100 disabled:opacity-50"
            >OFF</button>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-24">Relais 2</span>
            <button
              disabled={busy}
              onClick={() => sendCmd("relay2", true)}
              className="px-4 py-2 rounded-xl bg-green-100 disabled:opacity-50"
            >ON</button>
            <button
              disabled={busy}
              onClick={() => sendCmd("relay2", false)}
              className="px-4 py-2 rounded-xl bg-red-100 disabled:opacity-50"
            >OFF</button>
          </div>
          <p className="text-xs text-gray-500 mt-3">Le microcontrôleur récupère la dernière commande via <code>GET /api/command</code>.</p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white shadow p-5">
        <h3 className="text-lg font-semibold mb-2">Endpoints</h3>
        <ul className="text-sm space-y-1">
          <li><code>POST /api/state</code> — Reçoit l'état: {"{ relay1, relay2, switch, source? }"}</li>
          <li><code>GET /api/state</code> — Lit l'état courant.</li>
          <li><code>POST /api/command</code> — Définit une commande: {"{ relay1?, relay2? }"}</li>
          <li><code>GET /api/command?mode=pop|peek</code> — Récupère (et consomme) la dernière commande.</li>
        </ul>
      </section>
    </main>
  );
}
