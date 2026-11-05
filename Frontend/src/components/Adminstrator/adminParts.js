import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ConfirmDialog from "../common/ConfirmDialog";
import { Avatar } from "../../design/ui";
import { viewAdmin, viewHealthP, viewJoinedDr, viewPatients, viewPendDr } from "../../features/adminSlice";

// Loads every list the console needs, once, and reports whether the first load finished.
export function useAdminData() {
  const dispatch = useDispatch();
  const [state, setState] = useState({ loaded: false, failed: false });

  const load = useCallback(() => {
    setState({ loaded: false, failed: false });
    Promise.all([
      dispatch(viewPendDr()),
      dispatch(viewJoinedDr()),
      dispatch(viewPatients()),
      dispatch(viewHealthP()),
      dispatch(viewAdmin()),
    ]).then((results) => setState({ loaded: true, failed: results.some((r) => r.error) }));
  }, [dispatch]);

  useEffect(load, [load]);
  return { ...state, reload: load };
}

export function SearchBox({ value, onChange, placeholder, label }) {
  return (
    <div className="adm-search">
      <SearchRoundedIcon aria-hidden="true" />
      <input
        className="ui-input"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label || placeholder}
      />
    </div>
  );
}

export function Person({ name, sub }) {
  return (
    <div className="adm-person">
      <Avatar name={name} />
      <div>
        <strong>{name || "Unnamed"}</strong>
        {sub && <span>{sub}</span>}
      </div>
    </div>
  );
}

// const [dialog, ask] = useConfirm(); ask({ title, message, confirmLabel, onConfirm }); render {dialog}.
export function useConfirm() {
  const [config, setConfig] = useState(null);
  const close = () => setConfig(null);
  const dialog = (
    <ConfirmDialog
      open={Boolean(config)}
      destructive={config?.destructive !== false}
      kicker={config?.kicker}
      title={config?.title}
      message={config?.message}
      confirmLabel={config?.confirmLabel || "Remove"}
      cancelLabel="Cancel"
      onCancel={close}
      onConfirm={async () => {
        const run = config?.onConfirm;
        close();
        if (run) await run();
      }}
    />
  );
  return [dialog, setConfig];
}

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many || `${one}s`}`;
