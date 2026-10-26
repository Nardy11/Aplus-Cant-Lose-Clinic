import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import AccountAvatar from "./Authentication/AccountAvatar";
import { API_URL } from "../Consts";
import { Page, PageHead, EmptyState, Skeleton } from "../design/ui";
import { formatMoney, formatDateTime } from "../design/format";

// Older history rows ended in a 24-character database id ("Prescription payment 6ade22..."); hide it.
const cleanText = (text) => String(text || "Wallet transaction").replace(/\s+[0-9a-f]{24}\b/gi, "");
const typeLabel = (type) => String(type || "other").replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export default function WalletPage() {
  const { id, role } = useSelector((state) => state.user);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState(null);

  useEffect(() => {
    if (!id || !["patient", "doctor"].includes(role)) return;
    let active = true;
    axios.get(role === "doctor" ? `${API_URL}/doctor/viewWallet/${id}` : `${API_URL}/patient/viewWallet/${id}`)
      .then((r) => {
        if (!active) return;
        setBalance(Number(r.data.wallet || 0));
        setTransactions([...(r.data.transactions || [])].sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)));
      })
      .catch(() => active && setTransactions([]));
    return () => { active = false; };
  }, [id, role]);

  const totals = useMemo(() => {
    const list = transactions || [];
    const sum = (dir) => list.filter((t) => t.direction === dir).reduce((s, t) => s + Math.abs(Number(t.amount || 0)), 0);
    return { in: sum("credit"), out: sum("debit"), paidVisits: list.filter((t) => t.direction === "credit").length };
  }, [transactions]);

  return (
    <>
      <AccountAvatar />
      <Page>
        <PageHead back="/Home" title="Wallet" lead={role === "doctor" ? "What patients have paid you for visits." : "Money for visits, medicines and plans."} />

        <div className="wallet-summary">
          <div className="ui-card wallet-balance">
            <span>Balance</span>
            <strong>{formatMoney(balance)}</strong>
          </div>
          {role === "doctor" ? (
            // Doctor wallets only ever receive session payments, so "money out" would always be zero.
            <>
              <div className="ui-card wallet-stat">
                <span>Total received</span>
                <strong className="is-in">{formatMoney(totals.in)}</strong>
              </div>
              <div className="ui-card wallet-stat">
                <span>Paid visits</span>
                <strong>{totals.paidVisits}</strong>
              </div>
            </>
          ) : (
            <>
              <div className="ui-card wallet-stat">
                <span>Money in</span>
                <strong className="is-in">+{formatMoney(totals.in)}</strong>
              </div>
              <div className="ui-card wallet-stat">
                <span>Money spent</span>
                <strong className="is-out">-{formatMoney(totals.out)}</strong>
              </div>
            </>
          )}
        </div>

        <section className="ui-card" style={{ marginTop: 20 }}>
          <div className="ui-card-head">
            <h2 className="ui-section-title">History</h2>
            {transactions && <span className="ui-toolbar-count">{transactions.length} {transactions.length === 1 ? "transaction" : "transactions"}</span>}
          </div>
          {!transactions ? (
            <div className="ui-card-pad"><Skeleton height={52} count={4} /></div>
          ) : transactions.length === 0 ? (
            <EmptyState icon={<AccountBalanceWalletRoundedIcon />} title="No transactions yet" text="Payments, refunds and top-ups show up here." />
          ) : (
            <ul className="ui-list">
              {transactions.map((t, i) => {
                const credit = t.direction === "credit";
                return (
                  <li key={t._id || i} className="ui-row wallet-row">
                    <span className={`ui-row-icon wallet-dot ${credit ? "is-in" : "is-out"}`}>{credit ? <AddRoundedIcon /> : <RemoveRoundedIcon />}</span>
                    <span className="ui-row-body">
                      <strong>{cleanText(t.description)}</strong>
                      <span>{typeLabel(t.type)}, {t.timestamp ? formatDateTime(t.timestamp) : "recently"}</span>
                    </span>
                    <span className="wallet-amount">
                      <strong className={credit ? "is-in" : "is-out"}>{credit ? "+" : "-"}{formatMoney(Math.abs(Number(t.amount || 0)))}</strong>
                      <small>Balance {formatMoney(t.balanceAfter)}</small>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </Page>
    </>
  );
}
