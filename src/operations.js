import * as Utils from './utils.js';

export default class Operations {
    /**
     * @param {Array<string>} names
     * @param {JSON} matches
     */
    constructor(names, matches) {
        this.names = names;
        let tempArray = [];
        for (const playerMatches of matches) {
            tempArray = tempArray.concat(playerMatches);
        }
        this.matches = tempArray;
        this.baseN = 1;
        this.saveMatches = this.matches;
    }

    /**
     * Switch the matches to those played together. The current matches are saved and can be
     * accessed with {@link switchStandardMatches}
     * @param {S} N number of players from the list that must be in the game
     * @see switchStandardMatches
     */
    switchMatchesTogether(N = this.baseN) {
        this.saveMatches = this.matches;
        this.matches = this.getGamesInCommon(N);
    }

    /**
     * Switch the matches to the base ones.
     * @see switchMatchesTogether
     */
    switchStandardMatches() {
        this.matches = this.saveMatches;
    }

    /**
     * Returns the roles played by the player in the matches with the number of
     * games for each role
     * @param {string} playerName
     * @returns A map with key=playerName / value=number
     */
    getRoles(playerName) {
        const matchesID = new Set();
        const roles = new Map();
        for (const game of this.matches) {
            if (!matchesID.has(game.metadata.matchId)) {
                // Check if the player is present in the game
                let isPresent = false;
                let player = null;
                for (const participant of game.info.participants) {
                    // Save the player if present and break
                    if (participant.summonerName === playerName) {
                        isPresent = true;
                        player = participant;
                        break;
                    }
                }
                if (isPresent) {
                    // player is the participant object here
                    matchesID.add(game.matchId);
                    const role = player.individualPosition;
                    let nGames = 1;
                    if (roles.has(role)) {
                        nGames += roles.get(role);
                    }
                    roles.set(role, nGames);
                }
            }
        }
        return roles;
    }

    /**
     * Returns all roles played by every given player.
     * @returns {Map<string,number>[]}
     * @see getRoles
     */
    getAllRoles() {
        const roles = [];
        for (const n of this.names) {
            roles.push(this.getRoles(n));
        }
        return roles;
    }

    /**
     * Returns the main role of the given player in this object's matches. Returns null if the player is not found
     * @param {string} player
     * @returns {string}
     */
    getMainRole(player) {
        const rolesMapped = this.getRolesMapped(this.getAllRoles());
        if (rolesMapped.has(player)) {
            return [...rolesMapped.get(player).entries()].reduce((a, e) => (e[1] > a[1] ? e : a))[0];
        }
        return null;
    }

    /**
     * Returns the main role for each player
     * @returns {Array<string>}
     * @see getMainRole,getMainRolesMapped
     */
    getMainRoles() {
        const mainRoles = [];
        for (const n of this.names) {
            mainRoles.push(this.getMainRole(n));
        }
        return mainRoles;
    }

    /**
     * Maps the roles to the names
     * @param {Array<T>} roles Roles to map
     * @returns {Map<string,T>} Mapped roles
     * @see getAllRoles,getMainRoles
     */
    getRolesMapped(roles) {
        const resMap = new Map();
        let i = 0;
        for (const name of this.names) {
            resMap.set(name, roles[i]);
            i += 1;
        }
        return resMap;
    }

    getChampionsPlayed() { }

    /**
     * Removes any game that is either null, undefined, or not a 5v5 standard (flex, normal or soloq) game
     */
    removeUnrelevantGames() {
        for (let i = 0; i < this.matches.length; i += 1) {
            const game = this.matches[i];
            if (game === null || game === undefined || Utils.getQueueType(game.info.queueId) === '') {
                this.matches.splice(i, 1);
                i -= 1;
            }
        }
    }

    /**
     * Returns the matches with at least N players from the "names" list
     * @param {number} N The number of players
     * @returns {Array<any>}
     */
    getGamesInCommon(N = this.baseN) {
        const matchesID = new Set();
        const matches = [];
        for (const game of this.matches) {
            if (!matchesID.has(game.metadata.matchId)) {
                // Check if at least 2 players are present in the game
                let playersCount = 0;
                for (const participant of game.info.participants) {
                    // Save the player if present and break
                    if (this.names.includes(participant.summonerName)) { playersCount += 1; }
                }
                if (playersCount > N) {
                    matchesID.add(game.matchId);
                    matches.push(game);
                }
            }
        }
        return matches;
    }
}
