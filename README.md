# Minecraft Bedrock Return by Death Mod

Return by Death is a Re:Zero-inspired Minecraft Bedrock mod and add-on built with the Bedrock Script API for Minecraft Bedrock 1.21.x. It gives each player one persistent 10% chance to receive the Return by Death ability, records player and non-player entity positions, and rewinds an empowered player's location and nearby non-player entities to their positions from 15 seconds before death.

## Install

1. Copy the `behavior_pack` folder into the world's `behavior_packs` folder.
2. Copy the `resource_pack` folder into the world's `resource_packs` folder.
3. Activate both packs in the world settings.
4. Enable the Script API or Beta APIs required by your Minecraft Bedrock version.
5. Keep the resource pack active with the behavior pack.
6. For packaged installation, create separate `.mcpack` archives from the behavior pack and resource pack, then import and activate both packs.

The resource pack references the sound event `rbd.death_voice`. To provide a custom voice sound, add a permission-cleared OGG file named `death_voice.ogg` at `resource_pack/sounds/rbd/death_voice.ogg`. Do not distribute copyrighted audio without permission.

## Use

1. Enter the world with the add-on enabled.
2. On a player's first spawn, the add-on performs a persistent 10% chance roll.
3. Players who receive the ability are notified in chat.
4. Play normally for at least 15 seconds so the add-on can record enough history.
5. If an empowered player dies, the add-on plays the configured sound and waits for the player to respawn.
6. After respawn, the player is returned to their recorded location from 15 seconds earlier.
7. Nearby non-player entities within 32 blocks are also moved to their recorded positions when history is available.
8. Players who do not receive the ability do not rewind.

To configure the add-on, edit the constants near the top of `behavior_pack/scripts/main.js`:

- `ROLL_CHANCE = 0.10` controls the first-spawn chance.
- `HISTORY_TICKS = 20 * 15` controls the rewind history duration.
- `REWIND_RADIUS = 32` controls the nearby entity rewind range.
- `VOICE_SOUND = "rbd.death_voice"` selects the sound event.

---

More Minecraft mod projects by EnderDevelopment: https://github.com/EnderDevelopment

Project page: https://dash.enderdevelopment.com/community/9462204c-a4eb-41c2-bcd4-694b0fdb8d48?utm_source=github&utm_medium=readme&utm_campaign=auto_publish&utm_content=9462204c-a4eb-41c2-bcd4-694b0fdb8d48
