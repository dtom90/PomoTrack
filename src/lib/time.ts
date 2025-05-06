import humanizeDuration from 'humanize-duration';
import { computed } from 'vue';
import { useStore } from 'vuex';
import dayjs, { Dayjs } from 'dayjs'; // Import Dayjs type
import dayOfYear from 'dayjs/plugin/dayOfYear';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import utc from 'dayjs/plugin/utc';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(dayOfYear);
dayjs.extend(weekOfYear);
dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

// Define type for duration options
export interface DurationOptions {
  units: ('h' | 'm' | 's')[];
  largest: number;
  round: boolean;
  delimiter?: string; // Optional delimiter for displayChartDurationNewline
}

export const baseDurationOptions: DurationOptions = {
  units: ['h', 'm', 's'],
  largest: 2,
  round: true
};

export const minutesToMs = (mins: number): number => mins * 60000;
export const msToMinutes = (ms: number): number => ms / 60000;

export type DayInput = string | number | Date | Dayjs;

export const stringToMs = (str: DayInput): number => dayjs(str).valueOf();
export const stringToMinutes = (str: DayInput): number => msToMinutes(stringToMs(str));

export const displayDateHuman = (day: DayInput): string => dayjs(day).format('ddd MMM DD');
export const displayFullDateHuman = (day: DayInput): string => dayjs(day).format('dddd MMM DD');
export const displayDuration = (ms: number): string => humanizeDuration(ms, baseDurationOptions);

// Define interfaces for Vuex state (adjust types as needed)
export interface SettingsState {
  timeFormat24?: boolean;
  activeMinutes?: number;
  restMinutes?: number;
  continueOnComplete?: boolean;
  secondReminderEnabled?: boolean;
  secondReminderMinutes?: number;
  // Add other settings properties here
}

export interface TempState {
  active: boolean;
  overtime: boolean;
  secondsRemaining: number;
  running?: boolean;
  activeTaskID?: string | null;
  // Add other tempState properties here
}

// --- Start of functions previously in mixin methods or standalone ---

export const dateDiffInDays = (a: DayInput, b: DayInput): number => {
  const ua = dayjs.utc(a);
  const ub = dayjs.utc(b);
  return Math.abs(ua.diff(ub, 'day'));
};

export const daysLater = (a: DayInput, diffDays: number): Dayjs => dayjs.utc(a).add(diffDays, 'day');

export const displayDateFormat = (): string => 'YYYY-MM-DD';

export const displayWeekISO = (day: DayInput): string => {
  const djs = dayjs(day);
  return djs.format('YYYY-') + djs.week();
};

export const displayWeekHuman = (week: string): string[] => {
  const [y, w] = week.split('-');
  const djs = dayjs().year(parseInt(y, 10)).week(parseInt(w, 10));
  return [`${displayDateHuman(djs.startOf('week'))} -`, displayDateHuman(djs.endOf('week'))];
};

export const displayMonthISO = (day: DayInput): string => {
  const djs = dayjs(day);
  return djs.format('YYYY-') + djs.month(); // Note: month() is 0-indexed
};

export const displayMonthHuman = (month: string): string => {
  const [y, m] = month.split('-');
  const djs = dayjs().year(parseInt(y, 10)).month(parseInt(m, 10) -1);
  return djs.format('MMM YYYY');
};

export const displayDateISO = (day: DayInput): string => {
  return dayjs(day).format(displayDateFormat());
};

// --- End of standalone utilities ---

// --- Start of useTime Composable ---
export function useTime() {
  const store = useStore();

  const settings = computed<SettingsState>(() => store.state.settings);
  const tempState = computed<TempState>(() => store.state.tempState);

  const displayCountdownTime = computed<string>(() => {
    if (!tempState.value) return '0:00'; // Guard against undefined state
    const totalSecs = tempState.value.overtime ? -tempState.value.secondsRemaining : tempState.value.secondsRemaining;
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const secString = secs.toString().padStart(2, '0');
    return `${tempState.value.overtime ? '+' : ''}${mins}:${secString}`;
  });

  const displayTimeFormat = computed<string>(() => {
    if (!settings.value) return ''; // Guard against undefined state
    return `${settings.value.timeFormat24 ? 'H' : 'h'}:mm${settings.value.timeFormat24 ? '' : ' A'}`;
  });

  const displayDateTimeFormat = computed<string>(() => {
    return displayDateFormat() + ' ' + displayTimeFormat.value;
  });

  const displayTimeHuman = (time?: DayInput): string => {
    const t = time || Date.now();
    return dayjs(t).format(displayTimeFormat.value);
  };

  const displayDateTimeHuman = (time?: DayInput): string => {
    const t = time || Date.now();
    return dayjs(t).format(displayDateTimeFormat.value);
  };

  return {
    settings,
    tempState,
    displayCountdownTime,
    displayTimeFormat,
    displayDateTimeFormat,
    displayTimeHuman,
    displayDateTimeHuman,
  };
}
// --- End of useTime Composable ---

// --- Start of other standalone exports (previously at end of file) ---

export const displayChartDuration = (mins: number): string => displayDuration(minutesToMs(mins));

export const displayChartDurationNewline = (mins: number): string => humanizeDuration(
  minutesToMs(mins),
  { ...baseDurationOptions, delimiter: ',\n' } as DurationOptions
);

export { dayjs };
