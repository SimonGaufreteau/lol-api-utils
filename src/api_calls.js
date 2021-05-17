import { RateLimiter } from 'limiter';
import fetch from 'node-fetch';
import * as APIUtils from './api_utils.js';

export default class LoLAPI {
    constructor(log = true) {
        this.limiter = new RateLimiter({ tokensPerInterval: 4, interval: 5000 });
        this.BASE_URL = 'https://europe.api.riotgames.com/';
        this.BASE_HEADERS = {
            'X-Riot-Token': process.env.API_KEY,
        };
        this.FAILED = [];
        this.logging = log;
    }

    async getSummonerIDByName(name) {
        const url = `${this.BASE_URL}riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/EUW`;
        await this.limiter.removeTokens(1);
        APIUtils.logRequest(url, this.logging);
        return fetch(url, { headers: this.BASE_HEADERS })
            .then((res) => APIUtils.checkResponse(res))
            .then((response) => response.json())
            .then((data) => data.puuid)
            .catch((error) => this.FAILED.push(error.message));
    }

    async getMatchesID(summonerId, start = 0, count = 20) {
        const url = `${this.BASE_URL}lol/match/v5/matches/by-puuid/${summonerId}/ids?start=${start}&count=${count}`;
        await this.limiter.removeTokens(1);
        APIUtils.logRequest(url, this.logging);
        const result = fetch(url, { headers: this.BASE_HEADERS })
            .then((res) => APIUtils.checkResponse(res))
            .then((response) => response.json());
        return result;
    }

    // https://europe.api.riotgames.com/lol/match/v5/matches/EUW1_5250023009
    async getMatchByID(id) {
        const url = `${this.BASE_URL}lol/match/v5/matches/${id}`;
        await this.limiter.removeTokens(1);
        APIUtils.logRequest(url, this.logging);
        return fetch(url, { headers: this.BASE_HEADERS }).then((res) => APIUtils.checkResponse(res))
            .then((response) => response.json())
            .catch((error) => {
                this.FAILED.push(error.message);
                return undefined;
            });
    }

    async getGamesFromNameList(arrayName, matchCount = 20) {
        let playerMatchesId = [];
        let playerIds = [];
        for (const playerName of arrayName) {
            playerIds.push(this.getSummonerIDByName(playerName));
        }
        playerIds = await Promise.all(playerIds);
        for (const id of playerIds) {
            playerMatchesId.push(this.getMatchesID(id, 0, matchCount));
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
                tempArray.push(this.getMatchByID(id));
            }
            allMatches.push(tempArray);
        }
        allMatches = await Promise.all(allMatches.map((innerPromiseArray) => Promise.all(innerPromiseArray)));
        return allMatches;
    }
}
