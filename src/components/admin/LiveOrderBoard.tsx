"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { updateOrderStatusAction } from "@/app/actions/orders";
import {
  isAlertSoundReady,
  playNewOrderChime,
  unlockAlertSound,
} from "@/components/admin/alert-sound";
import OrderCard from "@/components/admin/OrderCard";
import Icon from "@/components/ui/Icon";
import type { OrderView } from "@/db/queries/orders";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/orders/status";

const POLL_MS = 4000;
const NEW_HIGHLIGHT_MS = 20_000;

const COLUMNS: readonly OrderStatus[] = ["new", "preparing", "ready", "out_for_delivery"];

type ConnectionState = "live" | "offline" | "signed_out";

export default function LiveOrderBoard({ initialOrders }: { initialOrders: OrderView[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [connection, setConnection] = useState<ConnectionState>("live");
  const [soundReady, setSoundReady] = useState(false);
  const [highlighted, setHighlighted] = useState<Record<string, number>>({});
  const [now, setNow] = useState(() => Date.now());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const knownIds = useRef(new Set(initialOrders.map((order) => order.id)));

  const announce = useCallback((fresh: OrderView[]) => {
    if (fresh.length === 0) return;

    playNewOrderChime();

    if ("Notification" in window && Notification.permission === "granted") {
      const first = fresh[0];
      new Notification(`New order ${first.code}`, {
        body: `${first.customerName} · ${first.items.length} item${first.items.length === 1 ? "" : "s"}`,
      });
    }

    const stamp = Date.now();
    setHighlighted((current) => ({
      ...current,
      ...Object.fromEntries(fresh.map((order) => [order.id, stamp])),
    }));
  }, []);

  useEffect(() => {
    const poll = async () => {
      if (document.visibilityState !== "visible") return;

      try {
        const response = await fetch("/api/admin/orders", { cache: "no-store" });

        if (response.status === 401 || response.status === 403) {
          setConnection("signed_out");
          return;
        }
        if (!response.ok) throw new Error("bad response");

        const body = (await response.json()) as { orders: OrderView[] };
        const fresh = body.orders.filter(
          (order) => order.status === "new" && !knownIds.current.has(order.id),
        );

        body.orders.forEach((order) => knownIds.current.add(order.id));
        setOrders(body.orders);
        setConnection("live");
        announce(fresh);
      } catch {
        setConnection("offline");
      }
    };

    const timer = window.setInterval(poll, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void poll();
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [announce]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      setHighlighted((existing) =>
        Object.fromEntries(
          Object.entries(existing).filter(([, stamp]) => current - stamp < NEW_HIGHLIGHT_MS),
        ),
      );
    }, 15_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setSoundReady(isAlertSoundReady());
  }, []);

  const newCount = orders.filter((order) => order.status === "new").length;

  useEffect(() => {
    document.title = newCount > 0 ? `(${newCount}) New orders · Breaking Buns` : "Live orders · Breaking Buns";
  }, [newCount]);

  const enableAlerts = async () => {
    setSoundReady(await unlockAlertSound());
    playNewOrderChime();

    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  const changeStatus = async (order: OrderView, status: OrderStatus) => {
    if (status === "cancelled" && !window.confirm(`Cancel order ${order.code} and tell the customer?`)) {
      return;
    }

    setBusyId(order.id);
    setNotice("");
    const previous = orders;
    setOrders((current) =>
      status === "completed" || status === "cancelled"
        ? current.filter((item) => item.id !== order.id)
        : current.map((item) => (item.id === order.id ? { ...item, status } : item)),
    );

    const result = await updateOrderStatusAction(order.id, status);
    setBusyId(null);

    if (!result.ok) {
      setOrders(previous);
      setNotice(result.error);
      return;
    }

    if (result.data.refundNeeded) {
      setNotice(
        `Order ${order.code} was paid online. Please refund ${order.customerName} in your Stripe dashboard (Payments → find the payment → Refund).`,
      );
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
            connection === "live" ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
          }`}
        >
          <span
            className={`size-2 rounded-full ${connection === "live" ? "animate-pulse bg-success" : "bg-danger"}`}
          />
          {connection === "live" && "Live — updates every few seconds"}
          {connection === "offline" && "Connection lost — retrying"}
          {connection === "signed_out" && "Signed out"}
        </span>

        {!soundReady && (
          <button
            type="button"
            onClick={enableAlerts}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-white shadow-accent transition hover:bg-accent-hover"
          >
            <Icon name="bell" className="size-4" />
            Turn on sound alerts
          </button>
        )}
        {soundReady && (
          <span className="inline-flex items-center gap-2 text-sm text-ink-muted">
            <Icon name="bell" className="size-4 text-success" />
            Sound alerts on
          </span>
        )}

        {connection === "signed_out" && (
          <Link href="/login?next=/admin/orders" className="text-sm text-accent hover:underline">
            Sign in again
          </Link>
        )}
      </div>

      {notice && (
        <p role="alert" className="mt-4 rounded-xl bg-warning/10 px-4 py-3 text-sm text-warning">
          {notice}
        </p>
      )}

      {orders.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-white/15 p-10 text-center text-ink-muted">
          No active orders. New orders appear here the moment customers place them.
        </p>
      ) : null}

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((status) => {
          const columnOrders = orders.filter((order) => order.status === status);

          return (
            <section key={status} aria-labelledby={`col-${status}`}>
              <h2
                id={`col-${status}`}
                className="flex items-center justify-between font-serif text-xl text-ink"
              >
                {ORDER_STATUS_LABELS[status]}
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-sm text-ink-muted">
                  {columnOrders.length}
                </span>
              </h2>
              <div className="mt-3 space-y-3">
                {columnOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    now={now}
                    isNew={order.id in highlighted}
                    busy={busyId === order.id}
                    onChangeStatus={changeStatus}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
