import { GitHubCalendar } from "react-github-calendar";
import "../GeneralStyles.css";
import Link from "next/link";

export default function GithubDisplay() {
  return (
    <Link href="https://github.com/gabugw">
      <div
        style={{
          margin: "20px 20px",
          backgroundColor: "#b09381ff",
          padding: "30px",
          borderRadius: "8px",
          filter: "drop-shadow(5px 6px 4px #13121d96)",
          maxWidth: "90%",
        }}
      >
        <div className="subsection-title"> My Github Contributions</div>
        <GitHubCalendar
          username="gabugw"
          style={{ fontFamily: "Futura" }}
          theme={{
            light: ["#1f3540", "#b94619ff"],
            dark: ["#1f3540", "#b94619ff"],
          }}
        />
      </div>
    </Link>
  );
}
