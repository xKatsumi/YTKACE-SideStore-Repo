// update-ytkace.js
import fetch from 'node-fetch';
import fs from 'fs';

const OWNER = 'itzzace';
const REPO = 'ytkace';

const YOUR_USERNAME = 'xKatsumi';
const YOUR_REPO = 'YTKACE-SideStore-Repo';

const BUNDLE_ID = 'com.google.ios.youtube';
const APP_NAME = 'YTKace';
const DEVELOPER = 'itzzace';

const ICON_URL = 'https://img.lightshot.app/8gRG1MrsTPO7ZiwX_JfmbA.jpeg';
const WEBSITE = 'https://itzzace.github.io/ytkace/';
const TINT_COLOR = 'FF0000';

function createApp({
  name,
  asset,
  version,
  versionDate,
  versionDescription,
  subtitle,
  localizedDescription
}) {
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
    localizedDescription,
    subtitle,
    tintColor: TINT_COLOR,
    beta: false
  };
}

function createSource({ identifier, sourceFilename, apps }) {
  return {
    name: APP_NAME,
    identifier,
    subtitle: 'YTKace for SideStore & LiveContainer',
    description:
      'Unofficial SideStore/LiveContainer source for YTKace. This repo only provides links; the app is maintained by itzzace.',
    iconURL: ICON_URL,
    website: WEBSITE,
    sourceURL:
      `https://raw.githubusercontent.com/${YOUR_USERNAME}/${YOUR_REPO}/main/${sourceFilename}`,
    apps,
    news: []
  };
}

// Reads a version such as 21.34.3 from:
// YTKACE_0.9.1_YouTube_21.34.3.ipa
function getYouTubeVersion(filename) {
  const match = filename.match(/YouTube_(\d+(?:\.\d+)+)\.ipa$/i);

  if (!match) {
    return [];
  }

  return match[1].split('.').map(Number);
}

// Sorts IPA assets by their YouTube version number.
function compareYouTubeVersions(a, b) {
  const aVersion = getYouTubeVersion(a.name);
  const bVersion = getYouTubeVersion(b.name);
  const maxLength = Math.max(aVersion.length, bVersion.length);

  for (let i = 0; i < maxLength; i += 1) {
    const difference = (aVersion[i] || 0) - (bVersion[i] || 0);

    if (difference !== 0) {
      return difference;
    }
  }

  return 0;
}

async function main() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch latest release: ${response.status} ${response.statusText}`
    );
  }

  const release = await response.json();

  // Keep only .ipa files and ignore .deb, source ZIP, and source tar.gz.
  const ipaAssets = (release.assets || []).filter(asset =>
    /\.ipa$/i.test(asset.name)
  );

  if (ipaAssets.length === 0) {
    throw new Error('No IPA assets found in the latest YTKace release.');
  }

  // Only accept IPA filenames with a YouTube version in their name.
  const versionedIpas = ipaAssets.filter(asset =>
    getYouTubeVersion(asset.name).length > 0
  );

  if (versionedIpas.length === 0) {
    throw new Error(
      `Could not find IPA filenames in the expected format. Found: ${ipaAssets
        .map(asset => asset.name)
        .join(', ')}`
    );
  }

  // Lowest version = compatibility/iOS 16 build.
  // Highest version = newer/iOS 17+ build.
  const sortedIpas = [...versionedIpas].sort(compareYouTubeVersions);
  const ios17Asset = sortedIpas.at(-1);
  const ios16Asset = sortedIpas.length >= 2 ? sortedIpas.at(-2) : null;

  console.log('Latest release:', release.tag_name);
  console.log('All IPA files:', ipaAssets.map(asset => asset.name));
  console.log('Selected SideStore IPA:', ios17Asset.name);

  if (ios16Asset) {
    console.log('Selected iOS 16 IPA:', ios16Asset.name);
  } else {
    console.log('No separate iOS 16 IPA found; LiveContainer will list one IPA.');
  }

  const version = String(release.tag_name).replace(/^v/i, '');
  const versionDate = String(release.published_at).slice(0, 10);
  const versionDescription = release.body || '';

  /*
   * File 1: ytkace.json
   * SideStore gets exactly one entry with the IPA's genuine bundle identifier.
   * This avoids SideStore merging duplicate entries or reporting an ID mismatch.
   */
  const sideStoreSource = createSource({
    identifier: 'com.itzzace.ytkace.source',
    sourceFilename: 'ytkace.json',
    apps: [
      createApp({
        name: 'YTKace',
        asset: ios17Asset,
        version,
        versionDate,
        versionDescription,
        subtitle: 'Enhanced YouTube for iOS 17 and newer',
        localizedDescription:
          'YTKace – a modified YouTube client with extra features. This build requires iOS 17 or newer.'
      })
    ]
  });

  /*
   * File 2: ytkace-livecontainer.json
   * LiveContainer can show both choices, even though both IPAs use the same
   * real app bundle identifier.
   */
  const liveContainerApps = [];

  if (ios16Asset) {
    liveContainerApps.push(
      createApp({
        name: 'YTKace (iOS 16)',
        asset: ios16Asset,
        version,
        versionDate,
        versionDescription,
        subtitle: 'Enhanced YouTube for iOS 16',
        localizedDescription:
          'YTKace – a modified YouTube client with extra features. Use this build on iOS 16.'
      })
    );
  }

  liveContainerApps.push(
    createApp({
      name: 'YTKace (iOS 17+)',
      asset: ios17Asset,
      version,
      versionDate,
      versionDescription,
      subtitle: 'Enhanced YouTube for iOS 17 and newer',
      localizedDescription:
        'YTKace – a modified YouTube client with extra features. Use this build on iOS 17 or newer.'
    })
  );

  const liveContainerSource = createSource({
    identifier: 'com.itzzace.ytkace.livecontainer.source',
    sourceFilename: 'ytkace-livecontainer.json',
    apps: liveContainerApps
  });

  // Write both source files.
  fs.writeFileSync(
    'ytkace.json',
    JSON.stringify(sideStoreSource, null, 2) + '\n'
  );

  fs.writeFileSync(
    'ytkace-livecontainer.json',
    JSON.stringify(liveContainerSource, null, 2) + '\n'
  );

  console.log('Created ytkace.json for SideStore.');
  console.log(
    `Created ytkace-livecontainer.json with ${liveContainerApps.length} IPA option(s).`
  );
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
