import { useEffect } from "react";

export default function Toast({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(onDismiss, 2500);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;
  return <div className="toast" role="status" aria-live="polite">{message}</div>;
}
