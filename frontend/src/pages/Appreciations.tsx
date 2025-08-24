import React, { Fragment, useEffect, useState, useCallback } from "react";
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
  const bimestri = [
    "Gennaio - Febbraio",
    "Marzo - Aprile",
    "Maggio - Giugno",
    "Luglio - Agosto",
    "Settembre - Ottobre",
    "Novembre - Dicembre",
  ];
  const mesi = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const fetchAppreciations = useCallback(
    async (month?: number | null): Promise<void> => {
      setIsLoading(true);
      try {
        const response = month
          ? await apiService.fetchAppreciations(month)
          : await apiService.fetchAppreciations();
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
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const handleMonthChange = (month: number | null) => {
    setSelectedMonth(month);
    fetchAppreciations(month);
  };

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
          <h1>
            Gradimenti attività{" "}
            {selectedMonth !== null
              ? `per il mese di ${mesi[selectedMonth - 1]}`
              : ""}
          </h1>
          <p className="subtitle">{semesterString}</p>
          <div className="month-selector">
            <label
              htmlFor="month-select"
              style={{
                marginRight: "0.5rem",
                flexDirection: "row",
                fontSize: "1.5rem",
              }}
            >
              Mese:
              <select
                className="month-select"
                value={selectedMonth ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  handleMonthChange(value === "" ? null : parseInt(value));
                }}
              >
                <option value="">Tutti i dati del semestre</option>
                <option value="1">Gennaio</option>
                <option value="2">Febbraio</option>
                <option value="3">Marzo</option>
                <option value="4">Aprile</option>
                <option value="5">Maggio</option>
                <option value="6">Giugno</option>
                <option value="7">Luglio</option>
                <option value="8">Agosto</option>
                <option value="9">Settembre</option>
                <option value="10">Ottobre</option>
                <option value="11">Novembre</option>
                <option value="12">Dicembre</option>
              </select>
            </label>
          </div>
        </div>
        {isLoading ? (
          <div className="loading-container">Caricamento in corso...</div>
        ) : (
          <>
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
                  {appreciations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={2 + activitiesWithData.length * 3}
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        Nessuna attività per il periodo selezionato
                      </td>
                    </tr>
                  ) : (
                    appreciations.map((appreciation) => (
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
                          const getBackgroundColor = (
                            value: number | undefined
                          ) => {
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
                              <td>
                                {activityData ? activityData.n_volte : "-"}
                              </td>
                            </Fragment>
                          );
                        })}
                      </tr>
                    ))
                  )}
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
          </>
        )}
      </div>
    </div>
  );
};

export default Appreciations;
