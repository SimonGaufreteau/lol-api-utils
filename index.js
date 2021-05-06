import { config } from 'dotenv';
import * as API from './src/api_calls.js';
import * as FilesUtils from './src/files_utils.js';
import * as Operations from './src/operations.js';
import * as Utils from './src/utils.js';

config();

async function main() {
    // const matches = await getMatchesIDByName('Erebz');
    // console.log(matches);
    const readf = true;
    if (readf) {
        const file = 'saves/matches_save.json';
        let matches = FilesUtils.readMatchesFromFile(file);
        console.log('----------------------------');
        console.log('Matches');
        console.log('----------------------------');
        matches = Utils.removeEmptyOrNull(matches);
        Utils.printMatches(matches);
    } else {
        const id = await API.getSummonerIDByName('3x1');
        const matches = await API.getMatchesID(id, 0, 50);
        console.log(matches);
        for (const match of matches) {
            const t = await API.getMatchByID(match);
            console.log(t);
        }
    }
}

main();
