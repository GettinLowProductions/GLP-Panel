# GLP Server Panel page

Static page for GitHub Pages. No build step. Open `index.html` as-is.

## Publish

1. Put the contents of this folder on a branch named `gh-pages` in the public repo GettinLowProductions/GLP-Panel.
2. Set GitHub Pages to that branch, folder `/` (root).
3. The page is then at https://gettinlowproductions.github.io/GLP-Panel/

Do not add a custom domain. Do not add a CNAME file. Do not change DNS. This page stays on GitHub Pages, separate from playglp.com.

`main` stays the installers and the project README. This page belongs on `gh-pages`.

This folder is the prepared page only. Publishing and turning Pages on are separate steps.

## Download button

The button asks GitHub for the latest release, in this order:

1. CarterCanDo/GLP-Server-Panel-Releases
2. GettinLowProductions/GLP-Panel

The first of those whose latest release has a file named `GLP-Server-Panel-Setup.exe` is the one the button uses. If that lookup fails, the button still opens https://github.com/CarterCanDo/GLP-Server-Panel-Releases/releases/latest

"All releases" opens the releases list for the repo that supplied the installer.

## Download count

The number is GitHub's `download_count` for assets named exactly `GLP-Server-Panel-Setup.exe`, added up across both repos above. Prereleases are included. `SHA256SUMS.txt` and any other file are not counted.

GitHub's count includes downloads made by the panel's built-in updater.

The page remembers the last good total and version for 10 minutes. If GitHub answers 403 or 429, or the network fails, it shows that saved total when it has one. Otherwise it shows "See downloads on GitHub" and does not show 0.

Asset paths in this folder are relative, so the page works under `/GLP-Panel/`.
