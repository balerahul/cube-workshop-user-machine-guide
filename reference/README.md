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

## Run CUBE yourself

CUBE needs two things: the program `cube` and a parameter file ending in
`.toml`. First open a shell inside the container, from this folder.

On an Apple Silicon Mac:

```sh
docker run --rm -it --init --pull=never --network none --shm-size=256m -v "$PWD:/work" --entrypoint bash cube-workshop:2026-b6d6cf6a-arm64
```

On an Intel Mac, use the same command with `amd64` at the end. On Linux, add
your user, and use `arm64` instead of `amd64` on an ARM64 computer:

```sh
docker run --rm -it --init --pull=never --network none --shm-size=256m --user "$(id -u):$(id -g)" -v "$PWD:/work" --entrypoint bash cube-workshop:2026-b6d6cf6a-amd64
```

On Windows, in PowerShell:

```powershell
docker run --rm -it --init --pull=never --network none --shm-size=256m -v "${PWD}:/work" --entrypoint bash cube-workshop:2026-b6d6cf6a-amd64
```

The prompt changes to something like `ubuntu@3f2a...:/work$`. The name before
`@` may differ on your computer, which is normal. Inside the container, `/work` is this folder. Give each run its own
folder, because CUBE overwrites old results in the folder where it runs:

```sh
mkdir -p my_runs/icns1
cp cases/input_icns.toml cases/mesh_cylinder.bin cases/cylinder.stl my_runs/icns1/
cd my_runs/icns1
mpiexec --bind-to none --oversubscribe -n 2 cube -p input_icns.toml | tee run.log
```

A finished run ends with `normal end.` For the compressible example:

```sh
cd /work
mkdir -p my_runs/cns1
cp cases/input_cns.toml cases/mesh_cylinder.bin cases/cylinder.stl my_runs/cns1/
cd my_runs/cns1
mpiexec --bind-to none --oversubscribe -n 2 cube -p input_cns.toml | tee run.log
```

The number after `-n` is the number of MPI processes. Start with 2. The image
uses one OpenMP and one BLAS thread per process. Keep other heavy applications
closed until you know your laptop's capacity. Type `exit` to leave the
container. Your files stay in this folder.

## Change the case

Make a new run folder as above, then edit its `.toml` file on your laptop with
a plain-text editor. Try `[time] T_end` or an output interval first. Then run
the same `mpiexec` command from that folder. Keep the output directory in its
existing form, such as `./output_icns/`: simple names with a trailing slash,
no spaces or shell characters. Keep the positive `[initial_condition] density`
entry in the CNS case.

## One-line shortcut

The launcher does the same work with one command, from this folder outside
the container. It copies the inputs from `cases/` into a new
`runs/<date>-<case>-.../` directory and checks the output:

```sh
sh run.sh icns 2
sh run.sh cns 2
```

On Windows:

```powershell
.\run.ps1 icns 2
.\run.ps1 cns 2
```

The final argument is the number of MPI processes: 1, 2 or 4. Each launcher
run contains its own input, `run.log`, outputs and `summary.json`. The
launcher check expects LSURF force output and plane slices to remain enabled.

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
With CUBE b6d6cf6a the final values are **0.937563 for ICNS** and
**1.558051 for CNS**. Both were identical with 1, 2 and 4 MPI processes.
The CNS value is 3% lower than in the earlier package (1.606204), because CUBE
now applies the CNS filter once per time step instead of four times.
See `VALIDATION.md` for the measured results.
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
- `mpiexec` or `cube` not found: you are outside the container. Open the
  container shell first.
- Failed simulation: inspect `run.log` in your run folder.
- Disk becoming full: remove only old run folders you no longer need.
- To interrupt a run, press Ctrl+C. Partial results remain for inspection.

See `reference/` for the parameter manuals. Their program-route discussions
describe capabilities outside this TOML-only workshop kit.
