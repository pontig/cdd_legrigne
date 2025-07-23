import React from "react";
import LeftBar from "../components/LeftBar";
import { FaPlus } from "react-icons/fa";
import { IoSparklesSharp } from "react-icons/io5";
import { ImStatsBars } from "react-icons/im";

import "../styles/home.css"
import { useUser } from "../contexts/UserContext";

interface Person {
  id: number;
  name: string;
  surname: string;
}

const MainPage: React.FC = () => {
  // API services
  const api = {
    baseUrl: "/be",

    // async foo(): Promise<void> ...
  };

  // Navigation and state
  const { user, setUser } = useUser();
  const [persons, setPersons] = React.useState<Person[]>([]);

  // Effects

  // Functions
  const handleRowClick = (person: Person) => {
    console.log(`Selected person: ${person.name} ${person.surname}`);
  };

  // Return

  // MOCKUP
  React.useEffect(() => {
    setPersons([
      { id: 1, name: "Mario", surname: "Rossi" },
      { id: 2, name: "Luigi", surname: "Verdi" },
      { id: 3, name: "Anna", surname: "Bianchi" },
      { id: 4, name: "Giulia", surname: "Neri" },
      { id: 5, name: "Paolo", surname: "Gialli" },
      { id: 6, name: "Francesca", surname: "Blu" },
      { id: 7, name: "Stefano", surname: "Viola" },
      { id: 8, name: "Elena", surname: "Marrone" },
      { id: 9, name: "Giorgio", surname: "Rosa" },
      { id: 10, name: "Sara", surname: "Argento" },
      { id: 11, name: "Davide", surname: "Bronzo" },
      { id: 12, name: "Martina", surname: "Celeste" },
      { id: 13, name: "Simone", surname: "Corallo" },
      { id: 14, name: "Alessia", surname: "Rubino" },
      { id: 15, name: "Matteo", surname: "Onice" },
      { id: 16, name: "Chiara", surname: "Perla" },
      { id: 17, name: "Fabio", surname: "Quarzo" },
      { id: 18, name: "Valentina", surname: "Ambra" },
      { id: 19, name: "Luca", surname: "Diamante" },
      { id: 20, name: "Federica", surname: "Smeraldo" },
    ]);
  }, []);

  return (
    <div className="main-container">
          <LeftBar 
          entries={[
            {title: "Nuovo ospite", action: () => console.log("Inserisci nuovo"), icon: <FaPlus />},
            {title: "Nuovo semestre", action: () => console.log("Cambio semestre"), icon: <IoSparklesSharp />, disabled: true},
            {title: "Visualizza gradimenti", action: () => console.log("Visualizza gradimenti"), icon: <ImStatsBars />},
          ]}
          />
    <div>
      <div className="header">
        <h1>MONITORAGGI CDD PRIMALUNA</h1>

        <p>
          <i className="subtitle">Visualizza dati di altri semestri</i>
        </p>
      </div>
      <table className="wide-table home-table">
        <thead>
          <tr>
            <th>Cognome</th>
            <th>Nome</th>
          </tr>
        </thead>
        <tbody>
          {persons.length > 0 ? (
            persons.map((person, idx) => (
              <tr key={idx} onClick={() => handleRowClick(person)} style={{ cursor: 'pointer' }}>
                <td>{person.surname}</td>
                <td>{person.name}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2}>Nessun dato disponibile</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default MainPage;
