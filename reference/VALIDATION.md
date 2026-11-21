# Laptop kit validation — 22 November 2026

This report describes the exported images listed below, built from CUBE
develop `b6d6cf6a` (`v0.14.0-36-gb6d6cf6a`). This is the version installed on
the hoopoe cluster. Rebuilding may update operating-system packages; repeat
validation for any replacement image.

## Completed runs

Apple Silicon host; Docker Desktop 4.44.2, Linux ARM64 engine 28.3.2.
Docker was configured with 16 CPUs and approximately 94 GiB RAM. Each case
used only the MPI processes listed and one OpenMP/BLAS thread per process.
Several runs overlapped, so elapsed times are observations, not isolated
performance benchmarks or guarantees for another laptop.

Cd here uses the exact reference force 14.20032 N.

| Test | MPI processes | Final solver step | Last force step | Cd | Elapsed |
|---|---:|---:|---:|---:|---:|
| ARM64 startup check | 2 | 10 | 10 | 2.797507 | 4.6 s |
| ARM64 ICNS, unedited full case | 1 | 1000 | 1000 | 0.937563 | 907 s |
| ARM64 ICNS, unedited full case | 2 | 1000 | 1000 | 0.937563 | 474 s / 7.9 min |
| ARM64 ICNS, unedited full case | 4 | 1000 | 1000 | 0.937563 | 624 s |
| ARM64 CNS, unedited full case | 1 | 3333 | 3330 | 1.558051 | 1246 s |
| ARM64 CNS, unedited full case | 2 | 3333 | 3330 | 1.558051 | 619 s / 10.3 min |
| ARM64 CNS, unedited full case | 4 | 3333 | 3330 | 1.558051 | 522 s |
| AMD64 startup check, **emulated** on ARM64 | 2 | 10 | 10 | 2.797507 | 8.8 s |

All runs exited successfully, wrote finite force records, and produced the
requested final field and nonempty visualization slices. The final field
check is separate from the sampled force check: CNS writes forces every
five steps, so its last force row is 3330 although the solver reaches 3333.

## What changed from the earlier package

The earlier package used CUBE `d78fad78`.

- **Process count.** The earlier version gave different forces at different
  process counts. This version gave the same printed force at 1, 2 and 4
  processes, for both solvers.
- **ICNS.** The two-process Cd moved from 0.929249 to 0.937563. The earlier
  four-process value was 0.937440, so the new value is close to it.
- **CNS.** The two-process Cd moved from 1.606204 to 1.558051, which is 3.0%
  lower. CUBE now applies the CNS filter once per time step. The earlier
  version applied it four times per step with this case's settings. When the
  earlier behaviour was put back in a private test build, Cd returned to
  1.612207, so this change explains nearly all of the shift. The remaining
  difference was not investigated.
- **CNS limits.** At the final step, density was 1.154 to 1.205 kg/m³ and
  pressure was 95,991 to 102,919 Pa. These values are far from the case's
  `[limiter]` bounds, so the new result does not rely on clamping.

These numbers check the packaging against recorded runs. They are not a claim
about CFD accuracy. For an unchanged input, an absolute Cd difference below
0.001 is a practical workshop comparison tolerance. Edited parameters or a
shortened run require their own reference.

## Memory, files and visualization

The two-process full cases peaked at approximately 1.05–1.13 GiB of charged
container memory, including charged file cache. This excludes Docker
Desktop/WSL, the host operating system and ParaView. Allow additional memory
for those applications; verify the complete workflow on each participant's
laptop.

Each full run produced approximately 0.52–0.56 GB of files. Repeated runs
are preserved, so budget disk space accordingly. For quick experiments,
shorten `T_end`; the shortened run will not match the full-run Cd.

ParaView 5.12.0-RC2's PLOT3D reader read all 30 blocks and 8,670 points of
the plane1 slice from this version. A full ICNS speed slice was rendered and
visually checked. See README.md for the ICNS-specific meanings of Density and
Momentum.

## Packaging and launcher checks

- 13 behavioral tests passed. The three PowerShell tests were skipped, because
  PowerShell is not installed on the build computer for this release.
- The direct `docker run` and `mpiexec` commands in the guide were run on the
  ARM64 image from a fresh unzip. The Windows form of the command was not run.
- Repeated launcher runs preserve earlier results and editable source files.
- Every layer of both exported images was scanned. No CUBE source-tree
  files, Fortran sources/modules, libbcm development library or compiler
  binaries were found. `/opt/cube` contains the solver executable, launcher
  and toml-f licenses only.

The attendee ZIP is assembled from an explicit list. It contains the case
data, launchers, parameter PDFs and documentation; it contains no CUBE
implementation source or Fortran application examples.

## Platform checks still needed before the workshop

- A real Windows machine with Docker Desktop/WSL 2, including Windows
  PowerShell 5.1 and Windows filesystem sharing.
- A native Intel/AMD laptop. The AMD64 startup test here used emulation;
  native x86 timing and full-run results were not measured.
- A native Linux host to verify its Docker access and host UID permissions.
  Rootless Docker and user-namespace remapping are explicitly unsupported
  by this release's Linux launcher.

Send the startup check before the workshop, then have at least one Windows
and one native Intel/AMD pilot complete a full case and open it in ParaView.

## Image identity

| Architecture | Image tag | Archive bytes |
|---|---|---:|
| ARM64 | `cube-workshop:2026-b6d6cf6a-arm64` | 251,739,136 |
| AMD64 | `cube-workshop:2026-b6d6cf6a-amd64` | 457,255,936 |

ARM64 image ID:
`sha256:aa3f0a9a3e6adf49629e83b45af19fce25f6ae9e643e54902cf4bfdcc6c5de8a`

AMD64 image ID:
`sha256:a0f3db8e79b674d50eda99710451ed8e614e74342537b8cf73e69eb6e5b7de97`

Each image archive has its own `.sha256` file. Source dependency: toml-f
commit `d5e92701d28b647323ce05ecbcbf302dd19792f7`.
