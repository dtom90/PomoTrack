export default class CountdownTimer {
  private totalSeconds: number;
  public remainingSeconds: number;
  private decrementTimerCallback: (remainingSeconds: number) => void;
  private finishTimerCallback: (remainingSeconds: number) => void;
  private ID: NodeJS.Timeout | null;
  private startTime: number | null;
  private endTime: number | null;

  constructor (seconds: number, decrementTimerCallback: (remainingSeconds: number) => void, finishTimerCallback: (remainingSeconds: number) => void) {
    this.totalSeconds = seconds;
    this.remainingSeconds = this.totalSeconds;
    this.decrementTimerCallback = decrementTimerCallback;
    this.finishTimerCallback = finishTimerCallback;
    this.ID = null;
    this.startTime = null;
    this.endTime = null;
  }

  setSeconds (seconds: number): void {
    this.totalSeconds = seconds;
    this.remainingSeconds = this.totalSeconds;
  }

  start (): void {
    if (this.ID) {
      return;
    }
    this.startTime = Date.now();
    this.endTime = this.startTime + (this.remainingSeconds * 1000);
    this.ID = setInterval(() => {
      if (!this.endTime) return;
      const remainingMs = this.endTime - Date.now();
      this.remainingSeconds = Math.round(remainingMs / 1000);
      if (this.remainingSeconds <= 0) {
        this.finishTimerCallback(this.remainingSeconds);
      } else {
        this.decrementTimerCallback(this.remainingSeconds);
      }
    }, 1000);
  }

  pause (): void {
    if (this.ID) {
      clearInterval(this.ID);
      this.ID = null;
    }
  }

  clear (): void {
    if (this.ID) {
      clearInterval(this.ID);
    }
    this.remainingSeconds = this.totalSeconds;
  }
}
