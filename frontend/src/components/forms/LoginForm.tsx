import React from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/apiService";
import { useUser } from "../../contexts/UserContext";

const LoginForm: React.FC = () => {

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
      // Prevent default form submission
      event.preventDefault();
      const form = document.querySelector("form");
      if (!form) return;

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      const response: { error?: string; data?: any } = await apiService.login({
            ...data,
            name:
              (data.name as string).charAt(0).toUpperCase() +
              (data.name as string).slice(1).toLowerCase(),
            surname:
              (data.surname as string).charAt(0).toUpperCase() +
              (data.surname as string).slice(1).toLowerCase(),
          })

        if (response.error) {
          alert("Login failed: " + response.error);
          return;
        }

        console.log("Login successful:", response);

        setUser({
          name: response.data.name,
          surname: response.data.surname,
          id: response.data.user_id,
          permissions: response.data.permissions,
        });

        navigate("/");

    }

  const navigate = useNavigate();
    const { user, setUser } = useUser();
  

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
