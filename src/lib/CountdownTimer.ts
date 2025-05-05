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
      // Timer already running
      return;
    }
    this.startTime = Date.now();
    // Ensure endTime calculation is correct, potentially add a small buffer if needed
    this.endTime = this.startTime + (this.remainingSeconds * 1000);

    // Use arrow function to preserve 'this' context
    this.ID = setInterval(() => {
      if (!this.endTime) return; // Type guard

      const remainingMs = this.endTime - Date.now();
      this.remainingSeconds = Math.round(remainingMs / 1000);

      if (this.remainingSeconds <= 0) {
        // Ensure timer stops before calling callback
        this.clear(); // Clear interval *before* calling finish callback
        this.finishTimerCallback(this.remainingSeconds); // Pass the final (likely negative) remaining seconds
      } else {
        this.decrementTimerCallback(this.remainingSeconds);
      }
    }, 1000);
  }

  pause (): void {
    if (this.ID) {
      clearInterval(this.ID);
      this.ID = null;
      // Optionally adjust remainingSeconds based on paused time if needed
      // if (this.endTime) {
      //   this.remainingSeconds = Math.round((this.endTime - Date.now()) / 1000);
      // }
    }
  }

  clear (): void {
    if (this.ID) {
      clearInterval(this.ID);
      this.ID = null;
    }
    // Reset state
    this.remainingSeconds = this.totalSeconds;
    this.startTime = null;
    this.endTime = null;
  }
}
