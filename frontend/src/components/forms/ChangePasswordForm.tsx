import React, { useState } from "react";
import { apiService } from "../../services/apiService";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

const ChangePasswordForm: React.FC = () => {
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const response = await apiService.changePassword({
      ...data,
      user_id: user?.id,
    });

    if (response.status === 400) {
      alert("La vecchia password non è corretta.");
      return;
    }

    if (response.error) {
      alert("Password change failed: " + response.error);
      return;
    }

    alert("La password è stata cambiata con successo. Effettua il login di nuovo.");

    navigate("/login");
  };

  const { user, setUser } = useUser();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const navigate = useNavigate();

  const isFormValid =
    oldPassword !== "" &&
    newPassword !== "" &&
    confirmNewPassword !== "" &&
    newPassword === confirmNewPassword &&
    oldPassword !== newPassword;

  return (
    <form method="POST" onSubmit={handleSubmit}>
      <label>
        Vecchia Password:
        <input
          type="password"
          name="old_password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
      </label>
      <label>
        Nuova Password:
        <input
          type="password"
          name="new_password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </label>
      <label>
        Conferma Nuova Password:
        <input
          type="password"
          name="confirm_new_password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
        />
        <span className="error-message">
          {confirmNewPassword !== newPassword &&
            "Le password non corrispondono"}
          {oldPassword !== "" && confirmNewPassword === oldPassword &&
            " La nuova password non può essere uguale alla vecchia"}
        </span>
      </label>
      <button type="submit" disabled={!isFormValid}>
        Cambia Password
      </button>
    </form>
  );
};

export default ChangePasswordForm;
