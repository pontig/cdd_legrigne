import React, { useEffect, useState } from "react";
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
import { useSemester } from "../contexts/SemesterContext";
import { MdOutlineHistory } from "react-icons/md";
import { apiService } from "../services/apiService";

interface Person {
  id: number;
  name: string;
  surname: string;
  activities: {
    day: number;
    month_int: number;
  }[];
}

const MainPage: React.FC = () => {
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

  const handleNewSemester = async (): Promise<void> => {
    const confirmation = window.confirm(
      "ATTENZIONE: Sei sicuro di voler creare un nuovo semestre? Tutti i dati del semestre corrente non saranno più modificabili."
    );
    if (!confirmation) return;

    const response = await apiService.newSemester();

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
      console.log("New semester created successfully:", response.data);
    }

    window.location.reload();
  };

  // Navigation and state
  const { user, setUser } = useUser();
  const { semesterString } = useSemester();
  const { place, setPlace } = usePlace();
  const navigate = useNavigate();
  const [persons, setPersons] = useState<Person[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Person | null>(null);
  const [formIsShown, setFormIsShown] = useState(false);

  // Effects
  useEffect(() => {
    setPlace("Bellano");
    if (!user) {
      navigate("/login");
      return;
    }
    fetchPersons();
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
    };
  }, []);

  // Functions and other
  const buttons = [
    { title: "Diario", location: "/diario" },
    {
      title: "Partecipazione attività",
      location: "/partecipazione_attivita",
    },
    { title: "Comportamenti problema", location: "/comportamenti_problema" },
    { title: "Bagno", location: "/bagno" },
    { title: "Doccia", location: "/doccia" },
    { title: "Idratazione", location: "/idratazione" },
    { title: "Crisi epilettiche", location: "/crisi" },
    { title: "Attività mirate", location: "/attivita_mirate" },
  ];

  const filteredButtons = place === "Bellano" ? buttons.slice(0, 3) : buttons;

  const handleRowClick = (person: Person) => {
    console.log(`Selected person: ${person.name} ${person.surname}`);
    setSelectedGuest({
      id: person.id,
      name: person.name,
      surname: person.surname,
      activities: person.activities,
    });
  };

  const handleMissingActivityClick = (
    missing_activity: {
      day: number;
      month_int: number;
    },
    guestId: number,
    name: string,
    surname: string
  ) => {
    window.scrollTo({ top: 0 });
    navigate("/partecipazione_attivita", {
      state: { missing_activity, guestId, name, surname },
    });
  };

  // Return
  return (
    <div className="main-container">
      <LeftBar
        entries={[
          {
            title: "Nuovo ospite",
            action: () => setFormIsShown(true),
            icon: <FaPlus />,
            disabled: semesterString !== null,
          },
          {
            title: "Nuovo semestre",
            action: () => handleNewSemester(),
            icon: <IoSparklesSharp />,
            disabled: semesterString !== null || (user?.permissions ?? 0) < 20,
          },
          {
            title: "Visualizza altri semestri",
            action: () => navigate("/semestri"),
            icon: <MdOutlineHistory />,
          },
          {
            title: "Visualizza gradimenti",
            action: () => navigate("/gradimenti"),
            icon: <ImStatsBars />,
          },
        ]}
      />
      <div>
        <div className="header">
          <h1>MONITORAGGI CDD {place}</h1>
          <p className="subtitle">{semesterString}</p>
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
                  <td>
                    <span>
                      {semesterString === null &&
                        person.activities.map((activity) => (
                          <span
                            key={`${activity.day}.${activity.month_int}`}
                            className="missing-activity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMissingActivityClick(
                                activity,
                                person.id,
                                person.name,
                                person.surname
                              );
                            }}
                          >
                            ({activity.day}.{activity.month_int}){" "}
                          </span>
                        ))}
                    </span>
                    {person.surname}
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
