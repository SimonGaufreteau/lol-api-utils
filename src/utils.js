export function removeEmptyOrNull(obj) {
    Object.keys(obj).forEach((k) => (obj[k] && typeof obj[k] === 'object') && removeEmptyOrNull(obj[k])
      || (!obj[k] && obj[k] !== undefined) && delete obj[k]);
    return obj;
}

export function getQueueType(id) {
    switch (id) {
    case 400:
        return 'Normal Draft';
    case 420:
        return 'Soloq';
    case 430:
        return 'Blind';
    case 440:
        return 'Flex';
    default
        : return '';
    }
}

export function printMatches(matches) {
    let maxGamePerPlayer = 0;
    let minGamePerPlayer = 999;
    let resMessage = '';
    let meanPlayer = 0;
    let i = 0;
    const tab = '    ';
    resMessage += '----------------------------';
    resMessage += 'Matches';
    resMessage += '----------------------------';
    for (const playerMatches of matches) {
        resMessage += `\nLogging matches for player ${i} :\n`;
        let j = 0;
        for (const game of playerMatches) {
            if (game !== undefined) {
                resMessage += `\nMatch ${j} :\n`;
                resMessage += `Mode : ${game.info.gameMode} ${getQueueType(game.info.queueId)}\n`;
                resMessage += 'Participants :\n';
                for (const par of game.info.participants) {
                    resMessage += `${tab}${par.summonerName} :\n`;
                    resMessage += `${tab}- champ : ${par.championName}\n`;
                    resMessage += `${tab}- position : ${par.individualPosition} or ${par.lane} \n`;
                    resMessage += `${tab}- KDA : ${par.kills}/${par.deaths}/${par.assists}\n\n`;
                }
                j += 1;
            }
        }
        meanPlayer += j;
        maxGamePerPlayer = Math.max(maxGamePerPlayer, j);
        minGamePerPlayer = Math.min(minGamePerPlayer, j);
        i += 1;
    }
    console.log(resMessage);
    console.log(`Number of players : ${i}`);
    console.log(`Number of games per player (max / mean / min) : 
    ${maxGamePerPlayer} / ${Math.round(meanPlayer / i)} / ${minGamePerPlayer}`);
}
