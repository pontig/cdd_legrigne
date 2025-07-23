import React, { useEffect } from "react";

import "../styles/form.css";
import { useUser } from "../contexts/UserContext";

interface FormPageProps {
  title: string;
  children: React.ReactNode;
  closeForm: () => void;
}

const GenericForm: React.FC<FormPageProps> = ({
  title,
  children,
  closeForm,
}) => {
  const { user } = useUser();
  useEffect(() => {
    if (!user || user.permissions < 20) {
      const dateInput =
        document.querySelector<HTMLInputElement>('input[name="date"]');
      if (dateInput) {
        const today = new Date();
        const day = today.getDay();
        // Calculate past Monday
        const pastMonday = new Date(today);
        pastMonday.setDate(today.getDate() - ((day + 6) % 7));
        // Calculate next Friday
        const nextFriday = new Date(today);
        nextFriday.setDate(today.getDate() + ((5 - day + 7) % 7));
        // Format as yyyy-mm-dd
        const formatDate = (d: Date) =>
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(d.getDate()).padStart(2, "0")}`;
        dateInput.min = formatDate(pastMonday);
        dateInput.max = formatDate(nextFriday);
      }
    }
  }, []);
  
  return (
    <>
      <div className="screen" onClick={() => closeForm()}></div>
      <div className="form-page">
        <div className="form-title-container">
          <h1>{title}</h1>
        </div>
        <div className="form-content">{children}</div>
      </div>
    </>
  );
};

export default GenericForm;
