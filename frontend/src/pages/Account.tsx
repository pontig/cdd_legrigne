import React, { useEffect } from "react";
import LeftBar from "../components/LeftBar";
import { IoCaretBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import GenericForm from "../components/GenericForm";
import ChangePasswordForm from "../components/forms/ChangePasswordForm";
import NewOperatorForm from "../components/forms/NewOperator";
import apiService from "../services/apiService";
import { RiDeleteBin6Line } from "react-icons/ri";

import "../styles/account.css";
import BackupDatabaseForm from "../components/forms/BackupDatabaseForm";

interface Person {
  id: number;
  name: string;
  surname: string;
  activities: {
    day: number;
    month_int: number;
  }[];
}

interface AccountInfos {
  id: number;
  name: string;
  surname: string;
  permissions: number;
}

const Account: React.FC = () => {
  const fetchPersons = async (): Promise<void> => {
    const response = await apiService.fetchPersons();

    if (response.status === 401) {
      console.error("Unauthorized access - please log in.");
      navigate("/login");
      return;
    }

    if (response.error) {
      console.error("API call failed:", response.error);
      return;
    }

    if (response.data) {
      setPersons(response.data as Person[]);
    }
  };

  const fetchAccountInfos = async (): Promise<void> => {
    const response = await apiService.fetchAccountInfos();

    if (response.status === 401) {
      console.error("Unauthorized access - please log in.");
      navigate("/login");
      return;
    }

    if (response.error) {
      console.error("API call failed:", response.error);
      return;
    }

    if (response.data) {
      setAccountInfos(response.data as AccountInfos[]);
    }
  };

  const deleteGuest = async (id: number) => {
    const confirmed = window.confirm(
      "Sei sicuro di voler eliminare questo ospite?"
    );
    if (!confirmed) return;

    const response = await apiService.deleteGuest(id);

    if (response.status === 401) {
      console.error("Unauthorized access - please log in.");
      navigate("/login");
      return;
    }

    if (response.error) {
      console.error("API call failed:", response.error);
      return;
    }

    // Refresh the list of persons after deletion
    fetchPersons();
  };

  const handlePermissionChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number
  ) => {
    const newPermissions = parseInt(e.target.value);
    if (isNaN(newPermissions)) return;

    const response = await apiService.changePermissions(id, newPermissions);

    if (response.status === 401) {
      console.error("Unauthorized access - please log in.");
      navigate("/login");
      return;
    }

    if (response.status === 400) {
      console.error("Something went wrong. No changes were made.");
      return;
    }

    if (response.error) {
      console.error("API call failed:", response.error);
      return;
    }
  };

  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [persons, setPersons] = React.useState<Person[]>([]);
  const [accountInfos, setAccountInfos] = React.useState<AccountInfos[] | null>(
    null
  );

  // Effects
  useEffect(() => {
    if (user?.permissions && user.permissions >= 10) {
      fetchPersons();
    }
    if (user?.permissions && user.permissions >= 20) {
      fetchAccountInfos();
    }
  }, []);

  return (
    <div className="main-container">
      <LeftBar
        entries={[
          {
            title: "Indietro",
            action: () => {
              navigate(-1);
            },
            icon: <IoCaretBackOutline />,
          },
        ]}
      />
      <div>
        <div className="header">
          <h1>
            Account di {user?.name} {user?.surname}
          </h1>
        </div>
        <div>
          <GenericForm
            title="Cambia password"
            closeForm={() => {}}
            notShowScreen={true}
            positionedForm={true}
          >
            <ChangePasswordForm />
          </GenericForm>
          {user?.permissions && user.permissions >= 10 ? (
            <GenericForm
              title="Crea nuovo account per un operatore"
              closeForm={() => {}}
              notShowScreen={true}
              positionedForm={true}
            >
              <NewOperatorForm />
            </GenericForm>
          ) : null}
          {user?.permissions && user.permissions >= 20 ? (
            <>
            <div className="backup-database">
              <GenericForm
                title="Backup del database"
                closeForm={() => {}}
                notShowScreen={true}
                positionedForm={true}
              >
                <BackupDatabaseForm />
              </GenericForm>
            </div>
            <div
              className="remove-guest"
              style={{ textAlign: "center", margin: "6rem 0" }}
            >
              <h3>Rimuovi ospiti</h3>
              <table className="centered-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Cognome</th>
                    <th>Elimina</th>
                  </tr>
                </thead>
                <tbody>
                  {persons.map((person) => (
                    <tr key={person.id}>
                      <td>{person.name}</td>
                      <td>{person.surname}</td>
                      <td>
                        <button
                          className="delete-row-btn"
                          onClick={() => deleteGuest(person.id)}
                          title="Elimina questa registrazione"
                        >
                          <RiDeleteBin6Line />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          ) : null}
          {user?.permissions && user.permissions >= 1000 ? (
            <div style={{ textAlign: "center", margin: "6rem 0" }}>
              <h3>Gestisci permessi</h3>
              <table className="centered-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Cognome</th>
                    <th>Permessi</th>
                  </tr>
                </thead>
                <tbody>
                  {accountInfos ? (
                    accountInfos.map((account) => (
                      <tr key={account.id}>
                        <td>{account.name}</td>
                        <td>{account.surname}</td>
                        <td>
                          <input
                            type="number"
                            defaultValue={account.permissions}
                            onChange={(e) =>
                              handlePermissionChange(e, account.id)
                            }
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}>Nessun account trovato.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Account;
