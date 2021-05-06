import { RateLimiter } from 'limiter';
import fetch from 'node-fetch';

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

async function getGamesFromNameList(arrayName) {
    let playerMatchesId = [];
    let playerIds = [];
    for (const playerName of arrayName) {
        playerIds.push(getSummonerIDByName(playerName));
    }
    playerIds = await Promise.all(playerIds);
    for (const id of playerIds) {
        playerMatchesId.push(getMatchesID(id));
    }
    playerMatchesId = await Promise.all(playerMatchesId);

    // For each game of each player :
    // for each other player in this game, if player in list given, add the game to the result
    let allMatches = [];
    for (let i = 0; i < playerMatchesId.length; i += 1) {
        const matchesId = playerMatchesId[i];
        const tempArray = [];
        for (let j = 0; j < matchesId.length; j += 1) {
            const id = matchesId[j];
            tempArray.push(getMatchByID(id));
        }
        allMatches.push(tempArray);
    }
    allMatches = await Promise.all(allMatches.map((innerPromiseArray) => Promise.all(innerPromiseArray)));
    return allMatches;
}
