export default class CountdownTimer {
  constructor (seconds, decrementTimerCallback, finishTimerCallback) {
    this.totalSeconds = seconds
    this.remainingSeconds = this.totalSeconds
    this.decrementTimerCallback = decrementTimerCallback
    this.finishTimerCallback = finishTimerCallback
    this.ID = null
  }
  
  setSeconds (seconds) {
    this.totalSeconds = seconds
    this.remainingSeconds = this.totalSeconds
  }
  
  start () {
    this.startTime = Date.now()
    this.endTime = this.startTime + (this.remainingSeconds * 1000)
    const t = this
    this.ID = setInterval(function () {
      const remainingMs = t.endTime - Date.now()
      t.remainingSeconds = Math.round(remainingMs / 1000)
      if (t.remainingSeconds <= 0) {
        t.finishTimerCallback(t.remainingSeconds)
      } else {
        t.decrementTimerCallback(t.remainingSeconds)
      }
    }, 1000)
  }
  
  pause () {
    clearInterval(this.ID)
  }
  
  clear () {
    clearInterval(this.ID)
    this.remainingSeconds = this.totalSeconds
  }
}
