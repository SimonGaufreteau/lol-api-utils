import * as Utils from './utils.js';

export default class Operations {
    /**
     *
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

    getMainRole(player) { }

    getMainRoles() { }

    getRolesPlayedTogether() { }

    getChampionsPlayedTogether() { }

    removeUnrelevantGames() {
        for (let i = 0; i < this.matches.length; i += 1) {
            const playerMatches = this.matches[i];
            for (let j = 0; j < playerMatches.length; j += 1) {
                const game = playerMatches[j];
                const indexToRemove = [];
                if (game === null || game === undefined || Utils.getQueueType(game.info.queueId) === '') {
                    this.matches[i].splice(j, 1);
                    j -= 1;
                    // console.log(`+${i} / ${j}`);
                    // console.log(game);
                }
            }
        }
    }
}
