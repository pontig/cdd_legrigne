import React from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/apiService";

const LoginForm: React.FC = () => {

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
      // Prevent default form submission
      event.preventDefault();
      const form = document.querySelector("form");
      if (!form) return;

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      const response = await apiService.login({
            ...data,
            name:
              (data.name as string).charAt(0).toUpperCase() +
              (data.name as string).slice(1).toLowerCase(),
            surname:
              (data.surname as string).charAt(0).toUpperCase() +
              (data.surname as string).slice(1).toLowerCase(),
          })

        if (response.error) {
          throw new Error("Login failed");
        }

        console.log("Login successful:", response);
        navigate("/");

    }

  const navigate = useNavigate();

  return (
    <form method="POST" onSubmit={handleSubmit}>
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
