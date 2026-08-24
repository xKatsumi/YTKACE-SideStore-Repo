// update-ytkace.js
import fetch from 'node-fetch';
import fs from 'fs';

const OWNER = 'itzzace';
const REPO = 'ytkace';

// ===== CUSTOMIZED FOR YOUR REPO =====
const YOUR_USERNAME = 'AhmadAradii';
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

  const version = release.tag_name.replace(/^v/, ''); // "1.2.3"
  const versionDate = release.published_at.slice(0, 10); // "YYYY-MM-DD"
  const versionDescription = release.body || '';

  const ipaAsset = release.assets.find(a => a.name.endsWith('.ipa'));
  if (!ipaAsset) {
    throw new Error('No .ipa asset found in latest release');
  }

  const downloadURL = ipaAsset.browser_download_url;
  const size = ipaAsset.size;

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
    apps: [
      {
        name: APP_NAME,
        bundleIdentifier: BUNDLE_ID, // must match the IPA's bundle ID
        developerName: DEVELOPER,
        version,
        versionDate,
        versionDescription,
        downloadURL,
        iconURL: ICON_URL,
        size,
        screenshotURLs: [],
        localizedDescription: LOCALIZED_DESCRIPTION,
        subtitle: SUBTITLE,
        tintColor: TINT_COLOR,
        beta: false
      }
    ],
    news: []
  };

  // Write to ytkace.json (not sidestore.json)
  fs.writeFileSync('ytkace.json', JSON.stringify(sidestore, null, 2) + '\n');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
