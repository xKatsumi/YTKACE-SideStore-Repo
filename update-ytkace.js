// update-ytkace.js
import fetch from 'node-fetch';
import fs from 'fs';

const OWNER = 'itzzace';
const REPO = 'ytkace';

// Your repository details
const YOUR_USERNAME = 'xKatsumi';
const YOUR_REPO = 'YTKACE-SideStore-Repo';

// YTKace app details
const BUNDLE_ID = 'com.google.ios.youtube';
const APP_NAME = 'YTKace';
const DEVELOPER = 'itzzace';

const ICON_URL = 'https://img.lightshot.app/8gRG1MrsTPO7ZiwX_JfmbA.jpeg';
const WEBSITE = 'https://itzzace.github.io/ytkace/';
const TINT_COLOR = 'FF0000';

function createApp(asset, name, subtitle, description, version, versionDate, versionDescription) {
  return {
    name,
    bundleIdentifier: BUNDLE_ID,
    developerName: DEVELOPER,
    version,
    versionDate,
    versionDescription,
    downloadURL: asset.browser_download_url,
    iconURL: ICON_URL,
    size: asset.size,
    screenshotURLs: [],
    localizedDescription: description,
    subtitle,
    tintColor: TINT_COLOR,
    beta: false
  };
}

async function main() {
  const apiURL = `https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`;

  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  // This works both with Actions and if you run the script yourself.
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(apiURL, { headers });

  if (!res.ok) {
    throw new Error(`Failed to fetch latest release: ${res.status} ${res.statusText}`);
  }

  const release = await res.json();

  const version = release.tag_name.replace(/^v/i, '');
  const versionDate = release.published_at.slice(0, 10);
  const versionDescription = release.body || '';

  // Get only IPA files, ignoring .deb and GitHub source-code archives.
  const ipaAssets = release.assets.filter(asset => /\.ipa$/i.test(asset.name));

  console.log('Latest release:', release.tag_name);
  console.log('IPA assets found:');
  ipaAssets.forEach(asset => console.log(`- ${asset.name}`));

  // Match the actual YouTube version in each filename.
  const ios16Asset = ipaAssets.find(asset => /YouTube_21\.33\.6\.ipa$/i.test(asset.name));
  const ios17Asset = ipaAssets.find(asset => /YouTube_21\.34\.3\.ipa$/i.test(asset.name));

  console.log('iOS 16 IPA:', ios16Asset ? ios16Asset.name : 'NOT FOUND');
  console.log('iOS 17+ IPA:', ios17Asset ? ios17Asset.name : 'NOT FOUND');

  // Stop the Action instead of silently writing an incomplete source.
  if (!ios16Asset || !ios17Asset) {
    throw new Error(
      'Could not find both expected IPAs. ' +
      `Found IPA files: ${ipaAssets.map(asset => asset.name).join(', ')}`
    );
  }

  const sourceURL =
    `https://raw.githubusercontent.com/${YOUR_USERNAME}/${YOUR_REPO}/main/ytkace.json`;

  const sidestore = {
    name: APP_NAME,
    identifier: 'com.itzzace.ytkace.source',
    subtitle: 'YTKace for SideStore & LiveContainer',
    description:
      'Unofficial SideStore/LiveContainer source for YTKace. This repo only provides links; the app is maintained by itzzace.',
    iconURL: ICON_URL,
    website: WEBSITE,
    sourceURL,
    apps: [
      createApp(
        ios16Asset,
        'YTKace (iOS 16)',
        'Enhanced YouTube for iOS 16',
        'YTKace – a modified YouTube client with extra features. Use this version on iOS 16.',
        version,
        versionDate,
        versionDescription
      ),
      createApp(
        ios17Asset,
        'YTKace (iOS 17+)',
        'Enhanced YouTube for iOS 17 and newer',
        'YTKace – a modified YouTube client with extra features. Use this version on iOS 17 or newer.',
        version,
        versionDate,
        versionDescription
      )
    ],
    news: []
  };

  fs.writeFileSync(
    'ytkace.json',
    JSON.stringify(sidestore, null, 2) + '\n'
  );

  console.log('Success: generated ytkace.json with 2 app entries.');
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
