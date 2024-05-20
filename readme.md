
# Papa's Save Manager
Papa's Save Manager (PSM), formerly known as PBSM is a userscript which allows you to backup save data for the Papa's series of flash games hosted on [Coolmath Games](https://www.coolmathgames.com/papas-games) and [CrazyGames](https://www.crazygames.com/t/papa). Backing up saves allows them to be restored in the event that browser data is accidentally/ unintentionally cleared, or if you wish to play your game on another browser or device.

The number of supported games is expected to increase with each new version.

![Preview](docs/images/installed-preview.png)

## Supported Games
- Papa's Bakeria ( [Coolmath Games](https://www.coolmathgames.com/0-papas-bakeria) | [CrazyGames](https://www.crazygames.com/game/papas-bakeria) )
- Papa's Freezeria ( [Coolmath Games](https://www.coolmathgames.com/0-papas-freezeria) | [CrazyGames](https://www.crazygames.com/game/papas-freezeria) )
- Papa's Burgeria ( [Coolmath Games](https://www.coolmathgames.com/0-papas-burgeria) | [CrazyGames](https://www.crazygames.com/game/papa-s-burgeria) )
- Papa's Taco Mia ( [Coolmath Games](https://www.coolmathgames.com/0-papas-taco-mia) | [CrazyGames](https://www.crazygames.com/game/papas-taco-mia) )
- Papa's Pancakeria ( [Coolmath Games](https://www.coolmathgames.com/0-papas-pancakeria) | [CrazyGames](https://www.crazygames.com/game/papas-pancakeria) )
- Papa's Cupcakeria ( [Coolmath Games](https://www.coolmathgames.com/0-papas-cupcakeria) | [CrazyGames](https://www.crazygames.com/game/papas-cupcakeria) )
- Papa's Cheeseria ( [Coolmath Games](https://www.coolmathgames.com/0-papas-cheeseria) | [CrazyGames](https://www.crazygames.com/game/papas-cheeseria) )
- Papa's Wingeria ( [Coolmath Games](https://www.coolmathgames.com/0-papas-wingeria) | [CrazyGames](https://www.crazygames.com/game/papas-wingeria) )
- Papa's Hot Doggeria ( [Coolmath Games](https://www.coolmathgames.com/0-papas-hot-doggeria) | [CrazyGames](https://www.crazygames.com/game/papas-hotdoggeria) )
- Papa's Pastaria ( [Coolmath Games](https://www.coolmathgames.com/0-papas-pastaria) | [CrazyGames](https://www.crazygames.com/game/papas-pastaria) )
- Papa's Sushiria ( [Coolmath Games](https://www.coolmathgames.com/0-papas-sushiria) | [CrazyGames](https://www.crazygames.com/game/papas-sushiria) )
- Papa's Donuteria ( [Coolmath Games](https://www.coolmathgames.com/0-papas-donuteria) | [CrazyGames](https://www.crazygames.com/game/papas-donuteria) )
- Papa's Scooperia ( [Coolmath Games](https://www.coolmathgames.com/0-papas-scooperia) | [CrazyGames](https://www.crazygames.com/game/papa-s-scooperia) )

## Features
- Export save data to file
- Import save data from file

## How to Install
The script must be installed into a userscript manager such as Violentmonkey or Tampermonkey.
1. Ensure the userscript manager is installed onto you browser of choice. A comprehensive list of userscript managers can be found on [greasyfork.org](https://greasyfork.org/en/help/installing-user-scripts)
2. Click [here](https://greasyfork.org/en/scripts/474235-papa-s-save-manager) to install the lastest release from greasyfork. Alternatively, you can install the latest pre-release by creating a new script, and pasting in the contents of src/papas-save-manager.js
3. Navigate to the game (see links above) and you should see the save manager below the game's canvas, as illustrated in the above preview.

## Troubleshooting

### Why don't my crazygames.com saves appear after importing? (2024)

CrazyGames has recently updated their backend design and changed the flash emulator from AwayFL to Ruffle. If after reloading the page your saves still don't appear, try the following steps below. You can try importing your save file to the equivalent Coolmath Games page since that still uses the AwayFL emulator.
1. Open Papa's Save Manager in your extension's code editor.
2. Scroll down until you see "User Options" (approximately line 74).
3. Change the forceImport option from "false" to "true" and save the changes.
4. Navigate to the corresponding page on Coolmath Games.
5. Import your save data as usual.

It is recommended you go back to step 3 and change the setting back to "false" (optional).


### Can I export my old save files from CrazyGames that no longer appear? (2024)

Yes, as long as you are using the same device you should be able to recover your old save data. You will need to use an older version of PSM for this.
1. Go to [PSM's greasy fork page](https://greasyfork.org/en/scripts/474235-papa-s-save-manager). Click on the "history" tab then click on version "0.6.0".
2. Click the green button to downgrade to the old version (assuming you are using a version later than 0.6.0)
3. Navigate to the CrazyGames game page you want to export data from.
4. Click the save slot you want to export (or try all of them).
5. Once you have exported all the saves you want, return to the greasyfork page and update PSM to the latest version.
6. Try importing the saves back into CrazyGames. If this does not work follow the steps for "Why don't my crazygames.com saves appear after importing?"
