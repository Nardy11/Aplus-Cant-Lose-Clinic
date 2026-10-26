import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import { API_URL } from "../../Consts";
import AccountAvatar from "../Authentication/AccountAvatar";
import { Page, EmptyState } from "../../design/ui";

// Where Stripe sends people back to. Payment is only counted once the server has asked Stripe
// whether the session was really paid, so nothing happens just because this page was opened.
export default function PaymentReturn() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [result, setResult] = useState(sessionId ? { state: "checking" } : { state: "missing" });

  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    axios.get(`${API_URL}/patient/checkout/confirm/${encodeURIComponent(sessionId)}`)
      .then((r) => active && setResult({ state: r.data.status, kind: r.data.kind }))
      .catch((e) => active && setResult({ state: e.response?.status === 402 ? "unpaid" : "error" }));
    return () => { active = false; };
  }, [sessionId]);

  const view = {
    checking: { icon: <HourglassTopRoundedIcon />, title: "Confirming your payment", text: "This takes a few seconds. Please don't close the page." },
    ok: result.kind === "plan"
      ? { icon: <CheckCircleRoundedIcon />, title: "Your plan is active", text: "The discount applies from your next booking.", to: "/ViewHealthPackage", cta: "See my plan" }
      : { icon: <CheckCircleRoundedIcon />, title: "Visit booked", text: "Your payment went through and the time is yours. You'll find it in your appointments.", to: "/Appointments", cta: "See my appointments" },
    refunded: { icon: <ErrorOutlineRoundedIcon />, title: "That time was just taken", text: "Someone else booked it first. Your card was refunded automatically. Pick another time.", to: "/DoctorsList", cta: "Choose another time" },
    unpaid: { icon: <ErrorOutlineRoundedIcon />, title: "The payment wasn't completed", text: "You haven't been charged. Try again when you're ready.", to: "/DoctorsList", cta: "Back to doctors" },
    processing: { icon: <HourglassTopRoundedIcon />, title: "Still processing", text: "Your payment is being recorded. Check your appointments or plan in a minute.", to: "/Home", cta: "Go to home" },
    failed: { icon: <ErrorOutlineRoundedIcon />, title: "We couldn't finish your booking", text: "Your payment was received but something went wrong on our side. Contact the clinic and we'll sort it out.", to: "/Home", cta: "Go to home" },
    error: { icon: <ErrorOutlineRoundedIcon />, title: "We couldn't check this payment", text: "If your card was charged, contact the clinic. Otherwise try again.", to: "/Home", cta: "Go to home" },
    missing: { icon: <ErrorOutlineRoundedIcon />, title: "Nothing to confirm", text: "This page opens after a card payment.", to: "/Home", cta: "Go to home" },
  }[result.state] || { icon: <ErrorOutlineRoundedIcon />, title: "Something went wrong", text: "Go back and try again.", to: "/Home", cta: "Go to home" };

  return (
    <>
      <AccountAvatar />
      <Page>
        <div className="ui-card" style={{ maxWidth: 560, margin: "40px auto" }}>
          <EmptyState icon={view.icon} title={view.title} text={view.text} action={view.to && <Link to={view.to} className="ui-btn ui-btn--primary">{view.cta}</Link>} />
        </div>
      </Page>
    </>
  );
}
