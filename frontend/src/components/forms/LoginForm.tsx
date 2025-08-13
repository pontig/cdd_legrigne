import React from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/apiService";
import { useUser } from "../../contexts/UserContext";

const LoginForm: React.FC = () => {
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
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
    });

    if (response.status === 401) {
      alert("Nome o password errati.");
      return;
    }

    if (response.error) {
      alert("Login failed: " + response.error);
      return;
    }

    console.log("Login successful:", response);
    
        const data_ret = response.data as any;
        setUser({
          name: data_ret.name,
          surname: data_ret.surname,
          id: data_ret.user_id,
          permissions: data_ret.permissions,
        });

    if (data.password === "password") {
      alert(
        "Attenzione: stai usando la password di default. Cambiala subito nelle impostazioni."
      );
      navigate("/account")
      return;
    }

    navigate("/");
  };

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
