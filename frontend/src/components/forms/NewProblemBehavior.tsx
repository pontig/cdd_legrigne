import React from "react";
import { useUser } from "../../contexts/UserContext";

interface ProblemItem {
  classe: string;
  id: number;
  nome: string;
}

interface NewProblemBehaviorFormProps {
  problems: { [key: string]: ProblemItem[] };
  editData?: {
    date: string;
    intensity: string;
    duration: string;
    cause: string;
    containment: string;
    problem_statuses: boolean[];
  };
}

const NewProblemBehaviorForm: React.FC<NewProblemBehaviorFormProps> = ({
  problems,
  editData,
}) => {
  const { user } = useUser();

  return (
    <form method="post">
      <label>
        Data:
        <input type="date" name="date" defaultValue={editData?.date || ""} />
      </label>
      <div>
        <label>Tipologia di comportamento:</label>
        {Object.keys(problems).map((classe) => (
          <div key={classe} style={{ marginBottom: "15px" }}>
            <h4 style={{ marginBottom: "8px", fontWeight: "bold" }}>
              {classe}
            </h4>
            {problems[classe]
              .sort((a: ProblemItem, b: ProblemItem) => a.id - b.id)
              .map((problem: ProblemItem) => (
                <div
                  key={problem.id}
                  style={{ marginLeft: "20px", marginBottom: "5px" }}
                >
                  <label style={{ display: "flex", alignItems: "center" }}>
                    <input
                      type="checkbox"
                      name="problems"
                      value={problem.id}
                      defaultChecked={
                        editData?.problem_statuses?.[problem.id - 1] || false
                      }
                      style={{ marginRight: "8px" }}
                    />
                    {problem.nome}
                  </label>
                </div>
              ))}
          </div>
        ))}
      </div>
      <label>
        Intensità
        <select name="intensity" defaultValue={editData?.intensity || ""}>
          <option value="Lieve">Lieve</option>
          <option value="Media">Media</option>
          <option value="Grave">Grave</option>
        </select>
      </label>
      <label>
        Causa scatenante e descrizione:
        <textarea
          name="description"
          rows={4}
          defaultValue={editData?.cause || ""}
        />
      </label>
      <label>
        Contenimento:
        <select name="containment" defaultValue={editData?.containment || ""}>
          <option value="Verbale/relazionale">Verbale/relazionale</option>
          <option value="Dir. pedagogico">Dir. pedagogico</option>
          <option value="Strutturale">Strutturale</option>
        </select>
      </label>
      <label>
        {/* Firma: */}
        <input
          type="hidden"
          name="signature"
          value={
            // editData?.signature ||
            (user?.name ? user.name[0] : "") +
            (user?.surname ? user.surname[0] : "")
          }
        />
      </label>
      <button type="submit">{editData ? "Aggiorna" : "Inserisci"}</button>
    </form>
  );
};

export default NewProblemBehaviorForm;
