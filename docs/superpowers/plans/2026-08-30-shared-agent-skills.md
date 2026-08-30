# Shared Agent Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `C:\antigravity\skills` the single canonical skill store used globally by Codex, Claude, Gemini, and agents supporting the common Agent Skills layout.

**Architecture:** Keep every skill file in the canonical store and expose it through Windows directory junctions. Use one root junction where an agent's global skills path is absent; otherwise preserve the directory and add per-skill junctions. Codex always receives per-skill junctions because `%USERPROFILE%\.codex\skills` already contains system skills.

**Tech Stack:** Windows PowerShell 7, NTFS directory junctions, Agent Skills `SKILL.md` convention.

**Spec:** `docs/superpowers/specs/2026-08-30-shared-agent-skills-design.md`

## Global Constraints

- `C:\antigravity\skills` is the only writable source of truth.
- Never delete, move, or overwrite an existing real directory.
- Never replace `%USERPROFILE%\.codex\skills` or its `.system` directory.
- Create links only when their resolved targets remain under `C:\antigravity\skills`.
- A canonical skill is eligible only when `<skill>\SKILL.md` exists.
- A destination conflict must remain unchanged and be reported.

---

### Task 1: Validate the canonical skill store

**Files:**
- Read: `C:\antigravity\skills\*\SKILL.md`
- Test: PowerShell validation output

**Interfaces:**
- Consumes: canonical directory `C:\antigravity\skills`
- Produces: ordered list `$sharedSkillNames` containing nine validated skill names

- [ ] **Step 1: Validate the canonical directory and all skill manifests**

Run:

```powershell
$sharedRoot = 'C:\antigravity\skills'
$expected = @(
  'balance-economy-tuner',
  'engine-expert',
  'game-design',
  'game-systems-designer',
  'gdd-architect',
  'gds-create-narrative',
  'gds-narrative-designer',
  'level-designer',
  'level-orchestrator'
)
if (-not (Test-Path -LiteralPath $sharedRoot -PathType Container)) {
  throw "Canonical skill root is missing: $sharedRoot"
}
foreach ($name in $expected) {
  $manifest = Join-Path $sharedRoot "$name\SKILL.md"
  if (-not (Test-Path -LiteralPath $manifest -PathType Leaf)) {
    throw "Skill manifest is missing: $manifest"
  }
}
$sharedSkillNames = $expected
$sharedSkillNames
```

Expected: the command prints exactly the nine skill names and exits without an exception.

- [ ] **Step 2: Confirm all canonical paths resolve below the approved root**

Run:

```powershell
$approvedRoot = [IO.Path]::GetFullPath('C:\antigravity\skills').TrimEnd('\') + '\'
foreach ($name in $sharedSkillNames) {
  $candidate = [IO.Path]::GetFullPath((Join-Path $approvedRoot $name))
  if (-not $candidate.StartsWith($approvedRoot, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Skill escaped canonical root: $candidate"
  }
}
```

Expected: exit code 0 with no output.

### Task 2: Create global adapters for common agents, Claude, and Gemini

**Files:**
- Create junction or children under: `C:\Users\Halid Safa\.agents\skills`
- Create junction or children under: `C:\Users\Halid Safa\.claude\skills`
- Create junction or children under: `C:\Users\Halid Safa\.gemini\skills`
- Test: junction target inspection

**Interfaces:**
- Consumes: `$sharedRoot`, `$sharedSkillNames`
- Produces: global agent discovery paths resolving to the canonical store

- [ ] **Step 1: Define a conflict-safe adapter function**

Use this function in the same PowerShell session as the remaining steps:

```powershell
function Add-SharedSkillAdapter {
  param(
    [Parameter(Mandatory)][string]$SkillsPath,
    [Parameter(Mandatory)][string]$SharedRoot,
    [Parameter(Mandatory)][string[]]$SkillNames
  )

  $parent = Split-Path -Parent $SkillsPath
  if (-not (Test-Path -LiteralPath $parent)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
  }

  if (-not (Test-Path -LiteralPath $SkillsPath)) {
    New-Item -ItemType Junction -Path $SkillsPath -Target $SharedRoot | Out-Null
    return
  }

  $rootItem = Get-Item -Force -LiteralPath $SkillsPath
  if ($rootItem.LinkType -eq 'Junction') {
    $resolvedTarget = [IO.Path]::GetFullPath([string]$rootItem.Target)
    if ($resolvedTarget -ne [IO.Path]::GetFullPath($SharedRoot)) {
      throw "Conflicting root junction: $SkillsPath -> $resolvedTarget"
    }
    return
  }

  foreach ($name in $SkillNames) {
    $destination = Join-Path $SkillsPath $name
    $source = Join-Path $SharedRoot $name
    if (Test-Path -LiteralPath $destination) {
      $existing = Get-Item -Force -LiteralPath $destination
      $existingTarget = if ($existing.LinkType) {
        [IO.Path]::GetFullPath([string]$existing.Target)
      } else {
        $null
      }
      if ($existingTarget -ne [IO.Path]::GetFullPath($source)) {
        Write-Warning "Preserved conflict: $destination"
      }
      continue
    }
    New-Item -ItemType Junction -Path $destination -Target $source | Out-Null
  }
}
```

- [ ] **Step 2: Create the three global adapters**

Run:

```powershell
$globalAdapterPaths = @(
  'C:\Users\Halid Safa\.agents\skills',
  'C:\Users\Halid Safa\.claude\skills',
  'C:\Users\Halid Safa\.gemini\skills'
)
foreach ($path in $globalAdapterPaths) {
  Add-SharedSkillAdapter -SkillsPath $path -SharedRoot $sharedRoot -SkillNames $sharedSkillNames
}
```

Expected: each absent path becomes a junction to `C:\antigravity\skills`; existing directories remain intact and receive only missing per-skill junctions.

- [ ] **Step 3: Verify adapter resolution**

Run:

```powershell
foreach ($path in $globalAdapterPaths) {
  foreach ($name in $sharedSkillNames) {
    $manifest = Join-Path $path "$name\SKILL.md"
    if (-not (Test-Path -LiteralPath $manifest -PathType Leaf)) {
      throw "Adapter cannot read manifest: $manifest"
    }
  }
}
```

Expected: exit code 0 with no output.

### Task 3: Create Codex per-skill adapters

**Files:**
- Create junctions: `C:\Users\Halid Safa\.codex\skills\<skill-name>`
- Preserve: `C:\Users\Halid Safa\.codex\skills\.system`
- Test: junction target and manifest hash verification

**Interfaces:**
- Consumes: `$sharedRoot`, `$sharedSkillNames`
- Produces: nine globally discoverable Codex skill directories

- [ ] **Step 1: Inspect Codex destinations for conflicts**

Run:

```powershell
$codexSkillsRoot = 'C:\Users\Halid Safa\.codex\skills'
if (-not (Test-Path -LiteralPath $codexSkillsRoot -PathType Container)) {
  throw "Codex skills root is missing: $codexSkillsRoot"
}
$codexConflicts = foreach ($name in $sharedSkillNames) {
  $destination = Join-Path $codexSkillsRoot $name
  $source = Join-Path $sharedRoot $name
  if (Test-Path -LiteralPath $destination) {
    $item = Get-Item -Force -LiteralPath $destination
    $target = if ($item.LinkType) { [IO.Path]::GetFullPath([string]$item.Target) } else { $null }
    if ($target -ne [IO.Path]::GetFullPath($source)) { $destination }
  }
}
$codexConflicts
```

Expected: no output. If paths are printed, stop and report them without modifying those destinations.

- [ ] **Step 2: Create missing Codex junctions**

Run:

```powershell
foreach ($name in $sharedSkillNames) {
  $destination = Join-Path $codexSkillsRoot $name
  $source = Join-Path $sharedRoot $name
  if (-not (Test-Path -LiteralPath $destination)) {
    New-Item -ItemType Junction -Path $destination -Target $source | Out-Null
  }
}
```

Expected: nine canonical skill names exist below the Codex skills root; `.system` remains unchanged.

- [ ] **Step 3: Compare canonical and Codex manifest hashes**

Run:

```powershell
foreach ($name in $sharedSkillNames) {
  $sourceManifest = Join-Path $sharedRoot "$name\SKILL.md"
  $codexManifest = Join-Path $codexSkillsRoot "$name\SKILL.md"
  $sourceHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $sourceManifest).Hash
  $codexHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $codexManifest).Hash
  if ($sourceHash -ne $codexHash) {
    throw "Manifest hash mismatch: $name"
  }
  "PASS`t$name`t$sourceHash"
}
```

Expected: nine `PASS` lines.

### Task 4: Verify discovery and document operation

**Files:**
- Create: `C:\antigravity\skills\README.md`
- Test: filesystem audit and fresh-session discovery

**Interfaces:**
- Consumes: all adapter paths from Tasks 2 and 3
- Produces: operator documentation and verified global discovery

- [ ] **Step 1: Write the canonical-store README**

Create `C:\antigravity\skills\README.md` with this content:

```markdown
# Shared Agent Skills

This directory is the canonical source for personal Agent Skills on this machine.

## Rules

- Edit skills only in this directory.
- Keep one directory per skill and include `SKILL.md` in every skill directory.
- Do not edit copies below `.codex`, `.agents`, `.claude`, or `.gemini`; those paths are junction adapters.
- Restart or refresh an agent session after adding or renaming a skill.

## Consumers

- Codex: per-skill junctions under `%USERPROFILE%\.codex\skills`
- Common Agent Skills: `%USERPROFILE%\.agents\skills`
- Claude: `%USERPROFILE%\.claude\skills`
- Gemini: `%USERPROFILE%\.gemini\skills`
```

- [ ] **Step 2: Audit every adapter without following unrelated directories**

Run the Task 2 manifest-resolution check and Task 3 SHA-256 comparison again in a fresh PowerShell process.

Expected: no missing manifests and nine Codex `PASS` lines.

- [ ] **Step 3: Verify Codex discovery in a fresh session**

Close and reopen Codex, then start a new task from any project and inspect the available skills list.

Expected: all nine shared skill names appear alongside Codex system skills. If Codex does not refresh the catalog, restart the desktop app once and repeat.

- [ ] **Step 4: Record filesystem state for rollback**

Run:

```powershell
$auditPaths = @(
  'C:\Users\Halid Safa\.agents\skills',
  'C:\Users\Halid Safa\.claude\skills',
  'C:\Users\Halid Safa\.gemini\skills'
)
$auditPaths += $sharedSkillNames | ForEach-Object { Join-Path 'C:\Users\Halid Safa\.codex\skills' $_ }
foreach ($path in $auditPaths) {
  $item = Get-Item -Force -LiteralPath $path
  [PSCustomObject]@{ Path = $path; LinkType = $item.LinkType; Target = [string]$item.Target }
}
```

Expected: every created adapter reports `Junction` and a target under `C:\antigravity\skills`.
