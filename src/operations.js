import * as Utils from './utils.js';

export default class Operations {
    /**
     * @param {Array<string>} names
     * @param {JSON} matches
     */
    constructor(names, matches) {
        this.names = names;
        this.matches = matches;
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
        for (const playerMatches of this.matches) {
            for (const game of playerMatches) {
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
     * Same as getAllRoles but in mapped form with the names
     * @returns {Map<string,Map<string,number>>}
     * @see getAllRoles
     */
    getAllRolesMapped() {
        const roles = this.getAllRoles();
        const resMap = new Map();
        let i = 0;
        for (const name of this.names) {
            resMap.set(name, roles[i]);
            i += 1;
        }
        return resMap;
    }

    /**
     * Returns the main role of the given player in this object's matches. Returns null if the player is not found
     * @param {string} player
     * @returns {string}
     */
    getMainRole(player) {
        const rolesMapped = this.getAllRolesMapped();
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
     * Same as getMainRoles but in mapped form with the names
     * @returns {Map<string,Map<string,number>>}
     * @see getAllRoles
     */
    getMainRolesMapped() {
        const mainRoles = this.getMainRoles();
        const resMap = new Map();
        let i = 0;
        for (const name of this.names) {
            resMap.set(name, mainRoles[i]);
            i += 1;
        }
        return resMap;
    }

    getRolesPlayedTogether() { }

    getChampionsPlayedTogether() { }

    /**
     * Removes any game that is either null, undefined, or not a 5v5 standard (flex, normal or soloq) game
     */
    removeUnrelevantGames() {
        for (let i = 0; i < this.matches.length; i += 1) {
            const playerMatches = this.matches[i];
            for (let j = 0; j < playerMatches.length; j += 1) {
                const game = playerMatches[j];
                if (game === null || game === undefined || Utils.getQueueType(game.info.queueId) === '') {
                    this.matches[i].splice(j, 1);
                    j -= 1;
                    // console.log(`+${i} / ${j}`);
                    // console.log(game);
                }
            }
        }
    }

    /**
     * Returns the matches with at least 2 player with the same name as in "names"
     * @returns {Array<any>}
     */
    getGamesInCommon() {
        const matchesID = new Set();
        const matches = [];
        for (const playerMatches of this.matches) {
            for (const game of playerMatches) {
                if (!matchesID.has(game.metadata.matchId)) {
                    // Check if at least 2 players are present in the game
                    let playersCount = 0;
                    for (const participant of game.info.participants) {
                        // Save the player if present and break
                        if (this.names.includes(participant.summonerName)) { playersCount += 1; }
                    }
                    if (playersCount > 1) {
                        matchesID.add(game.matchId);
                        matches.push(game);
                    }
                }
            }
        }
        return matches;
    }
}
