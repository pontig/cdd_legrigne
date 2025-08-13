import React from "react";
import { useUser } from "../../contexts/UserContext";
import { apiService } from "../../services/apiService";

const NewOperatorForm: React.FC = () => {
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form) return;

    const formData = new FormData(form);
    
    // Format name and surname to be uppercase first
    const name = formData.get('name') as string;
    const surname = formData.get('surname') as string;
    
    if (name) {
      formData.set('name', name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
    }
    if (surname) {
      formData.set('surname', surname.charAt(0).toUpperCase() + surname.slice(1).toLowerCase());
    }
    const data = Object.fromEntries(formData.entries());
    const response = await apiService.newOperator(data);
    if (response.error) {
      alert("Operator creation failed: " + response.error);
      return;
    }

    window.location.reload();
  };

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
      {user?.permissions && user.permissions >= 20 ? (
        <label>
          Permessi:
          <input type="number" name="permissions" defaultValue={0} />
        </label>
      ) : null}
      <button type="submit">Crea</button>
    </form>
  );
};

export default NewOperatorForm;
