import React, { useEffect, useState } from "react";
import LeftBar from "../components/LeftBar";
import { IoCaretBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useSemester } from "../contexts/SemesterContext";
import { usePlace } from "../contexts/PlaceContext";
import { useUser } from "../contexts/UserContext";
import { TiTickOutline } from "react-icons/ti";

interface Semester {
  id: number;
  start: string;
  end: string;
}

const Semesters: React.FC = () => {
  // API services
  const api = {
    baseUrl: "http://localhost:5000",

    async fetchSemestersList(): Promise<void> {
      try {
        const response = await fetch(`${api.baseUrl}/semesters_list`, {
          credentials: "include",
        });
        if (response.status === 401) {
          console.error("Unauthorized access - please log in.");
          navigate("/login");
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch semesters");
        }
        const data = (await response.json()) as Semester[];
        setSemesters(data);
      } catch (error) {
        console.error("API call failed: " + error);
      }
    },

    async setSemester(
      semesterId: number,
      from: string,
      to: string
    ): Promise<void> {
      try {
        const response = await fetch(`${api.baseUrl}/set_semester`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ semester_id: semesterId }),
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        setSemesterNumber(semesterId);
        setSemesterString(`Semestre dal ${from} al ${to}`);
        navigate("/");
      } catch (error) {
        console.error("API call failed: " + error);
      }
    },

    async resetSemester(): Promise<void> {
      try {
        const response = await fetch(`${api.baseUrl}/reset_semester`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        setSemesterNumber(null);
        setSemesterString(null);
        navigate("/");
      } catch (error) {
        console.error("API call failed: " + error);
      }
    },
  };

  // State
  const { user, setUser } = useUser();
  const {
    semesterString,
    semesterNumber,
    setSemesterString,
    setSemesterNumber,
  } = useSemester();
  const { place, setPlace } = usePlace();
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState<Semester[]>([]);

  // Effects
  useEffect(() => {
    api.fetchSemestersList();
  }, []);

  // Return
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
          <h1>Elenco Semestri</h1>
        </div>
        <table style={{ marginLeft: "auto", marginRight: "auto" }}>
          <thead>
            <tr>
              <th>Periodo</th>
              <th>Seleziona</th>
            </tr>
          </thead>
          <tbody>
            <tr key={-1}>
              <td>Semestre in corso</td>
              <td>
                <button
                  className="edit-row-btn"
                  onClick={() => {
                    api.resetSemester();
                  }}
                  style={{ textAlign: "center" }}
                >
                  <TiTickOutline />
                </button>
              </td>
            </tr>
            {semesters.map((semester) => (
              <tr key={semester.id}>
                <td>{`${semester.start} - ${semester.end}`}</td>
                <td>
                  <button
                    className="edit-row-btn"
                    onClick={() => {
                      api.setSemester(
                        semester.id,
                        semester.start,
                        semester.end
                      );
                    }}
                    style={{ textAlign: "center" }}
                  >
                    <TiTickOutline />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Semesters;
