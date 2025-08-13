import React from "react";
import apiService from "../../services/apiService";

const BackupDatabaseForm: React.FC = () => {
  const handleBackup = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    // Prevent default form submission
    event.preventDefault();

    try {
      const form = event.currentTarget;
      if (!form) return;

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      const response = (await apiService.backupDatabase(
        data.password as string
      )) as any;

      if (response.status === 200) {
        // Create a blob from the response data
        const blob = new Blob([response.data.sql], { type: "application/sql" });

        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `database_monitoraggi_backup_${
          new Date().toISOString().split("T")[0]
        }.sql`;

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        form.reset();
      } else if (response.status === 400) {
        alert("Errore durante il backup del database: password errata");
      }
    } catch (error) {
      alert("Errore durante il backup del database: " + error);
    }
  };

  return (
    <form onSubmit={handleBackup} id="backup-database-form">
      <label>
        {/* <span> */}
        <span style={{ color: "red" }}>Attenzione:</span> fare il backup del
        database, seppur operazione fondamentale, significa che il database
        verrà scaricato sul tuo computer, per cui dati estremamente sensibili
        potrebbero essere esposti. Assicurati di avere un luogo sicuro dove
        conservarlo.
        {/* </span> */}
        <br />
        Inserisci di nuovo la tua password per confermare di aver compreso i
        rischi:
        <input
          type="password"
          name="password"
          required
          placeholder="Password"
        />
      </label>
      <button type="submit">Scarica Backup Database</button>
    </form>
  );
};

export default BackupDatabaseForm;
