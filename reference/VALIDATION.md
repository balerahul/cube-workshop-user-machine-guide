# Laptop kit validation — 19 November 2026

This report describes the exported images listed below. Rebuilding may
update operating-system packages; repeat validation for any replacement image.

## Completed runs

Apple Silicon host; Docker Desktop 4.44.2, Linux ARM64 engine 28.3.2.
Docker was configured with 16 CPUs and approximately 94 GiB RAM. Each case
used only the MPI processes listed and one OpenMP/BLAS thread per process.
Other builds/runs overlapped these tests, so elapsed times are observations,
not isolated performance benchmarks or guarantees for another laptop.

Cd here uses the exact reference force 14.20032 N.

| Test | MPI processes | Final solver step | Last force step | Cd | Elapsed |
|---|---:|---:|---:|---:|---:|
| ARM64 startup check | 2 | 10 | 10 | 2.825113 | 6.7 s |
| ARM64 ICNS, unedited full case | 2 | 1000 | 1000 | 0.929249 | 750 s / 12.5 min |
| ARM64 CNS, unedited full case | 2 | 3333 | 3330 | 1.606204 | 1444 s / 24.1 min |
| ARM64 ICNS, original process count | 4 | 1000 | 1000 | 0.937440 | 712 s / 11.9 min |
| AMD64 startup check, **emulated** on ARM64 | 2 | 10 | 10 | 2.825113 | 20.8 s |

All runs exited successfully, wrote finite force records, and produced the
requested final field and nonempty visualization slices. The final field
check is separate from the sampled force check: CNS writes forces every
five steps, so its last force row is 3330 although the solver reaches 3333.

The PowerShell launcher also completed a real edited 12-step ICNS case from
a folder containing spaces, using PowerShell 7.4.6 on macOS. This tests the
launcher and Docker invocation, but is **not** a native Windows test.

## Interpreting the reference values

The original teaching notes report ICNS Cd = 0.93746 using four MPI processes
and a rounded reference force of 14.20 N. The new four-process run gives
0.937460775 using that same denominator, matching the recorded value.
Using the exact denominator gives 0.937439649 instead.

The two-process ICNS result is approximately 0.9% lower. This case's force
results depend on MPI process count. The source snapshot is an exact match
to Git commit `d78fad78fbf46dc58b1fecd7d0a50a1ce36ad9d0` (all 408 tracked
files checked), and the inputs, mesh and STL match the original pack.
The packaging did not modify CUBE's numerical source.

Use the **two-process** values above for the default launcher. The old
four-process CNS value, 1.61562 with its rounded denominator, was not
independently re-run at four processes in this validation. The two-process
CNS value above is a measured container baseline, not a claimed match to
that four-process result. The underlying rank dependence has not been
corrected or diagnosed inside the solver.

Edited parameters or a shortened run require their own reference. For an
unchanged input and the same MPI count, an absolute Cd difference below
0.001 is a practical workshop comparison tolerance, not a CFD accuracy bound.

## Memory, files and visualization

The full cases peaked at approximately 1.04–1.12 GiB of charged container
memory, including charged file cache. This excludes Docker Desktop/WSL,
the host operating system and ParaView. Allow additional memory for those
applications; verify the complete workflow on each participant's laptop.

Each full run produced approximately 0.52–0.56 GB of files. Repeated runs
are preserved, so budget disk space accordingly. For quick experiments,
shorten `T_end`; the shortened run will not match the full-run Cd.

The Plot3D format checker passed its self-test and read the generated
slice. ParaView 5.12.0-RC2's reader read all 30 blocks and 8,670 points of
the plane1 slice. A full ICNS speed slice was rendered and visually checked.
See README.md for the ICNS-specific meanings of Density and Momentum.

## Packaging and launcher checks

- 16 behavioral tests passed, including PowerShell archive import, checksum
  rejection, spaces in paths, and nonzero simulation exit status.
- Repeated runs preserve earlier results and editable source TOML files.
- Output-directory validation prevents unsupported paths from reaching CUBE.
- Both offline archives successfully reloaded into Docker.
- Every layer of both exported images was scanned. No CUBE source-tree
  files, Fortran sources/modules, libbcm development library or compiler
  binaries were found. `/opt/cube` contains the solver executable, launcher
  and toml-f licenses only.
- The launcher inside each image matches the final reviewed launcher file.

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
| ARM64 | `cube-workshop:2026-arm64` | 251,939,328 |
| AMD64 | `cube-workshop:2026-amd64` | 457,447,936 |

ARM64 image ID:
`sha256:b646f817074630f56a0e68ef55ba8a24a37d01b36d410a6c4a4290828ce280ef`

AMD64 image ID:
`sha256:9c7f0794b097e69e67054ac7e97f2585af3e7100900d5a8e8986b6e7b055754e`

Each image archive has its own `.sha256` file. Source dependency: toml-f
commit `d5e92701d28b647323ce05ecbcbf302dd19792f7`. The organizers retain
the detailed test logs, image metadata, package versions, binary hashes,
source-integrity report and layer-audit reports in `laptop-validation/`.
