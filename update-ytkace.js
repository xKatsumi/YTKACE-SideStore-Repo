// update-ytkace.js
import fetch from 'node-fetch';
import fs from 'fs';

const OWNER = 'itzzace';
const REPO = 'ytkace';

// ===== CUSTOMIZED FOR YOUR REPO =====
const YOUR_USERNAME = 'xKatsumi';
const YOUR_REPO = 'YTKACE-SideStore-Repo';
const BUNDLE_ID = 'com.google.ios.youtube';
const APP_NAME = 'YTKace';
const DEVELOPER = 'itzzace';

// Public YouTube icon (no need to host your own)
const ICON_URL = 'https://img.lightshot.app/8gRG1MrsTPO7ZiwX_JfmbA.jpeg';

// If you later want to use your own icon via GitHub Pages, change to:
// const ICON_URL = 'https://ahmadaradii.github.io/YTKACE-SideStore-Repo/icon.png';

const WEBSITE = 'https://itzzace.github.io/ytkace/';
const LOCALIZED_DESCRIPTION = 'YTKace – a modified YouTube client with extra features.';
const SUBTITLE = 'Enhanced YouTube for iOS';
const TINT_COLOR = 'FF0000';
// ====================================

async function main() {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`, {
    headers: {
      Accept: 'application/vnd.github+json'
      // GITHUB_TOKEN is automatically provided by Actions
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch latest release: ${res.status} ${res.statusText}`);
  }

  const release = await res.json();

  const version = release.tag_name.replace(/^v/, ''); // "0.9.1"
  const versionDate = release.published_at.slice(0, 10); // "YYYY-MM-DD"

  // Build a nicer versionDescription that mentions both IPAs
  const baseBody = release.body || '';
  const versionDescription =
    baseBody +
    `\n\nYouTube 21.34.3 requires iOS 17, so there are two IPAs:\n` +
    `• \`${APP_NAME}_${version}_YouTube_21.34.3.ipa\` for iOS 17 and newer\n` +
    `• \`${APP_NAME}_${version}_YouTube_21.33.6.ipa\` for iOS 16\n`;

  // Find all .ipa assets
  const ipaAssets = release.assets.filter(a => a.name.endsWith('.ipa'));
  if (ipaAssets.length === 0) {
    throw new Error('No .ipa assets found in latest release');
  }

  // Detect iOS 16 vs iOS 17+ by filename pattern
  // Expected:
  //   YTKACE_0.9.1_YouTube_21.33.6.ipa  -> iOS 16
  //   YTKACE_0.9.1_YouTube_21.34.3.ipa  -> iOS 17+
  const ios16Asset = ipaAssets.find(a => /YouTube_21\.33\.6\.ipa$/.test(a.name));
  const ios17Asset = ipaAssets.find(a => /YouTube_21\.34\.3\.ipa$/.test(a.name));

  const apps = [];

  // iOS 16 entry
  if (ios16Asset) {
    apps.push({
      name: `${APP_NAME} (iOS 16)`,
      bundleIdentifier: BUNDLE_ID,
      developerName: DEVELOPER,
      version,
      versionDate,
      versionDescription,
      downloadURL: ios16Asset.browser_download_url,
      iconURL: ICON_URL,
      size: ios16Asset.size,
      screenshotURLs: [],
      localizedDescription: LOCALIZED_DESCRIPTION + ' (iOS 16)',
      subtitle: SUBTITLE + ' (iOS 16)',
      tintColor: TINT_COLOR,
      beta: false
    });
  }

  // iOS 17+ entry
  if (ios17Asset) {
    apps.push({
      name: `${APP_NAME} (iOS 17+)`,
      bundleIdentifier: BUNDLE_ID,
      developerName: DEVELOPER,
      version,
      versionDate,
      versionDescription,
      downloadURL: ios17Asset.browser_download_url,
      iconURL: ICON_URL,
      size: ios17Asset.size,
      screenshotURLs: [],
      localizedDescription: LOCALIZED_DESCRIPTION + ' (iOS 17+)',
      subtitle: SUBTITLE + ' (iOS 17+)',
      tintColor: TINT_COLOR,
      beta: false
    });
  }

  // Fallback: if patterns don't match but we have IPAs, just add them generically
  if (apps.length === 0 && ipaAssets.length > 0) {
    for (const asset of ipaAssets) {
      apps.push({
        name: APP_NAME,
        bundleIdentifier: BUNDLE_ID,
        developerName: DEVELOPER,
        version,
        versionDate,
        versionDescription,
        downloadURL: asset.browser_download_url,
        iconURL: ICON_URL,
        size: asset.size,
        screenshotURLs: [],
        localizedDescription: LOCALIZED_DESCRIPTION,
        subtitle: SUBTITLE,
        tintColor: TINT_COLOR,
        beta: false
      });
    }
  }

  // This is the URL users will add in SideStore/LiveContainer
  const sourceURL = `https://raw.githubusercontent.com/${YOUR_USERNAME}/${YOUR_REPO}/main/ytkace.json`;

  const sidestore = {
    name: 'YTKace',
    identifier: 'com.itzzace.ytkace.source', // repo ID, NOT the app bundle ID
    subtitle: 'YTKace for SideStore & LiveContainer',
    description:
      'Unofficial SideStore/LiveContainer source for YTKace. This repo only provides links; the app is maintained by itzzace.',
    iconURL: ICON_URL,
    website: WEBSITE,
    sourceURL: sourceURL,
    apps: apps,
    news: []
  };

  // Write to ytkace.json (not sidestore.json)
  fs.writeFileSync('ytkace.json', JSON.stringify(sidestore, null, 2) + '\n');

  console.log(`Generated ytkace.json with ${apps.length} app(s)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
