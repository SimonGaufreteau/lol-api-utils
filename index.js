import { config } from 'dotenv';
import LoLAPI from './src/api_calls.js';
import * as FilesUtils from './src/files_utils.js';
import Operations from './src/operations.js';
import * as Utils from './src/utils.js';

config();

async function main() {
    // const matches = await getMatchesIDByName('Erebz');
    // console.log(matches);
    const readf = true;
    const names = ['3x1', 'Lwipon', 'Ailler', 'Erebz', 'Mε Mysεlf n I'];
    if (readf) {
        const file = 'saves/MMM50.json';
        const matches = FilesUtils.readMatchesFromFile(file);
        // Utils.printMatches(matches);

        const OP = new Operations(names, matches);
        OP.removeUnrelevantGames();
        console.log('All roles mapped :');
        console.log(OP.getRolesMapped(OP.getAllRoles()));
        console.log('\nMain roles mapped :');
        console.log(OP.getRolesMapped(OP.getMainRoles()));
        // console.log('\nGames in common :');
        // const gic = OP.getGamesInCommon();
        // for (const game of gic) {
        //     console.log(Utils.getMatchString(game));
        // }
        OP.switchMatchesTogether();
        console.log('\nAll roles together :');
        console.log(OP.getRolesMapped(OP.getAllRoles()));
        console.log('\nMain roles together :');
        console.log(OP.getRolesMapped(OP.getMainRoles()));
    } else {
        const API = new LoLAPI();
        const matches = await API.getGamesFromNameList(names, 50);
        console.log(`names : ${names}`);
        // Utils.printMatches(matches);
        // console.log(matches);
        FilesUtils.saveMatchesTofile('./saves/MMM50.json', matches);
    }
}

main();
