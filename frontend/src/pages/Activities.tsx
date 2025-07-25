import React, { act, useEffect, useState } from "react";
import LeftBar from "../components/LeftBar";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { FaPencilAlt, FaPlus, FaPrint } from "react-icons/fa";
import {
  IoCaretBackOutline,
  IoCheckmarkDoneCircleSharp,
} from "react-icons/io5";
import { ImStatsBars } from "react-icons/im";
import { RiDeleteBin6Line } from "react-icons/ri";
import GenericForm from "../components/GenericForm";
import NewActivityForm from "../components/forms/NewActivity";
import "../styles/activities.css";

interface Activity {
  id: number;
  date: string;
  morning: boolean;
  activity: string;
  adesion: number;
  participation: number;
  mood: number;
  communication: number;
  problematic_behaviour: boolean;
}

const Activities: React.FC = () => {
  // API services
  const api = {
    baseUrl: "http://localhost:5000",

    async fetchActivities(personId: number): Promise<void> {
      try {
        const response = await fetch(
          `${api.baseUrl}/activities?person_id=${personId}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = (await response.json());
        const retr_activities = data.activities as Activity[];
        setActivities(retr_activities);
        setGraph(data.plot_image)

        const lastActivity = retr_activities[retr_activities.length - 1];
        setMostFrequentAdesion(lastActivity.adesion);
        setMostFrequentParticipation(lastActivity.participation);
        setMostFrequentMood(lastActivity.mood);
        setMostFrequentCommunication(lastActivity.communication);

      } catch (error) {
        console.error("API call failed: " + error);
      }
    },
  };

  // Navigation and state
  const arr_adesion = [
    "Su insistenza",
    "Su invito",
    "Spontanea",
    "Su sua richiesta",
  ];
  const arr_participation = [
    "Rifiuto-Imposs",
    "Solo relazionale",
    "Svolge in parte",
    "Attiva",
  ];
  const arr_mood = [
    "Triste",
    "Apatico",
    "Tranquillo",
    "Umore altalenante",
    "Irrequieto",
    "Sovratono",
    "Intollerante",
    "Estraniato dalla realtà",
  ];
  const arr_comunication = [
    "Isolato",
    "Adeguata alla sua condizione",
    "Logorroico",
    "Eloquio ossesivo",
  ];
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [guestId, setGuestId] = useState<number>(-1);
  const [guestFullName, setGuestFullName] = useState<string>("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [formIsShown, setFormIsShown] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1); // Index of activity being edited - will be used when saving changes
  const [graph, setGraph] = useState<any>(null); // Placeholder for graph data, if needed

  // Most frequent of the four arrays
  const [mostFrequentAdesion, setMostFrequentAdesion] = useState<number>(-1);
  const [mostFrequentParticipation, setMostFrequentParticipation] =
    useState<number>(-1);
  const [mostFrequentMood, setMostFrequentMood] = useState<number>(-1);
  const [mostFrequentCommunication, setMostFrequentCommunication] =
    useState<number>(-1);

  // Effects
  useEffect(() => {
    setGuestId(location.state.guestId);
    setGuestFullName(location.state.name + " " + location.state.surname);
    api.fetchActivities(guestId);
  }, []);

  // Functions and other hooks

  // Return
  return (
    <div className="main-container">
      <LeftBar
        entries={[
          {
            title: "Nuova registrazione",
            action: () => {
              setEditingActivity(null);
              setEditingIndex(-1);
              setFormIsShown(true);
            },
            icon: <FaPlus />,
          },
          {
            title: "Visualizza grafico",
            action: () => {},
            icon: <ImStatsBars />,
          },
          {
            title: "Stampa questa pagina",
            action: () => window.print(),
            icon: <FaPrint />,
          },
          {
            title: "Modifica registrazione",
            action: () => setEditMode(!editMode),
            icon: <FaPencilAlt />,
            disabled: (user?.permissions ?? 0) > 20 ? false : true, // TODO: non ricordo come è la dinamica precisa per ste cose
          },
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
          <h1>Partecipazione attività di {guestFullName}</h1>
        </div>
        <table className="wide-table">
          <thead>
            <tr>
              {editMode && <th>Azioni</th>}
              <th>Data</th>
              <th>Attività</th>
              <th>Adesione</th>
              <th>Partecipazione</th>
              <th>Umore</th>
              <th>Comunicazione</th>
              <th className="small centered">C. prob</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity, index) => (
              <tr key={activity.id}>
                {editMode && (
                  <td>
                    <div className="action-buttons">
                      {editMode &&
                        (() => {
                          // Calculate date range: past Monday to next Friday
                          const today = new Date();
                          const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
                          const monday = new Date(today);
                          monday.setDate(
                            today.getDate() - ((dayOfWeek + 6) % 7)
                          ); // Past Monday
                          const friday = new Date(monday);
                          friday.setDate(monday.getDate() + 4); // Next Friday

                          const activityDate = new Date(activity.date);

                          const isInRange =
                            activityDate >= monday && activityDate <= friday;

                          if ((user && user.permissions > 20) || isInRange) {
                            return (
                              <>
                                <button
                                  className="edit-row-btn"
                                  onClick={() => {
                                    setEditingActivity(activity);
                                    setEditingIndex(index);
                                    setFormIsShown(true);
                                    setEditMode(false); // Exit edit mode after selecting an item
                                  }}
                                  title="Modifica questa registrazione"
                                >
                                  <FaPencilAlt />
                                </button>
                                <button
                                  className="delete-row-btn"
                                  onClick={() => {
                                    // TODO: Implement delete functionality
                                    console.log(
                                      `Delete activity at index ${index}`
                                    );
                                  }}
                                  title="Elimina questa registrazione"
                                >
                                  <RiDeleteBin6Line />
                                </button>
                              </>
                            );
                          } else {
                            return <span>N/A</span>;
                          }
                        })()}
                    </div>
                  </td>
                )}
                <td>{activity.date}</td>
                <td>{activity.activity}</td>
                <td>{arr_adesion[activity.adesion - 1]}</td>
                <td>{arr_participation[activity.participation - 1]}</td>
                <td>{arr_mood[activity.mood - 1]}</td>
                <td>{arr_comunication[activity.communication - 1]}</td>
                <td className="centered">
                  {activity.problematic_behaviour ? (
                    <IoCheckmarkDoneCircleSharp />
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {graph && (
            <div className="graph-container">
            <img src={`data:image/png;base64,${graph}`} alt="Activities Graph" />
            </div>
        )}
        {formIsShown && (
          <GenericForm
            title={editingActivity ? "Modifica attività" : "Nuova attività"}
            closeForm={() => {
              setFormIsShown(false);
              setEditingActivity(null);
              setEditingIndex(-1);
            }}
          >
            <NewActivityForm
              editData={editingActivity || undefined}
              mostFrequentAdesion={mostFrequentAdesion}
              mostFrequentParticipation={mostFrequentParticipation}
              mostFrequentMood={mostFrequentMood}
              mostFrequentCommunication={mostFrequentCommunication}
            />
          </GenericForm>
        )}
      </div>
    </div>
  );
};

export default Activities;
