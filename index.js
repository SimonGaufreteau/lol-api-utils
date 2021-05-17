import { config } from 'dotenv';
import LoLAPI from './src/api_calls.js';
import * as FilesUtils from './src/files_utils.js';
import Operations from './src/operations.js';
import * as Utils from './src/utils.js';

config();

async function main() {
    const readf = true;
    const names = ['3x1', 'Lwipon', 'Ailler', 'Erebz', 'Mε Mysεlf n I'];
    if (readf) {
        // Example with a file read
        const file = 'saves/MMM50.json';
        const matches = FilesUtils.readMatchesFromFile(file);
        // Utils.printMatches(matches);
        const OP = new Operations(names, matches);
        OP.printEveryStat();
    } else {
        // Example with the API
        const API = new LoLAPI();
        const matches = await API.getGamesFromNameList(names, 20);
        console.log(`names : ${names}`);
        // Utils.printMatches(matches);
        const t = new Date().toISOString().slice(0, 19);
        const OP = new Operations(names, matches);
        OP.printEveryStat();
        FilesUtils.saveMatchesTofile(`./saves/${t}.json`, matches);
    }
}

main();
