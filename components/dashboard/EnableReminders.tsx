"use client";

import { useEffect, useState } from "react";

type Status = "idle" | "unsupported" | "enabling" | "enabled" | "denied" | "error";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function EnableReminders() {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "granted") {
      navigator.serviceWorker
        .getRegistration()
        .then((reg) => reg?.pushManager.getSubscription())
        .then((sub) => sub && setStatus("enabled"))
        .catch(() => {});
    } else if (Notification.permission === "denied") {
      setStatus("denied");
    }
  }, []);

  async function enable() {
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapid) {
      setStatus("error");
      return;
    }
    setStatus("enabling");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      if (!res.ok) throw new Error("subscribe failed");

      setStatus("enabled");
    } catch {
      setStatus("error");
    }
  }

  if (status === "enabled") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-accent-green/25 bg-accent-green/10 px-3 py-1.5 text-[12.5px] font-medium text-accent-green">
        <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
        Push reminders on
      </span>
    );
  }

  if (status === "unsupported") {
    return (
      <span className="text-[12.5px] text-ash">Push not supported here — email still works</span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={enable}
        disabled={status === "enabling"}
        className="btn-ghost !h-9 !px-3.5 !text-[13px] disabled:opacity-60"
      >
        <BellIcon />
        {status === "enabling" ? "Enabling…" : "Enable push reminders"}
      </button>
      {status === "denied" && (
        <span className="text-[11.5px] text-ash">Blocked in browser settings</span>
      )}
      {status === "error" && (
        <span className="text-[11.5px] text-accent-red">Couldn&apos;t enable — check VAPID key</span>
      )}
    </div>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13.7 20a2 2 0 01-3.4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
