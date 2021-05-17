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
        const API = new LoLAPI();
        const id = await API.getSummonerIDByName('3x1');
        console.log(`id : ${id}`);
        const matches = await API.getMatchesID(id, 0, 5);
        console.log(matches);
        const results = [];
        for (const match of matches) {
            results.push(API.getMatchByID(match));
        }
        Promise.all(results).then((res) => {
            for (const match of res) {
                console.log(match);
            }
        });
    }
}

main();
