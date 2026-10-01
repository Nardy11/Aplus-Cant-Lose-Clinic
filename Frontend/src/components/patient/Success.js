import React, { useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../Consts.js";
import { SnackbarContext } from "../../App";

const Success = () => {
  const navigate = useNavigate();
  const { id, h_id } = useParams();
  const snackbarMessage = useContext(SnackbarContext);

  useEffect(() => {
    let active = true;

    const completePayment = async () => {
      try {
        await axios.patch(
          `${API_URL}/patient/CCSubscriptionPayment/${id}/${h_id}`
        );

        if (active) {
          snackbarMessage("Health package payment completed successfully.", "success");
          navigate("/Home", { replace: true });
        }
      } catch (error) {
        console.error("Unable to complete health package payment:", error);
        if (active) {
          snackbarMessage(
            error.response?.data?.error || "Payment was completed, but the package could not be activated.",
            "error"
          );
          navigate("/ViewHealthPackage", { replace: true });
        }
      }
    };

    completePayment();
    return () => {
      active = false;
    };
  }, [h_id, id, navigate, snackbarMessage]);

  return (
    <div className="clinic-list-empty">
      <strong>Confirming your payment…</strong>
    </div>
  );
};

export default Success;
