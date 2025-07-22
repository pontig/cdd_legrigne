import React from "react";

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
  const [persons, setPersons] = React.useState<Person[]>([]);

  // Effects

  // Functions
  const handleRowClick = (person: Person) => {
    console.log(`${person.name} ${person.surname}`);
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
              <tr key={idx} onClick={() => handleRowClick(person)}>
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
  );
};

export default MainPage;
