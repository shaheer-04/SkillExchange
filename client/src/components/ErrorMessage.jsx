/**
 * A red alert box for backend or validation errors.
 * Accepts a single string or an array of strings.
 */
export default function ErrorMessage({ error, onRetry }) {
  if (!error) return null;

  const items = Array.isArray(error) ? error : [error];

  return (
    <div className="alert alert-error" role="alert">
      {items.length === 1 ? (
        <span>{items[0]}</span>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      {onRetry && (
        <button type="button" className="btn btn-sm btn-outline" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
