# CUBE workshop: setup on your own computer

**[Open the illustrated guide](https://balerahul.github.io/cube-workshop-user-machine-guide/)**

The guide covers Windows, macOS and Linux. Participants install Docker,
download a prepared CUBE package (CUBE develop `b6d6cf6a`), edit TOML inputs
and run the `cube` program with them.
No compiler or cluster account is needed.

**[Download the tutorial packages](https://github.com/balerahul/cube-workshop-user-machine-guide/releases/tag/workshop-2026-b6d6cf6a)**

- `CUBE-laptop-2026-b6d6cf6a-arm64.zip`: Apple Silicon Macs and ARM64 Linux.
- `CUBE-laptop-2026-b6d6cf6a-intel-amd.zip`: Intel/AMD Windows and Linux, and Intel Macs.
- The matching `.zip.sha256` files provide download checksums.

Each package contains a compiled CUBE executable and runtime libraries in a
Docker image, tutorial inputs and mesh, launchers, reference documents and
an offline guide. Open `START-HERE.html` after extracting the ZIP.

The repository contains only the public website and documentation. CUBE's
implementation source is not included. GitHub's automatic “Source code”
release links contain the website files; use the named CUBE ZIPs above to
obtain the tutorial software.

## Validation status

Apple Silicon runs have been tested directly. The Intel/AMD image passed
an emulated startup test. Native Windows, Intel Mac and Linux-host pilot
checks remain pending. See [the validation report](reference/VALIDATION.md)
and complete the guide's short test before the workshop. The current Linux
launcher requires local standard Docker Engine, without rootless mode or
user-namespace remapping.

## Edit the guide on GitHub

1. Open `index.html` in this repository.
2. Click the pencil icon to edit. Change the visible text while preserving
   the surrounding HTML tags.
3. Click **Commit changes**, enter a short description, and commit to `main`.
4. Open the **Actions** tab and wait for the Pages deployment to succeed.
5. Reload the public guide. Changes can take several minutes to appear.

`styles.css` controls appearance. `guide.js` controls platform selection.
`config.js` points the download buttons to a specific release. Images and
illustrations are in `assets/`.

## GitHub Pages settings

This site is plain HTML, CSS and JavaScript; no compilation is required.
In **Settings → Pages**, use **Deploy from a branch**, branch **main**, and
folder **/(root)**. The `.nojekyll` file keeps the static files unchanged.
The website's entry file is `index.html` in the repository root.

## Publish a replacement tutorial package

1. Build and verify the replacement packages locally.
2. Open **Releases → Draft a new release**. Choose a new version tag and
   target `main`; enter a title and notes describing the changes.
3. Attach both architecture ZIPs and their matching `.sha256` files. Keep
   large binaries out of the repository's normal file list.
4. Publish the release after all attachments have finished uploading.
5. Update `downloadBase` and, if needed, `bundles` in `config.js` to match
   the new release and asset names. Retain the trailing `/` on the base URL.
6. Wait for Pages to deploy, then test both public download buttons.

Keep private solver source, build directories and simulation outputs outside
this website repository. Publication of binary packages does not require
publishing CUBE's implementation source.
