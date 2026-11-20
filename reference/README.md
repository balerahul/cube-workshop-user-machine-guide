# CUBE on your laptop

Run flow past a cylinder by editing TOML inputs. CUBE is precompiled inside a
Linux container. You do not need a compiler, MPI installation, cluster
account, or CUBE source code. ParaView runs on your laptop.

## Install before the workshop

1. Install Docker Desktop on Windows or macOS, or Docker Engine on Linux.
   Windows users: use Linux containers with the WSL 2 backend. Confirm WSL
   and hardware virtualization work before arriving.
   Linux: this release supports standard Docker Engine without rootless or
   user-namespace remapping, accessed from your normal user account.
2. Install ParaView for your operating system.
3. Extract this kit into a local writable folder. Avoid OneDrive/iCloud
   synchronization while running. Keep the archive and its `.sha256` file
   beside `run.sh` and `run.ps1`.
4. Start Docker and wait for its engine to be ready.

Downloads and installation guides:
- https://docs.docker.com/desktop/setup/install/windows-install/
- https://docs.docker.com/desktop/setup/install/mac-install/
- https://docs.docker.com/engine/install/
- https://www.paraview.org/download/

`amd64` is for Intel/AMD processors; `arm64` is for Apple Silicon and other
ARM64 processors. The launcher detects the Docker engine architecture.
Windows ARM support requires separate validation; ask the organizers before
relying on it. A container does not remove the need to enable virtualization.

## First run

Open a terminal in this folder. On macOS/Linux:

```sh
sh run.sh setup
sh run.sh smoke
```

On Windows, open PowerShell in this folder:

```powershell
.\run.ps1 setup
.\run.ps1 smoke
```

If Windows blocks downloaded scripts, review this supplied script and use
`Unblock-File .\run.ps1`. If your organization's execution policy still blocks
it, ask IT; do not change machine-wide policies for the workshop.

The first command imports the image archive if it is not already installed.
It verifies the archive's checksum before importing. Subsequent simulations
work offline. The smoke test runs ten ICNS steps and checks that finite
forces and visualization slices were written. It is a setup check, not a
converged flow solution or a full-case drag comparison.

## Run and change the case

On macOS/Linux:

```sh
sh run.sh icns 2
sh run.sh cns 2
```

On Windows:

```powershell
.\run.ps1 icns 2
.\run.ps1 cns 2
```

The final argument is the number of MPI processes: 1, 2 or 4. Start with 2.
The image uses one OpenMP and one BLAS thread per process. Keep other heavy
applications closed until you know your laptop's capacity.

Edit `cases/input_icns.toml` or `cases/input_cns.toml`, then run again. Try
`[time] T_end` or an output interval first. Keep the output directory in its
existing form, such as `./output_icns/`: simple names with a trailing slash,
no spaces or shell characters. The laptop folder containing the kit may
have spaces.
The provided check expects LSURF force output and plane slices to remain
enabled; choose intervals short enough to produce them before the run ends.
Keep the positive `[initial_condition] density` entry in the CNS case.

Every launch copies the current inputs into a new `runs/<date>-<case>-.../`
directory. Earlier runs are preserved. Each run contains its own input,
`run.log`, outputs, and `summary.json`. The launcher prints the result
directory immediately; the solver writes progress to `run.log` there.

## Inspect the results

In ParaView, use a PLOT3D reader for `mesh_plane1_y_*.xyz` and select the
matching `field_plane1_*.q` files as solution files. Enable **Auto Detect
Format**. Use the corresponding mesh and solution files from the same run.
The installed ParaView 5.12 reader successfully read these files during
validation. If automatic detection fails, the format is binary, little
endian, multiblock, single precision, with Fortran byte counts and IBlanking.
`IB_001_*.vtk` shows the immersed-boundary cylinder points.

For **ICNS**, CUBE stores pressure and velocity in the standard PLOT3D
slots. ParaView calls the raw scalar **Density**, but it is pressure in
this case; the raw vector **Momentum** is velocity in m/s. Select Momentum
and Magnitude to show speed. Do not use the reader's derived Velocity or
Pressure functions for ICNS: they assume compressible conservative variables.
For **CNS**, Density and Momentum have their usual meanings; velocity is
Momentum divided by Density. These conventions apply to the provided
slice files.

The default case has 120 blocks of 16³ cells (491,520 cells), Re = 200,
wind speed 34.4 m/s, cylinder diameter 0.1 m and height 0.2 m.

For the unmodified full case, add force-file columns 3 and 9, then divide by
14.20032 N to obtain drag coefficient. ICNS uses
`output_icns/force_lsurf_001.txt`; CNS uses `output_cns/eval_lsurf_001.txt`.
The original teaching pack records approximately 0.93746 for ICNS and
1.61562 for CNS at its final sampled time using four MPI processes. This
case's measured forces vary with the MPI process count, so do not use
those four-process numbers to check the default two-process run. See
`VALIDATION.md` for the container's measured results by process count.
Edited inputs and the short smoke test need not reproduce full-run values.

The ICNS and CNS values differ because these cases also use different
immersed-boundary methods. Do not interpret their difference as an isolated
compressibility effect.

## Troubleshooting

- Docker not ready: start Docker Desktop and wait; on Linux check access
  to your Docker service with your administrator.
- Missing archive: obtain the archive matching the architecture in the
  error message, with its checksum file.
- Out of memory: close other applications, try one MPI process, and check
  the memory allocated to Docker/WSL. Preserve `run.log` for support.
- Failed simulation: inspect `run.log` in the printed run directory.
- Disk becoming full: remove only old run folders you no longer need.
- To interrupt a run, press Ctrl+C. Partial results remain for inspection.

See `reference/` for the parameter manuals. Their program-route discussions
describe capabilities outside this TOML-only workshop kit.
