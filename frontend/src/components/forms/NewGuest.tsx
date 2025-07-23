import React from "react";

const NewGuestForm: React.FC = () => {
  return (
    <form method="POST">
      <label>
        Nome:
        <input type="text" name="name" />
      </label>
      <label>
        Cognome:
        <input type="text" name="surname" />
      </label>
      <button type="submit">Inserisci</button>
    </form>
  );
};

export default NewGuestForm;
