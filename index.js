require('dotenv').config();
const fetch = require('node-fetch');

const BASE_URL = 'https://europe.api.riotgames.com/';
const BASE_HEADERS = {
    'X-Riot-Token': process.env.API_KEY,
};

function checkResponse(res) {
    if (res.ok) {
        return res;
    }
    return Promise.reject(new Error('Network response was not ok'));
}

function getSummonerIDByName(name) {
    const url = `${BASE_URL}riot/account/v1/accounts/by-riot-id/${name}/EUW`;
    return fetch(url, { headers: BASE_HEADERS })
        .then((res) => checkResponse(res))
        .then((response) => response.json())
        .then((data) => data.puuid)
        .catch((error) => console.warn(error));
}

function getMatchesIDByName(name, start = 0, count = 20) {
    return getSummonerIDByName(name)
        .then((id) => {
            console.log(`id : ${id}`);
            const url = `${BASE_URL}lol/match/v5/matches/by-puuid/${id}/ids?start=${start}&count=${count}`;
            const result = fetch(url, { headers: BASE_HEADERS })
                .then((res) => checkResponse(res))
                .then((response) => response.json());
            return result;
        }).catch((error) => console.warn(error));
}

// https://europe.api.riotgames.com/lol/match/v5/matches/EUW1_5250023009
function getMatchByID(id) {
    const url = `${BASE_URL}lol/match/v5/matches/${id}`;
    return fetch(url, { headers: BASE_HEADERS }).then((res) => checkResponse(res))
        .then((response) => response.json());
}

async function checkGamesInCommon(mainName, arrayName) {
    const idsPlayer = [];
    const ids = [];
    for (player_name of arrayName) {
        idsPlayer.push(getMatchesIDByName(player_name));
        ids.push(getSummonerIDByName(player_name));
    }
    await Promise.all(idsPlayer);
    await Promise.all(ids);
    console.log(`ids: ${idsPlayer}`);
    for (let i = 0; i < arrayName.length; i += 1) {
        const playerName = arrayName[i];
        console.log(`Player : ${playerName}`);
        console.log(idsPlayer[i]);
        console.log(idsPlayer[i].length);
    }

    // For each game of each player :
    // for each other player in this game, if player in list given, add the game to the result
    const allMatches = [];
    for (let i = 0; i < idsPlayer.length; i += 1) {
        const matchesId = idsPlayer[i];
        console.log(`Matchesid : ${i}`);
        console.log(matchesId);
        console.log(`len : ${matchesId.length}`);
        const tempArray = [];
        // eslint-disable-next-line no-restricted-syntax
        for (let j = 0; j < matchesId.length; j += 1) {
            const id = matchesId[j];
            console.log(j);
            tempArray.push(getMatchByID(id));
        }
        console.log(`allmatches[${i}]`);
        console.log(tempArray[i]);
        await Promise.all(tempArray);
        allMatches.push(tempArray);
    }
    await Promise.all(allMatches);
    console.log(allMatches);
}

function main() {
    getMatchesIDByName('3x1').then((matches) => {
        console.log(`Matches : ${matches}`);
        getMatchByID(matches[0]).then(
            (match) => {
                // console.log('Match : ');
                // console.log(match);
                // console.log('Participant 0 : ');
                // console.log(match.info.participants[0]);
            },
        );
    }).then(checkGamesInCommon('3x1', ['Lwipon', 'Ailler', 'Erebz']));
}

main();
