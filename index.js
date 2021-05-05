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

function main() {
    getMatchesIDByName('3x1').then((matches) => console.log(`Matches : ${matches}`));
}

main();
