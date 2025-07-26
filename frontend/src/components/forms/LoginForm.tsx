import React from "react";
import { useNavigate } from "react-router-dom";

const LoginForm: React.FC = () => {
  const api = {
    baseUrl: "http://localhost:5000",

    async handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
      // Prevent default form submission
      event.preventDefault();
      const form = document.querySelector("form");
      if (!form) return;

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch(`${api.baseUrl}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ...data,
            name:
              (data.name as string).charAt(0).toUpperCase() +
              (data.name as string).slice(1).toLowerCase(),
            surname:
              (data.surname as string).charAt(0).toUpperCase() +
              (data.surname as string).slice(1).toLowerCase(),
          }),
        });

        if (!response.ok) {
          throw new Error("Login failed");
        }

        const result = await response.json();
        console.log("Login successful:", result);
        navigate("/");
      } catch (error) {
        console.error("Error during login:", error);
      }
    },
  };

  const navigate = useNavigate();

  return (
    <form method="POST" onSubmit={api.handleSubmit}>
      <label>
        Nome:
        <input type="text" name="name" required />
      </label>
      <label>
        Cognome:
        <input type="text" name="surname" required />
      </label>
      <label>
        Password:
        <input type="password" name="password" required />
      </label>
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginForm;
