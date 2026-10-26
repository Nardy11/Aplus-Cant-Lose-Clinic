import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Dialog, DialogTitle, DialogActions, IconButton, Button } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { viewHealthP, unsubscribeHealthPackage } from "../../features/patientSlice";
import { SnackbarContext } from "../../App";
import { API_URL } from "../../Consts";
import AccountAvatar from "../Authentication/AccountAvatar";
import ConfirmDialog from "../common/ConfirmDialog";
import { Page, PageHead, EmptyState, Skeleton } from "../../design/ui";
import { formatDate, formatMoney } from "../../design/format";

export default function Hpackages() {
  const snackbarMessage = useContext(SnackbarContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const id = useSelector((state) => state.user.id);
  const plans = useSelector((state) => state.patient.hpackages);

  const [loaded, setLoaded] = useState(false);
  const [membership, setMembership] = useState(null);
  const [familyAccounts, setFamilyAccounts] = useState([]);
  const [chosen, setChosen] = useState(null);          // plan being bought
  const [step, setStep] = useState(null);              // "who" | "pay"
  const [recipient, setRecipient] = useState(null);    // { id, name, self }
  const [unsubscribeTarget, setUnsubscribeTarget] = useState(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!id) return;
    dispatch(viewHealthP(id)).finally(() => setLoaded(true));
    axios.get(`${API_URL}/patient/profile/${id}`)
      .then((r) => setFamilyAccounts((r.data?.family || []).filter((f) => f.pid).map((f) => ({ id: f.pid, name: f.fullName, relation: f.relation }))))
      .catch(() => setFamilyAccounts([]));
  }, [dispatch, id]);

  const list = Array.isArray(plans) ? plans : [];
  const current = list.find((p) => p.isSubscribed);

  useEffect(() => {
    if (!current?._id || !id) { setMembership(null); return; }
    axios.get(`${API_URL}/patient/healthPackageInfo/${id}/${current._id}`)
      .then((r) => setMembership(r.data?.status ? r.data : null))
      .catch(() => setMembership(null));
  }, [current?._id, id]);

  const close = () => { setStep(null); setChosen(null); setRecipient(null); setWorking(false); };

  const choose = (plan) => {
    setChosen(plan);
    if (familyAccounts.length) {
      setStep("who");
    } else {
      setRecipient({ id, name: "you", self: true });
      setStep("pay");
    }
  };

  const payWithWallet = async () => {
    setWorking(true);
    try {
      const body = { amount: chosen.rate };
      if (recipient.self) {
        await axios.patch(`${API_URL}/patient/SubscriptionPayment/${id}/${chosen._id}`, body);
      } else {
        await axios.patch(`${API_URL}/patient/SubscriptionPaymentF/${recipient.id}/${chosen._id}/${id}`, body);
      }
      snackbarMessage(`${chosen.type} plan is active for ${recipient.self ? "you" : recipient.name}`, "success");
      close();
      dispatch(viewHealthP(id));
      if (!recipient.self) navigate("/Home");
    } catch (e) {
      snackbarMessage(e.response?.data?.message || e.response?.data?.error || "Your wallet balance isn't enough for this plan. Pay by card instead.", "error");
      setWorking(false);
    }
  };

  const payByCard = async () => {
    setWorking(true);
    try {
      const r = await axios.get(`${API_URL}/patient/createCheckoutSession/${recipient.id}/${chosen._id}`);
      if (!r.data?.url) throw new Error("Card checkout did not start.");
      window.location.assign(r.data.url);
    } catch (e) {
      snackbarMessage(e.response?.data?.error || e.message || "Card checkout did not start.", "error");
      setWorking(false);
    }
  };

  const confirmUnsubscribe = async () => {
    setWorking(true);
    try {
      await dispatch(unsubscribeHealthPackage({ Pid: id, healthPackageId: unsubscribeTarget._id })).unwrap();
      snackbarMessage(`Your ${unsubscribeTarget.type} plan is cancelled.`, "success");
      setUnsubscribeTarget(null);
      dispatch(viewHealthP(id));
    } catch (e) {
      snackbarMessage(e?.error || e?.message || "The plan couldn't be cancelled. Try again.", "error");
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <AccountAvatar />
      <Page>
        <PageHead
          title="Plans"
          lead={current ? `You're on ${current.type}. Every doctor session costs ${current.doctorDisc}% less.` : "A plan lowers the price of doctor sessions and medicine for a year."}
        />

        {!loaded && !list.length ? (
          <div className="ui-grid ui-grid-3"><Skeleton height={300} count={3} /></div>
        ) : !list.length ? (
          <div className="ui-card"><EmptyState title="No plans available" text="The clinic hasn't published any plans yet." /></div>
        ) : (
          <div className="ui-grid ui-grid-3">
            {list.map((plan) => (
              <article key={plan._id} className={`ui-plan ${plan.isSubscribed ? "ui-plan--current" : ""}`}>
                <div className="ui-plan-name">
                  <h3>{plan.type}</h3>
                  {plan.isSubscribed && <span className="ui-chip ui-chip--accent">Your plan</span>}
                </div>
                <div className="ui-plan-price">{formatMoney(plan.rate)}<span>/ year</span></div>
                <ul>
                  <li><strong>{plan.doctorDisc}%</strong> off doctor sessions</li>
                  <li><strong>{plan.medicineDisc}%</strong> off medicine</li>
                  <li><strong>{plan.familyDisc}%</strong> off plans for your family</li>
                </ul>
                {plan.isSubscribed && membership?.subscribedDate && (
                  <p className="ui-plan-meta">Member since {formatDate(membership.subscribedDate)}</p>
                )}
                {plan.isSubscribed ? (
                  <button type="button" className="ui-btn ui-btn--danger" onClick={() => setUnsubscribeTarget(plan)}>Cancel plan</button>
                ) : (
                  <button type="button" className={`ui-btn ${current ? "" : "ui-btn--primary"}`} onClick={() => choose(plan)}>
                    {current ? `Switch to ${plan.type}` : `Choose ${plan.type}`}
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </Page>

      <Dialog open={step === "who"} onClose={close} className="clinic-modern-dialog package-choice-dialog">
        <DialogTitle className="clinic-dialog-title">
          <div><span>{chosen?.type?.toUpperCase()} PLAN</span><h2>Who is this plan for?</h2></div>
          <IconButton className="clinic-dialog-close" onClick={close} aria-label="Close"><CloseRoundedIcon /></IconButton>
        </DialogTitle>
        <div className="package-dialog-body">
          <div className="package-choice-grid">
            <button type="button" className="package-choice-option" onClick={() => { setRecipient({ id, name: "you", self: true }); setStep("pay"); }}>
              <strong>Me</strong><span>Apply the plan to your account</span>
            </button>
            {familyAccounts.map((f) => (
              <button key={f.id} type="button" className="package-choice-option" onClick={() => { setRecipient({ id: f.id, name: f.name, self: false }); setStep("pay"); }}>
                <strong>{f.name}</strong><span>Your {f.relation}</span>
              </button>
            ))}
          </div>
          <p className="booking-note" style={{ marginTop: 12 }}>
            Only family members with their own account can get a plan. <Link to="/viewfamilymembers">Link a family member</Link>
          </p>
        </div>
        <DialogActions className="clinic-dialog-actions">
          <Button onClick={close} className="clinic-dialog-cancel">Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={step === "pay"} onClose={() => !working && close()} className="clinic-modern-dialog package-choice-dialog">
        <DialogTitle className="clinic-dialog-title">
          <div><span>{chosen ? `${chosen.type.toUpperCase()} PLAN, ${formatMoney(chosen.rate)} / YEAR` : "PAYMENT"}</span><h2>How do you want to pay?</h2></div>
          <IconButton className="clinic-dialog-close" onClick={close} aria-label="Close" disabled={working}><CloseRoundedIcon /></IconButton>
        </DialogTitle>
        <div className="package-dialog-body">
          {recipient && !recipient.self && <p>This plan is for {recipient.name}. You pay for it.</p>}
          <div className="package-choice-grid">
            <button type="button" className="package-choice-option" onClick={payWithWallet} disabled={working}>
              <strong>Wallet</strong><span>Pay from your clinic balance</span>
            </button>
            <button type="button" className="package-choice-option" onClick={payByCard} disabled={working}>
              <strong>{working ? "Opening checkout..." : "Card"}</strong><span>Continue to secure card payment</span>
            </button>
          </div>
        </div>
        <DialogActions className="clinic-dialog-actions">
          <Button onClick={close} className="clinic-dialog-cancel" disabled={working}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(unsubscribeTarget)}
        kicker="CANCEL PLAN"
        title={`Cancel your ${unsubscribeTarget?.type || ""} plan?`}
        message="Your discounts stop right away. You can choose a plan again at any time."
        confirmLabel={working ? "Cancelling..." : "Cancel plan"}
        cancelLabel="Keep plan"
        destructive
        onConfirm={confirmUnsubscribe}
        onCancel={() => !working && setUnsubscribeTarget(null)}
      />
    </>
  );
}
