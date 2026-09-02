# Olive Delights — Changelog

## v2.7.2
Added Creepy Ye skin, fixed powerups clustering on the left wall (Fisher-Yates shuffle), corrected flashlight life upgrade to increase total battery capacity instead of slowing drain, updated battery pickup URL, and added an asset-load failure banner on the start screen.

## v2.7.1
Fixed escape-mode door sitting in the walkable path; added Dark Escape battery powerup (🔋) and two new upgrades (Battery Pickup, Flashlight Life); extreme mode now reveals keys one at a time; flashlight button hides outside Dark Escape; sensitivity settings only show the relevant slider for the selected input mode.

## v2.7.0
Fixed walk-through objects (jumpable props now block movement correctly), fixed escape doors floating inside walls, fixed mobile controls on iOS/Android, and added the Shield Stack upgrade.

## v2.6.10
Fixed key spawning failing on small maps (3-pass progressive spacing); Dark Escape now spawns 20 powerups including ice/speed/shield evenly distributed.

## v2.6.9
Removed Warehouse map entirely; raised jump-onto threshold so you must actually jump to land on objects; fixed mobile flashlight button crash; prevented duplicate mobile control listeners.

## v2.6.8
Added `jumpable` flag to gurney, wheelchair, barrel, and single crates so you can jump onto them without walking through them.

## v2.6.7
Fixed jumping onto forest props (stumps, bushes, rocks); reduced audio range 120 → 90.

## v2.6.6
Increased audio range 70 → 120 and lowered falloff exponent so the chaser is audible from further away.

## v2.6.5
Fixed audio for all skins: AudioContext now resumes properly, SCP video plays after pause, and pauseAudio correctly pauses video.

## v2.6.4
Fixed Dark Escape AI never moving (isDead/isPaused not reset on mode start); fixed restartGame state reset order.

## v2.6.3
Fixed door still rendering green; fixed jumping onto small items; flashlight battery +45% longer (1.23/s → 0.848/s); improved key spacing and door-nearby indicator.

## v2.6.2
Fixed Dark Escape door spawning inside the wall; restored missing AI movement in Dark Escape; reduced key minimum spawn distance.

## v2.6.1
Fixed diagonal wall corner-cutting in A* pathfinding; stopped double-running updateKanye in Dark Escape; fixed Easy mode door indicator.

## v2.6.0
Version bump to 2.6.0; expanded changelog with full history.

## v2.5.9
Extended off-mode glow range; added version badge.

## v2.5.8
Updated Captain Clark skin to exact hosted PNG.

## v2.5.7
Removed generated scratch files.

## v2.5.6
Added Captain Clark skin (60 coins).

## v2.5.5
Strengthened screen-edge of off-mode body glow.

## v2.5.4
Extended off-mode glow range and prolonged flashlight battery further.

## v2.5.3
Tuned Extreme chaser speed, battery life, and off-mode glow coverage.

## v2.5.2
Brightened off-mode body glow; sprint now requires re-press after exhaustion; close-warning fades with distance.

## v2.5.1
Fixed Dark Escape light cone, off-mode body glow, and screen overlay.

## v2.5.0
Aligned flashlight beam immediately on game start.

## v2.4.0
Added focused flashlight with depth/body glow, forest border wall, AI unstick logic, and stamina lock.

## v2.3.6
Darkened Dark Escape materials; added press-to-bind key capture; fixed HUD overlap and flicker.

## v2.3.5
Switched Dark Escape to real Backrooms/Hospital maps; always-boosted shop prices; centered flashlight.

## v2.3.4
Tuned Dark Escape: Extreme-only flashlight breaks, bigger/faster Extreme chaser, rebindable keys, sprint mode.

## v2.3.3
Tuned Extreme chaser speed.

## v2.3.2
Darkened hospital props in Dark Escape.

## v2.3.1
Added Extreme Dark Escape difficulty, realistic flashlight, flashlight breaks, and powerup respawns.

## v2.3.0
Fixed Dark Escape door reachability.

## v2.2.0
Added Dark Escape mode; fixed forest edge trees and sprint FOV.

## v2.1.3
Fixed Forest generation/cache; smarter AI pathing; tightened map availability and door access.

## v2.1.2
Improved Forest generation and pathfinding; added sprint FOV kick; moved pause fullscreen button; fixed sky artifact.

## v2.1.1
Reworked Park into Forest; added props/pathfinding improvements; reset media per round; added pause fullscreen.

## v2.1.0
Added Park map, FOV setting, map picker, shield fix, and performance optimisations.

## v1.x.x / Before v2
Classic version — original Play and Escape modes, base controls, skins, shop, upgrades, and settings. Anything not in v2.x.x was part of this era.
