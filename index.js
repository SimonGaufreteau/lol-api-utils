/* eslint-disable no-restricted-syntax */
import { RateLimiter } from 'limiter';
import { config } from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';

config();

const limiter = new RateLimiter({ tokensPerInterval: 3, interval: 'second' });

const BASE_URL = 'https://europe.api.riotgames.com/';
const BASE_HEADERS = {
    'X-Riot-Token': process.env.API_KEY,
};

const FAILED = [];

function checkResponse(res) {
    if (res.ok) {
        return res;
    }
    const msg = `${res.status}:${res.statusText} (${res.url})`;
    console.log(msg);
    return Promise.reject(new Error(msg));
}

async function getSummonerIDByName(name) {
    const url = `${BASE_URL}riot/account/v1/accounts/by-riot-id/${name}/EUW`;
    await limiter.removeTokens(1);
    return fetch(url, { headers: BASE_HEADERS })
        .then((res) => checkResponse(res))
        .then((response) => response.json())
        .then((data) => data.puuid)
        .catch((error) => FAILED.push(error.message));
}

async function getMatchesID(summonerId, start = 0, count = 20) {
    console.log(`id : ${summonerId}`);
    const url = `${BASE_URL}lol/match/v5/matches/by-puuid/${summonerId}/ids?start=${start}&count=${count}`;
    await limiter.removeTokens(1);
    const result = fetch(url, { headers: BASE_HEADERS })
        .then((res) => checkResponse(res))
        .then((response) => response.json());
    return result;
}

// https://europe.api.riotgames.com/lol/match/v5/matches/EUW1_5250023009
async function getMatchByID(id) {
    const url = `${BASE_URL}lol/match/v5/matches/${id}`;
    await limiter.removeTokens(1);
    return fetch(url, { headers: BASE_HEADERS }).then((res) => checkResponse(res))
        .then((response) => response.json())
        .catch((error) => {
            FAILED.push(error.message);
            return undefined;
        });
}

async function checkGamesInCommon(mainName, arrayName) {
    let idsPlayer = [];
    let ids = [];
    for (const playerName of arrayName) {
        ids.push(getSummonerIDByName(playerName));
    }
    ids = await Promise.all(ids);
    for (const id of ids) {
        idsPlayer.push(getMatchesID(id));
    }
    idsPlayer = await Promise.all(idsPlayer);
    console.log(`ids: ${idsPlayer}`);
    for (let i = 0; i < arrayName.length; i += 1) {
        const playerName = arrayName[i];
        const matchesId = idsPlayer[i];
        console.log(`Player : ${playerName}`);
        console.log(matchesId);
        console.log(matchesId.length);
    }

    // For each game of each player :
    // for each other player in this game, if player in list given, add the game to the result
    let allMatches = [];
    for (let i = 0; i < idsPlayer.length; i += 1) {
        const matchesId = idsPlayer[i];
        const tempArray = [];
        // eslint-disable-next-line no-restricted-syntax
        for (let j = 0; j < matchesId.length; j += 1) {
            const id = matchesId[j];
            tempArray.push(getMatchByID(id));
        }
        allMatches.push(tempArray);
    }
    allMatches = await Promise.all(allMatches.map((innerPromiseArray) => Promise.all(innerPromiseArray)));
    return allMatches;
}

function saveMatchesTofile(file) {
    fs.open(file, 'w', (err) => {
        if (err) throw err;
    });
    fs.writeFile(file, JSON.stringify(matches), (err) => {
        if (err) throw err;
    });
}

function readMatchesFromFile(file) {
    try {
        const data = fs.readFileSync(file, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(err);
    }
    return {};
}

function removeEmptyOrNull(obj) {
    Object.keys(obj).forEach((k) => (obj[k] && typeof obj[k] === 'object') && removeEmptyOrNull(obj[k])
      || (!obj[k] && obj[k] !== undefined) && delete obj[k]);
    return obj;
}

function getQueueType(id) {
    switch (id) {
    case 400:
        return 'Normal';
    case 420:
        return 'Soloq';
    case 440:
        return 'Flex';
    default
        : return '';
    }
}

function printMatches(matches) {
    let maxGamePerPlayer = 0;
    let minGamePerPlayer = 999;

    let meanPlayer = 0;
    let i = 0;
    const tab = '    ';
    for (const playerMatches of matches) {
        console.log(`Logging matches for player ${i} :`);
        let j = 0;
        for (const game of playerMatches) {
            if (game !== undefined) {
                console.log(`Match ${j} :`);
                console.log(`Mode : ${game.info.gameMode} ${getQueueType(game.info.queueId)}`);
                console.log('Participants :');
                for (const par of game.info.participants) {
                    console.log(`${tab}Player ${par.summonerName} :`);
                    console.log(`${tab}- champ : ${par.championName}`);
                    console.log(`${tab}- position : ${par.individualPosition} or ${par.lane} `);

                    console.log(`${tab}- KDA : ${par.kills}/${par.deaths}/${par.assists}`);
                }
                j += 1;
            }
        }
        meanPlayer += j;
        maxGamePerPlayer = Math.max(maxGamePerPlayer, j);
        minGamePerPlayer = Math.min(minGamePerPlayer, j);
        i += 1;
    }
    console.log(`Number of players : ${i + 1}`);
    console.log(`Number of games per player (max / mean / min) : 
    ${maxGamePerPlayer} / ${Math.round(meanPlayer / i)} / ${minGamePerPlayer}`);
}

async function main() {
    // const matches = await getMatchesIDByName('Erebz');
    // console.log(matches);
    const readf = true;
    if (readf) {
        const file = 'saves/matches_save.json';
        let matches = readMatchesFromFile(file);
        console.log('----------------------------');
        console.log('Matches');
        console.log('----------------------------');
        matches = removeEmptyOrNull(matches);
        printMatches(matches);
    } else {
        const id = await getSummonerIDByName('3x1');
        const matches = await getMatchesID(id, 0, 50);
        console.log(matches);
        for (const match of matches) {
            const t = await getMatchByID(match);
            console.log(t);
        }
    }
}

main();
