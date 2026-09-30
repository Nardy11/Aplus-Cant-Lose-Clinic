import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AccountAvatar from "./Authentication/AccountAvatar";
import { API_URL } from "../Consts";

export default function WalletPage() {
  const { id, role } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !["patient", "doctor"].includes(role)) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const response = await axios.get(role === "doctor" ? `${API_URL}/doctor/viewWallet/${id}` : `${API_URL}/patient/viewWallet/${id}`);
        if (active) {
          setBalance(Number(response.data.wallet || 0));
          setTransactions([...(response.data.transactions || [])].sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)));
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id, role]);

  const totalCredits = useMemo(() => transactions.filter((item) => item.direction === "credit").reduce((sum, item) => sum + Number(item.amount || 0), 0), [transactions]);
  const totalDebits = useMemo(() => transactions.filter((item) => item.direction === "debit").reduce((sum, item) => sum + Math.abs(Number(item.amount || 0)), 0), [transactions]);

  return (
    <main className="clinic-list-page">
      <AccountAvatar />
      <div className="clinic-list-shell">
        <button type="button" className="clinic-page-back" onClick={() => navigate("/Home")}><ArrowBackRoundedIcon />Back to home</button>
        <section className="clinic-list-heading">
          <div><span>ACCOUNT</span><h1>Wallet</h1><p>{role === "doctor" ? "Doctor wallet. Every recorded credit and payment is shown below." : "Patient wallet. Every recorded credit and payment is shown below."}</p></div>
          <div className="clinic-list-heading-icon"><AccountBalanceWalletRoundedIcon /></div>
        </section>
        <section className="clinic-wallet-page-summary">
          <div className="clinic-wallet-page-balance"><span>AVAILABLE BALANCE</span><strong>{balance.toLocaleString()}</strong><small>Clinic account credit</small></div>
          <div className="clinic-wallet-stat"><span>Money added</span><strong>+{totalCredits.toLocaleString()}</strong></div>
          <div className="clinic-wallet-stat"><span>Money spent</span><strong>-{totalDebits.toLocaleString()}</strong></div>
        </section>
        <section className="clinic-list-card">
          <div className="clinic-list-card-heading"><div><span>ACTIVITY</span><h2>Wallet history</h2></div><small>{transactions.length} transaction{transactions.length === 1 ? "" : "s"}</small></div>
          {loading ? <div className="clinic-list-empty"><strong>Loading wallet history...</strong></div> : transactions.length ? (
            <div className="clinic-wallet-history">
              {transactions.map((transaction, index) => {
                const credit = transaction.direction === "credit";
                return <article className="clinic-wallet-row" key={transaction._id || index}>
                  <div className={`clinic-wallet-row-icon ${credit ? "credit" : "debit"}`}>{credit ? <AddRoundedIcon /> : <RemoveRoundedIcon />}</div>
                  <div className="clinic-wallet-row-copy"><strong>{transaction.description || "Wallet transaction"}</strong><span>{transaction.type?.replace(/_/g, " ") || "Other"} · {transaction.timestamp ? new Date(transaction.timestamp).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "Recent"}</span></div>
                  <div className={`clinic-wallet-row-amount ${credit ? "credit" : "debit"}`}>{credit ? "+" : "-"}{Math.abs(Number(transaction.amount || 0)).toLocaleString()}<small>Balance {Number(transaction.balanceAfter || 0).toLocaleString()}</small></div>
                </article>;
              })}
            </div>
          ) : <div className="clinic-list-empty"><div className="clinic-list-empty-icon"><AccountBalanceWalletRoundedIcon /></div><strong>No wallet transactions yet</strong><span>Payments, refunds and future wallet activity will appear here.</span></div>}
        </section>
      </div>
    </main>
  );
}