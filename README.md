# YTKACE SideStore Repo

Unofficial [SideStore](https://sidestore.io) / [LiveContainer](https://github.com/LiveContainer/LiveContainer) source for **YTKACE**.

> This repo is **not** affiliated with the official YTKACE project.  
> It only provides a SideStore/LiveContainer-compatible JSON feed that links to the latest official YTKACE release from:  
> https://github.com/itzzace/ytkace

## What is this?

This repository automatically generates a SideStore/LiveContainer source file (`ytkace.json`) that points to the latest YTKACE IPA released by the official maintainer ([itzzace](https://github.com/itzzace/ytkace)).

- You do **not** download anything from this repo directly.
- This repo only provides a link to the official YTKACE release.
- All credit for YTKACE goes to the original developer.

## How to add this source

### In SideStore or LiveContainer

1. Open **SideStore** (or SideStore inside LiveContainer).
2. Go to **Sources**.
3. Tap **+** (Add Source).
4. Enter this URL:

   ```text
   https://raw.githubusercontent.com/AhmadAradii/YTKACE-SideStore-Repo/main/ytkace.json
   ```

5. Save.
6. Go back to the **Sources** tab.
7. You should see the **Repo** listed. Install or update it from there.

## Automatic updates

This repo uses GitHub Actions to automatically update `ytkace.json` whenever a new YTKACE release is published.

- A scheduled workflow runs **every hour** and checks for new releases.
- If a new version is found, `ytkace.json` is updated with:
  - New version number
  - New version date
  - New release notes
  - New direct IPA download link

You don’t need to do anything; just keep the source added in SideStore/LiveContainer.

## Notes

- This is an **unofficial** community repo.
- If YTKACE stops releasing updates or changes how releases are published, this source may stop working.
- For issues or feature requests related to YTKACE itself, please refer to the official repo:  
  https://github.com/itzzace/ytkace

## Credits

- YTKACE development: [itzzace](https://github.com/itzzace/ytkace)
