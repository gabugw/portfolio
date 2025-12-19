import { GitHubCalendar } from "react-github-calendar";
import "../GeneralStyles.css";
import Link from "next/link";

// type Contribution = {
//   date: string; // ISO date string, e.g., "2025-12-18"
//   // add other properties if needed
//   type?: string;
//   value?: number;
// };

export type Activity = {
  count: number;
  date: string;
  future?: boolean;
};

export type ActivityDayType = "future" | "today" | "yesterday" | "past";

export const getActivityDayType = (activity: Activity): ActivityDayType => {
  if (activity.future) return "future";

  const dateObj = parseISODate(activity.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isSameDay(dateObj, today)) return "today";

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  if (isSameDay(dateObj, yesterday)) return "yesterday";

  return "past";
};

export const formatActivityText = (activity: Activity): string => {
  const type = getActivityDayType(activity);
  if (type === "future") return `Upcoming (${formatDate(activity.date)})`;
  let countText: string;
  if (activity.count === 0) {
    countText = "No activity";
  } else {
    countText = `${activity.count} ${pluralize(
      activity.count,
      "contribution"
    )}`;
  }
  const suffix =
    type === "today"
      ? "today"
      : type === "yesterday"
      ? "yesterday"
      : `on ${formatDate(activity.date)}`;

  return `${countText} ${suffix}`;
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
    <div className="relativex w-screen h-screen z-0">
      <div
        style={{
          margin: "20px 20px",
          backgroundColor: "#b09381ff",
          padding: "30px",
          borderRadius: "8px",
          filter: "drop-shadow(5px 6px 4px #13121d96)",
          maxWidth: "90%",
          width: "920px",
          position: "absolute",
          bottom: "0",
          right: "0",
          transformOrigin: "bottom right",
        }}
      >
        <a
          href="https://github.com/gabugw"
          target="_blank"
          rel="noopener noreferrer"
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
        </a>
      </div>
    </div>
  );
}
