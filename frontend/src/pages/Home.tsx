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
import { useNavigate } from "react-router-dom";

interface Person {
  id: number;
  name: string;
  surname: string;
  activities: {
    day: number;
    month_int: number;
  }[]
}

const MainPage: React.FC = () => {
  // API services
  const api = {
    baseUrl: "http://localhost:5000",

    async foo(): Promise<void> {
      try {        
        const response = await fetch(`${api.baseUrl}/home`);
        if (response.status === 401) {
          console.error("Unauthorized access - please log in.");
          navigate("/login");
          return;
        }
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json() as Person[];
        setPersons(data);
      } catch (error) {
        console.error("API call failed: " + error);
      }
    }
  };

  // Navigation and state
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const { place, setPlace } = usePlace();
  const [persons, setPersons] = React.useState<Person[]>([]);
  const [selectedGuest, setSelectedGuest] = React.useState<Person | null>(null);
  const [formIsShown, setFormIsShown] = React.useState(false);

  // Effects
  useEffect(() => {
    setPlace("Bellano");
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
      location: "/partecipazione_attivita",
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
      activities: person.activities,
    });
  };

  const handleMissingActivityClick = (activity: { day: number; month_int: number }) => {
    console.log(`Clicked on activity: ${activity.day}.${activity.month_int}`);
    
  }

  // Return
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
                  <td>{person.surname} {" "}
                     <span>{
                  person.activities.map((activity) => (
                    <span key={`${activity.day}.${activity.month_int}`} className="missing-activity" onClick={(e) => { e.stopPropagation(); handleMissingActivityClick(activity); }}>({activity.day}.{activity.month_int}) </span>
                  ))}</span>
                  </td>
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
