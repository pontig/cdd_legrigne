import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlace } from "../contexts/PlaceContext";
import { useUser } from "../contexts/UserContext";
import { useSemester } from "../contexts/SemesterContext";
import { apiService } from "../services/apiService";
import LeftBar from "../components/LeftBar";
import { FaPrint, FaTable } from "react-icons/fa";
import { ImStatsBars } from "react-icons/im";
import { IoCaretBackOutline } from "react-icons/io5";

import "../styles/appreciations.css";

interface Root {
  activities: Activity[];
  appreciations: Appreciation[];
}

interface Activity {
  abbreviazione: string;
  id: number;
  nome_attivita: string;
}

interface Appreciation {
  activities: AppreciationActivity[];
  id_persona: number;
  nome: string;
  cognome: string;
  graph: string;
}

interface AppreciationActivity {
  attivita: number;
  id_persona: number;
  media_adesione: number;
  media_partecipazione: number;
  n_volte: number;
}

const Appreciations: React.FC = () => {
  const fetchAppreciations = async (): Promise<void> => {
    const response = await apiService.fetchAppreciations();
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
      const data = response.data as Root;
      setActivities(data.activities);
      setAppreciations(data.appreciations);
    }
  };

  const { user, setUser } = useUser();
  const {
    semesterString,
    semesterNumber,
    setSemesterString,
    setSemesterNumber,
  } = useSemester();
  const { place, setPlace } = usePlace();
  const navigate = useNavigate();
  const [appreciations, setAppreciations] = useState<Appreciation[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [graphIsShown, setGraphIsShown] = useState<boolean>(false);

  // Filter activities that have at least one entry
  const activitiesWithData = activities.filter((activity) =>
    appreciations.some((appreciation) =>
      appreciation.activities.some((a) => a.attivita === activity.id)
    )
  );

  // Effects
  useEffect(() => {
    fetchAppreciations();
  }, []);

  return (
    <div className="main-container">
      <LeftBar
        entries={[
          {
            title: graphIsShown ? "Visualizza tabella" : "Visualizza grafico",
            action: () => setGraphIsShown(!graphIsShown),
            icon: graphIsShown ? <FaTable /> : <ImStatsBars />,
          },
          {
            title: "Stampa questa pagina",
            action: () => window.print(),
            icon: <FaPrint />,
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
        <div className="header longer-header">
          <h1>Gradimenti attività</h1>
          <p className="subtitle">{semesterString}</p>
        </div>
        {!graphIsShown ? (
          <table className="wide-table problem-behavior-table">
            <thead>
              <tr>
                <th rowSpan={2} className="ttl">
                  Cognome
                </th>
                <th rowSpan={2}>Nome</th>
                {activitiesWithData.map((activity) => (
                  <th
                    title={activity.nome_attivita}
                    key={activity.id}
                    colSpan={3}
                    style={{ position: "sticky", top: 0 }}
                  >
                    {activity.abbreviazione}
                  </th>
                ))}
              </tr>
              <tr>
                {activitiesWithData.map((activity) => (
                  <Fragment key={activity.id}>
                    <th>a</th>
                    <th>p</th>
                    <th>#</th>
                  </Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {appreciations.map((appreciation) => (
                <tr key={appreciation.id_persona}>
                  <td>{appreciation.cognome}</td>
                  <td
                    style={{
                      position: "sticky",
                      left: 0,
                      backgroundColor: "inherit",
                    }}
                  >
                    {appreciation.nome}
                  </td>
                  {activitiesWithData.map((activity) => {
                    const activityData = appreciation.activities.find(
                      (a) => a.attivita === activity.id
                    );
                    const getBackgroundColor = (value: number | undefined) => {
                      if (value === undefined) return "";
                      if (value >= 66) return "#90EE90";
                      if (value <= 33) return "#FFB6C1";
                      return "#ffff9bff";
                    };

                    return (
                      <Fragment key={activity.id}>
                        <td
                          style={{
                            backgroundColor: getBackgroundColor(
                              activityData?.media_adesione
                            ),
                          }}
                        >
                          {activityData
                            ? activityData.media_adesione.toFixed(0)
                            : "-"}
                        </td>
                        <td
                          style={{
                            backgroundColor: getBackgroundColor(
                              activityData?.media_partecipazione
                            ),
                          }}
                        >
                          {activityData
                            ? activityData.media_partecipazione.toFixed(0)
                            : "-"}
                        </td>
                        <td>{activityData ? activityData.n_volte : "-"}</td>
                      </Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="appreciations-graph-container">
            {appreciations.map((appreciation) => (
              <div key={appreciation.id_persona} className="graph">
                <h3>
                  {appreciation.cognome} {appreciation.nome}
                </h3>
                <img
                  src={`data:image/png;base64,${appreciation.graph}`}
                  alt={`${appreciation.nome} ${appreciation.cognome} graph`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appreciations;
