# Shared Agent Skills Design

## Objective

Use `C:\antigravity\skills` as the single canonical store for the user's game-development skills. Codex, Claude, Gemini, and agents that implement the common `.agents/skills` convention must read the same physical files rather than independent copies.

## Scope

The canonical store currently contains nine skill directories:

- `balance-economy-tuner`
- `engine-expert`
- `game-design`
- `game-systems-designer`
- `gdd-architect`
- `gds-create-narrative`
- `gds-narrative-designer`
- `level-designer`
- `level-orchestrator`

Each skill directory must contain a readable `SKILL.md`. Supporting files remain beside their owning `SKILL.md` in the canonical store.

## Architecture

`C:\antigravity\skills` is the only writable source of truth. Agent-specific discovery locations expose it through Windows directory junctions:

- Common Agent Skills: `%USERPROFILE%\.agents\skills` points to the canonical store.
- Claude: `%USERPROFILE%\.claude\skills` points to the canonical store when that path is absent.
- Gemini: `%USERPROFILE%\.gemini\skills` points to the canonical store when that path is absent.
- Codex: each of the nine canonical skill directories is exposed as an individual junction below `%USERPROFILE%\.codex\skills`. The `.codex\skills` root itself is not replaced because it already contains Codex system skills.

If an agent-specific `skills` directory already contains user data, it is preserved. In that case, individual per-skill junctions are added only for missing names.

## Data Flow

An edit to `C:\antigravity\skills\<name>\SKILL.md` is immediately visible through every junction. No scheduled synchronization, copy operation, or generated mirror is used. Agents discover changes on their next session or skill-catalog refresh.

## Safety and Conflict Handling

- Never delete or overwrite an existing real directory.
- Never replace Codex's `.system` skills or plugin-managed cache.
- Refuse a canonical skill directory that does not contain `SKILL.md`.
- If a destination name exists and does not already resolve to the canonical directory, report it as a conflict and leave it unchanged.
- Create only links whose resolved targets remain under `C:\antigravity\skills`.
- Do not move or rename the canonical store during setup.

## Compatibility

Directory junctions are selected because the host is Windows and junctions work for directory-based discovery without maintaining duplicate content. Agents that do not scan any of the configured global paths can still be supported later with another junction; the canonical store remains unchanged.

## Verification

Setup is accepted only when:

1. All nine canonical directories contain `SKILL.md`.
2. Every created junction resolves to its expected canonical target.
3. Hashes read through the junction and canonical path match for every `SKILL.md`.
4. Existing non-link directories remain present and unchanged.
5. A fresh Codex session lists the nine shared skills in addition to system skills.

## Rollback

Remove only the junctions created by this setup. Because the canonical files are never moved into an adapter directory, deleting a junction does not delete the skill content in `C:\antigravity\skills`.
