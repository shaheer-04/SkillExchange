/** A small spinner with a message, used while API requests are running. */
export default function Loading({ message = 'Loading...' }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
