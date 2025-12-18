import { GitHubCalendar } from "react-github-calendar";
import "../GeneralStyles.css";
import Link from "next/link";

// type Contribution = {
//   date: string; // ISO date string, e.g., "2025-12-18"
//   // add other properties if needed
//   type?: string;
//   value?: number;
// };

export const formatActivityText = (activity: {
  count: number;
  date: string;
  future?: boolean;
}): string => {
  const dateObj = parseISODate(activity.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Future days
  if (activity.future) {
    return `Upcoming (${formatDate(activity.date)})`;
  }

  // Today
  if (isSameDay(dateObj, today)) {
    if (activity.count === 0) return "No activity today";
    return `${activity.count} ${pluralize(
      activity.count,
      "contribution"
    )} today`;
  }

  // Past days
  if (activity.count === 0) {
    return `No activity on ${formatDate(activity.date)}`;
  }

  return `${activity.count} ${pluralize(
    activity.count,
    "contribution"
  )} on ${formatDate(activity.date)}`;
};

// ---- Date helpers (timezone-safe) ----

export const parseISODate = (date: string): Date => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isFutureDate = (date: string): boolean => {
  const d = parseISODate(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d > today;
};

// ---- Text helpers ----

export const pluralize = (
  count: number,
  singular: string,
  plural = `${singular}s`
): string => (count === 1 ? singular : plural);

export const formatDate = (date: string): string =>
  parseISODate(date).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

export default function GithubDisplay() {
  const selectLastMonths = (contributions: any[], shownMonths = 12) => {
    const now = new Date();

    // Start = first day of (currentMonth - shownMonths + 1)
    const start = new Date(
      now.getFullYear(),
      now.getMonth() - shownMonths + 1,
      1
    );

    // End = last day of current month
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Fast lookup of existing contributions
    const map = new Map(contributions.map((c) => [c.date, c]));

    const filled: any[] = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      const dateStr = cursor.toISOString().slice(0, 10);

      filled.push(
        map.get(dateStr) ?? {
          date: dateStr,
          count: 0,
          level: 0,
          future: true,
        }
      );

      cursor.setDate(cursor.getDate() + 1);
    }

    return filled;
  };

  return (
    <Link href="https://github.com/gabugw">
      <div
        style={{
          margin: "20px 20px",
          backgroundColor: "#b09381ff",
          padding: "30px",
          borderRadius: "8px",
          filter: "drop-shadow(5px 6px 4px #13121d96)",
          maxWidth: "100%",
        }}
      >
        <div className="subsection-title"> My Github Activity</div>
        <GitHubCalendar
          username="gabugw"
          style={{ fontFamily: "Futura" }}
          theme={{
            light: ["#1f3540", "#b94619ff"],
            dark: ["#1f3540", "#b94619ff"],
          }}
          transformData={selectLastMonths}
          tooltips={{
            activity: {
              text: (activity) => formatActivityText(activity),
              placement: "right",
              offset: 6,
              hoverRestMs: 300,
              transitionStyles: {
                duration: 100,
                common: { fontFamily: "Futura" },
              },
              withArrow: true,
            },
          }}
        />
      </div>
    </Link>
  );
}
