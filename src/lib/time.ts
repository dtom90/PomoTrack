import humanizeDuration from 'humanize-duration';
import { mapState } from 'vuex';
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
interface DurationOptions {
  units: ('h' | 'm' | 's')[];
  largest: number;
  round: boolean;
  delimiter?: string; // Optional delimiter for displayChartDurationNewline
}

const baseDurationOptions: DurationOptions = {
  units: ['h', 'm', 's'],
  largest: 2,
  round: true
};

const minutesToMs = (mins: number): number => mins * 60000;

type DayInput = string | number | Date | Dayjs;

const displayDateHuman = (day: DayInput): string => dayjs(day).format('ddd MMM DD');

const displayFullDateHuman = (day: DayInput): string => dayjs(day).format('dddd MMM DD');

const displayDuration = (ms: number): string => humanizeDuration(ms, baseDurationOptions);

// Define interfaces for Vuex state (adjust types as needed)
interface SettingsState {
  timeFormat24?: boolean;
  // Add other settings properties here
}

interface TempState {
  overtime: boolean;
  secondsRemaining: number;
  // Add other tempState properties here
}

interface ComponentContext {
  settings: SettingsState;
  tempState: TempState;
  msToMinutes: (ms: number) => number;
  stringToMs: (str: DayInput) => number;
  displayDateFormat: () => string;
  displayTimeFormat: () => string;
  displayDateTimeFormat: () => string;
}

export default {
  computed: {
    ...mapState([
      'settings', // Assumes 'settings' and 'tempState' are mapped from Vuex
      'tempState'
    ]),

    displayCountdownTime(this: ComponentContext): string {
      const totalSecs = this.tempState.overtime ? -this.tempState.secondsRemaining : this.tempState.secondsRemaining;
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      const secString = secs.toString().padStart(2, '0');
      return `${this.tempState.overtime ? '+' : ''}${mins}:${secString}`;
    }
  },

  methods: {
    msToMinutes: (ms: number): number => ms / 60000,

    minutesToMs,

    stringToMs: (str: DayInput): number => dayjs(str).valueOf(),

    stringToMinutes(this: ComponentContext, str: DayInput): number {
      return this.msToMinutes(this.stringToMs(str));
    },

    // a and b are DayInput types
    dateDiffInDays(a: DayInput, b: DayInput): number {
      const ua = dayjs.utc(a);
      const ub = dayjs.utc(b);
      return Math.abs(ua.diff(ub, 'day'));
    },

    daysLater: (a: DayInput, diffDays: number): Dayjs => dayjs.utc(a).add(diffDays, 'day'),

    displayTimeFormat(this: ComponentContext): string {
      return this.settings ? `${this.settings.timeFormat24 ? 'H' : 'h'}:mm${this.settings.timeFormat24 ? '' : ' A'}` : '';
    },

    displayDateFormat(this: ComponentContext): string {
      return 'YYYY-MM-DD'; // This doesn't seem to depend on context, could be a const
    },

    displayDateTimeFormat(this: ComponentContext): string {
      return this.displayDateFormat() + ' ' + this.displayTimeFormat();
    },

    displayWeekISO: (day: DayInput): string => {
      const djs = dayjs(day);
      return djs.format('YYYY-') + djs.week();
    },

    displayWeekHuman: (week: string): string[] => { // Assuming week is 'YYYY-WW'
      const [y, w] = week.split('-');
      const djs = dayjs().year(parseInt(y, 10)).week(parseInt(w, 10));
      return [`${displayDateHuman(djs.startOf('week'))} -`, displayDateHuman(djs.endOf('week'))];
    },

    displayMonthISO: (day: DayInput): string => {
      const djs = dayjs(day);
      return djs.format('YYYY-') + djs.month(); // Note: month() is 0-indexed
    },

    displayMonthHuman: (month: string): string => { // Assuming month is 'YYYY-M'
      const [y, m] = month.split('-');
      // month() is 0-indexed, but format('YYYY-M') gives 1-indexed month
      // Adjusting for 0-indexed month for dayjs().month()
      const djs = dayjs().year(parseInt(y, 10)).month(parseInt(m, 10) -1);
      return djs.format('MMM YYYY');
    },

    displayDateISO(this: ComponentContext, day: DayInput): string {
      return dayjs(day).format(this.displayDateFormat());
    },

    displayDateHuman,

    displayFullDateHuman,

    displayTimeHuman(this: ComponentContext, time?: DayInput): string {
      time = time || Date.now();
      return dayjs(time).format(this.displayTimeFormat());
    },

    displayDateTimeHuman(this: ComponentContext, time?: DayInput): string {
      time = time || Date.now(); // Allow optional time, default to now
      return dayjs(time).format(this.displayDateTimeFormat());
    },

    displayDuration
  }
};

const displayChartDuration = (mins: number): string => displayDuration(minutesToMs(mins));

const displayChartDurationNewline = (mins: number): string => humanizeDuration(
  minutesToMs(mins),
  { ...baseDurationOptions, delimiter: ',\n' } as DurationOptions // Use spread and type assertion
);

export {
  dayjs,
  displayDuration,
  displayChartDuration,
  displayChartDurationNewline
};
