
export default function FormField({ label, htmlFor, error, required, children }) {
  return (
    <div className={`form-field${error ? ' has-error' : ''}`}>
      <label htmlFor={htmlFor}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}
