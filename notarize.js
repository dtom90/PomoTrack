/* eslint-disable no-console */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { notarize } = require('@electron/notarize');

/**
 * @param {import('electron-builder').AfterPackContext} context
 */
exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== 'darwin') {
    console.log('Skipping notarization: Not a macOS build.');
    return;
  }

  const { APPLEID, APPLEIDPASS, TEAM_ID } = process.env;
  if (!APPLEID || !APPLEIDPASS || !TEAM_ID) {
    console.warn(
      'Skipping notarization: Missing APPLEID, APPLEIDPASS, or TEAM_ID environment variables.',
      'Ensure these are set for notarization.'
    );
    // Consider throwing an error if notarization is mandatory for the build
    // throw new Error('Missing required environment variables for notarization');
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appBundleId = context.packager.appInfo.id; // Get bundle ID from electron-builder config
  const appPath = `${appOutDir}/${appName}.app`;

  console.log(`Starting notarization for ${appBundleId} at ${appPath}...`);

  try {
    await notarize({
      tool: 'notarytool', // Use Apple's modern notarization tool
      appBundleId,
      appPath,
      appleId: APPLEID,
      appleIdPassword: APPLEIDPASS, // Must be an app-specific password
      teamId: TEAM_ID,
    });
    console.log(`Successfully notarized ${appBundleId}.`);
  } catch (error) {
    console.error(`Error during notarization for ${appBundleId}:`, error);
    // Re-throw the error to fail the CI build step
    throw error;
  }
};
