import checkDiskSpace from 'check-disk-space';
/* eslint-disable no-console */

const CHECK_INTERVAL = 1000; // 1 second
const LOW_SPACE_THRESHOLD = 2; // 2 GB

export function diskSpaceMonitor(mainWindow) {

  // Periodically check disk space or check on a specific event
  setInterval(async () => {
    try {
      // For Windows, check a specific drive like 'C:'
      // For macOS/Linux, check a path like '/' or app.getPath('userData')
      const diskPath = process.platform === 'win32' ? 'C:' : '/';
      const diskSpace = await checkDiskSpace(diskPath);

      // Define what you consider "low disk space"
      // For example, less than 10GB free or less than 5% free
      const freeSpaceGB = diskSpace.free / (1024 * 1024 * 1024);
      const totalSpaceGB = diskSpace.size / (1024 * 1024 * 1024);
      const freePercentage = (diskSpace.free / diskSpace.size) * 100;



      console.log(`Disk Path: ${diskSpace.diskPath}`);
      console.log(`Free space: ${freeSpaceGB.toFixed(2)} GB`);
      console.log(`Total space: ${totalSpaceGB.toFixed(2)} GB`);
      console.log(`Free percentage: ${freePercentage.toFixed(2)}%`);

      let isLowDiskSpace = false;
      if (freeSpaceGB < LOW_SPACE_THRESHOLD) {
        isLowDiskSpace = true;
        console.warn('Low disk space detected!', isLowDiskSpace);
        // Send information to the renderer process to display a warning
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('disk-space-status', {
            isLow: true,
            free: freeSpaceGB.toFixed(2),
            total: totalSpaceGB.toFixed(2),
            percentage: freePercentage.toFixed(2),
            path: diskSpace.diskPath,
          });
        }
      } else {
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('disk-space-status', {
            isLow: false,
            free: freeSpaceGB.toFixed(2),
            total: totalSpaceGB.toFixed(2),
            percentage: freePercentage.toFixed(2),
            path: diskSpace.diskPath,
          });
        }
      }
    } catch (error) {
      console.error('Failed to check disk space:', error);
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('disk-space-status', {
          error: 'Failed to retrieve disk space information.',
        });
      }
    }
  }, CHECK_INTERVAL);
}
