import React from "react";

import "../styles/form.css";

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
