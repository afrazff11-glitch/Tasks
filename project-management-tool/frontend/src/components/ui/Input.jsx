export const Input = ({ label, error, multiline = false, className = "", ...props }) => {
  const Field = multiline ? "textarea" : "input";

  return (
    <label className="input-group">
      {label ? <span className="input-label">{label}</span> : null}
      <Field className={["input", className].filter(Boolean).join(" ")} {...props} />
      {error ? <span className="input-error">{error}</span> : null}
    </label>
  );
};

export default Input;
