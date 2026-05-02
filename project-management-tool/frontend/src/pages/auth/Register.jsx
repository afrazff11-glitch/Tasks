import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await register(form);
      navigate("/dashboard");
    } catch (submissionError) {
      setError(submissionError.response?.data?.message || submissionError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-shell auth-shell--accent">
      <section className="auth-card">
        <p className="eyebrow">Join the workspace</p>
        <h1>Set up the project hub.</h1>
        <p className="auth-card__lede">
          Create a new account, invite teammates later, and start shaping the board.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input label="Full name" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Alex Morgan" required />
          <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="name@company.com" required />
          <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" required />
          {error ? <p className="form-error">{error}</p> : null}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="auth-card__footnote">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
};

export default Register;
