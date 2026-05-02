import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
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
      await login(form);
      navigate("/dashboard");
    } catch (submissionError) {
      setError(submissionError.response?.data?.message || submissionError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h1>Return to the board.</h1>
        <p className="auth-card__lede">
          Sign in to keep projects moving and keep every task visible across the team.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="name@company.com" required />
          <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Your password" required />
          {error ? <p className="form-error">{error}</p> : null}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="auth-card__footnote">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
