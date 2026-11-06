# Tony “No Receipts” Bellanova

The latest revised character website, packaged for **GitHub Pages**.
This package preserves the revised story, wide-V Miami pose, cassette artwork,
five revised MP3 recordings, 2.4-second crossfades, newspaper reader, pose vault,
original dance, wind animation, and CCTV reenactment.

**No build command, package installation, API key, or backend is required.**
The website starts at `index.html`. All media paths are relative so this works
under a project address such as `https://YOUR-USERNAME.github.io/tony-bellanova/`.
That address is an example, not an already-published website.

## Publish with GitHub's website

1. Extract `Tony_Bellanova_GitHub_Ready.zip` on your computer.
   Open the extracted folder. You should see `index.html` alongside `assets`,
   `audio`, and `video`. Do not upload the ZIP itself.
2. In GitHub, create a **Public** repository called **tony-bellanova**.
   Enable **Add README** to initialize its default branch, normally `main`.
   GitHub Free supports Pages for public repositories.
3. In the repository, choose **Add file > Upload files**. Drag in the CONTENTS
   of the extracted folder: the loose files and the `assets`, `audio`, and
   `video` folders. Keep their internal folder structure. Do not drag in an
   enclosing `Tony_Bellanova_GitHub_Ready` folder.
   Commit the upload to `main`, replacing the initial README with this one.
   The repository's top level must show `index.html`.
4. Open the repository's **Settings > Pages**. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main** (or the actual default branch containing your upload)
   - Folder: **/(root)**
   - Click **Save**.
   This package uses branch publishing; do not select “GitHub Actions” as the
   custom publishing source. GitHub may still show its own Pages deployment
   job in the Actions tab, which is normal.
5. When the deployment succeeds, use **Visit site** in Settings > Pages.
   Share that public WEBSITE address, not the repository's Code-page address.
   With the suggested name it follows this pattern:
   `https://YOUR-USERNAME.github.io/tony-bellanova/`

The package has 100 files and each file is under 4 MiB. GitHub's browser upload
limit is 25 MiB per file and 100 files per upload. If an upload is interrupted,
upload the loose files first, then the three folders in separate commits.
The total ZIP size is not the per-file size after extraction.

The `.nojekyll` file disables Jekyll processing for this static site. Include
it in the upload; show hidden files in your file manager if necessary. No Git
LFS configuration is needed. Do not add the older all-in-one HTML to this repo.

## What gets published

```text
index.html       Home page and story
styles.css       Existing layout and styling
app.js           Newspaper, sightings, gallery and animation controls
poses.js         All 33 character poses and their rewritten captions
radio.js         Music playback, volume and crossfades
assets/          Referenced artwork, cassette images and animated WebP files
audio/           Five complete revised MP3 recordings
video/           CCTV vending-machine reenactment
.nojekyll        Static-file publishing marker
.gitignore       Excludes local secrets, archives and generated folders
```

Unused duplicate artwork, obsolete development reports, render scripts and the
large embedded HTML were left out of the deployment package. The published
HTML, CSS, JavaScript and referenced media are byte-for-byte copies of the
latest revised website; this is a hosting package, not another redesign.

## Behavior and privacy

- Music is enabled by default in the existing player. Browsers may require a
  click/tap before sound can begin. Selecting a cassette starts its recording.
- Google Fonts load online. The existing backup fonts apply if unavailable.
- The sighting-report button is a fictional interaction. It sends no report
  and stores no report. The site has no form submission backend.
- The receipt button downloads a fictional text file; it is not a checkout.
- No API keys, analytics scripts, payment handling, or account login are bundled.
  GitHub and Google handle requests under their own privacy terms.
- In a public repository, visitors can view/download the source and media.
  Review the fictional site and your rights to publish the assets before launch.

## Updating later

Upload changed files to the same paths in the publishing branch. GitHub Pages
republishes when that branch is updated. Keep the folder structure and spelling,
including case, unchanged. Do not add a leading `/` to the site's asset paths.

For a custom domain, configure it in Settings > Pages and update your DNS using
GitHub's instructions. No domain name or `CNAME` has been assumed in this package.

## Troubleshooting

- **404:** Check that `index.html` is directly at the repository root, that the
  chosen branch contains it, and that Pages is set to `/(root)`. Check the Pages
  deployment status rather than using the repository URL as the website URL.
- **No images or music:** Upload the three media folders as folders, not as ZIPs;
  do not flatten or rename their contents. Missing assets produce 404 responses.
- **Silent on first load:** Click a cassette or the sound control. Browser audio
  permissions apply even when the page's sound preference is on.
- **An old version appears:** Confirm the deployment has completed, then reload
  without cache. Check that you are opening the public Pages URL.
- **The README appears instead of the site:** `index.html` is missing or is in
  an extra enclosing folder. Move the website contents to the repository root.

## Official setup references

- Create a Pages site: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- Publishing branch settings: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- Browser file uploads: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- About Pages and its URL format: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

Packaged November 6, 2026. Publishing to an account is a separate step; this ZIP
has not created a repository or made the site live.
