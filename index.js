import { config } from 'dotenv';
import LoLAPI from './src/api_calls.js';
import * as FilesUtils from './src/files_utils.js';
import * as Operations from './src/operations.js';
import * as Utils from './src/utils.js';

config();

async function main() {
    // const matches = await getMatchesIDByName('Erebz');
    // console.log(matches);
    const readf = false;
    if (readf) {
        const file = 'saves/matches_save.json';
        let matches = FilesUtils.readMatchesFromFile(file);
        matches = Utils.removeEmptyOrNull(matches);
        Utils.printMatches(matches);
    } else {
        const names = ['3x1', 'Lwipon', 'Ailler', 'Erebz', 'Mε Mysεlf n I'];
        const API = new LoLAPI();
        const matches = await API.getGamesFromNameList(names, 50);
        console.log(`names : ${names}`);
        // Utils.printMatches(matches);
        // console.log(matches);
        FilesUtils.saveMatchesTofile('./saves/MMM50.json', matches);
    }
}

main();
