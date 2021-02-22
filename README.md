## Cozy Target

* **Author**: Pakki Sukibe (Credit to Psyny for original)
* **Version**: 2.0.3
* **Foundry VTT Compatibility**: 0.7.5
* **System Compatibility**: D&D 5e
* **Link**: https://github.com/megahead11/cozy-target


### What is this?

A while ago, Psyny made a module called cozy-player. I made a fork and eventually decided to turn it into an individualized mod. Pretty much all of the code belongs to Psyny, but I will be maintaining minor edits mainly for my own purposes. The original module had several more features, but as of 0.7.5, some of them may cause fatal errors in .db files or just be redundant with current module options (example: token tooltip alt does what cozy player does, but much better).

## Installation
* **Don't** Open the Foundry application and click **"Install Module"** in the **"Add-On Modules"** tab. Because I haven't listed this officially lmao
* Paste the following link: (I'll post this once I make an official version 🤔)
* Click "Install"
* Activate the module in your World using **Manage Modules** under the **Game Settings** tab.

## Features

### Chat-Token integration, targeting and selection
* **Clickable chat names:** On the chat, some names (like message sender) is hoverable (for tooltips) and clickable (selects its token).
* **Chat targets on roll:** When making a roll, automaticaly attach currented target tokens at the end of the roll info message. If chat integration is turned on, each targeted token token is selectable by other players by clicking on its name.
* **Clear targets:** option to clear targets on making a roll and/or on turn end.

## Known issues
- Due to how the implicit and explicit roll system works (i.e. I don't understand how it works), they may not properly append to certain types of templates unless you set it to append to **all rolls**.
- This will not run below 0.7.5 unless you edit the module.json; I actually changed the minimum version so any future edits and commits I make will be compatible with this version.
- If you are using midi-qol, ensure that your option for **auto untargeting is DISABLED**. This module conflicts with that as it pretty much handles what it can do.
- This may conflict with modules that allow you to click names in the chat to select tokens. I can't confirm which ones, however.

## Thanks and Credits
- Credit to **Psyny** (Psyny#0677  (Discord)) for the original module, CozyPlayer. This module is 99% their code; I merely took out some of their more unique and pared it down for its unique features.

## License
This Foundry VTT module is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).
This work is licensed under Foundry Virtual Tabletop [EULA - Limited License Agreement for module development v 0.1.6](http://foundryvtt.com/pages/license.html).
