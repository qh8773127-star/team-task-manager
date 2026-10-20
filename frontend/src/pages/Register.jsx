import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/axios";

const inputClasses =
  "w-full rounded border px-3 py-2 text-gray-700 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const labelClasses = "mb-2 block text-sm font-semibold text-gray-700";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setValidationErrors([]);

    try {
      await api.post("/auth/register", formData);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const response = error.response?.data;

      if (response?.errors?.length > 0) {
        setValidationErrors(response.errors.map((item) => item.message));
      } else {
        setErrorMessage(
          response?.error || "Registration failed. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <section className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">
          Create an Account
        </h1>

        {(errorMessage || validationErrors.length > 0) && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-5 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {errorMessage && <p>{errorMessage}</p>}
            {validationErrors.length > 0 && (
              <ul className="list-disc space-y-1 pl-5">
                {validationErrors.map((message, index) => (
                  <li key={`${message}-${index}`}>{message}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label htmlFor="name" className={labelClasses}>
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              className={inputClasses}
              minLength={2}
              maxLength={100}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className={labelClasses}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className={labelClasses}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              className={inputClasses}
              minLength={6}
              maxLength={50}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/" className="font-semibold text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Register;
