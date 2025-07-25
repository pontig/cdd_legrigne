import React from "react";
import GenericForm from "../components/GenericForm";
import LoginForm from "../components/forms/LoginForm";

const LoginPage: React.FC = () => {
  return (
    <div>
      <div className="header">
        <h1>Login</h1>
      </div>
      <GenericForm title="Login" closeForm={() => {}} notShowScreen={true}>
        <LoginForm />
      </GenericForm>
    </div>
  );
};

export default LoginPage;
