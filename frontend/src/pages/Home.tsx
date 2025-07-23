import React, { useEffect } from "react";
import LeftBar from "../components/LeftBar";
import { FaPlus } from "react-icons/fa";
import { IoSparklesSharp } from "react-icons/io5";
import { ImStatsBars } from "react-icons/im";
import { useUser } from "../contexts/UserContext";
import { usePlace } from "../contexts/PlaceContext";
import HomeButtons from "../components/HomeButtons";
import GenericForm from "../components/GenericForm";
import NewGuestForm from "../components/forms/NewGuest";
import "../styles/home.css";

interface Person {
  id: number;
  name: string;
  surname: string;
}

const MainPage: React.FC = () => {
  // API services
  const api = {
    baseUrl: "http://localhost:5000/",

    async foo(): Promise<void> {
      try {
        // Example API call
        const response = await fetch(`${api.baseUrl}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response;
        console.log("API data:", data);
      } catch (error) {
        console.error("API call failed:", error);
      }
    }
  };

  // Navigation and state
  const { user, setUser } = useUser();
  const { place, setPlace } = usePlace();
  const [persons, setPersons] = React.useState<Person[]>([]);
  const [selectedGuest, setSelectedGuest] = React.useState<Person | null>(null);
  const [formIsShown, setFormIsShown] = React.useState(false);

  // Effects
  useEffect(() => {
    setPlace("Primaluna");
    setUser({
      name: "Elia",
      surname: "Pontiggia",
      id: 1,
      permissions: 100,
    });
    api.foo();
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedGuest(null);
        setFormIsShown(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    }
  }, []);

  // Functions and other
  const buttons = [
    { title: "Diario", location: "/diario" },
    {
      title: "Partecipazione attività",
      location: "/partecipazione",
    },
    { title: "Comportamenti problema", location: "/comportamenti" },
    { title: "Bagno", location: "/bagno" },
    { title: "Doccia", location: "/doccia" },
    { title: "Idratazione", location: "/idratazione" },
    { title: "Crisi epilettiche", location: "/crisi" },
    { title: "Attività mirate", location: "/attivita-mirate" },
  ];

  const filteredButtons =
    place === "Bellano" ? buttons.slice(0, 3) : buttons;

  const handleRowClick = (person: Person) => {
    console.log(`Selected person: ${person.name} ${person.surname}`);
    setSelectedGuest({
      id: person.id,
      name: person.name,
      surname: person.surname,
    });
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
          {
            title: "Nuovo ospite",
            action: () => setFormIsShown(true),
            icon: <FaPlus />,
          },
          {
            title: "Nuovo semestre",
            action: () => console.log("Cambio semestre"),
            icon: <IoSparklesSharp />,
            disabled: (user?.permissions ?? 0) > 20 ? false : true,
          },
          {
            title: "Visualizza gradimenti",
            action: () => console.log("Visualizza gradimenti"),
            icon: <ImStatsBars />,
          },
        ]}
      />
      <div>
        <div className="header">
          <h1>MONITORAGGI CDD {place}</h1>

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
                <tr
                  key={idx}
                  onClick={() => handleRowClick(person)}
                  style={{ cursor: "pointer" }}
                >
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
        {selectedGuest && (
          <>
            <div
              className="screen"
              onClick={() => setSelectedGuest(null)}
            ></div>
            <HomeButtons
              name={selectedGuest.name}
              surname={selectedGuest.surname}
              guestId={selectedGuest.id}
              buttons={filteredButtons}
            />
          </>
        )}
        {formIsShown && (
          <GenericForm
            title="Inserisci nuovo ospite"
            closeForm={() => setFormIsShown(false)}
          >
            <NewGuestForm />
          </GenericForm>
        )}
      </div>
    </div>
  );
};

export default MainPage;
