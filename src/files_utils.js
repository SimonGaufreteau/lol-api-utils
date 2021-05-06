import fs from 'fs';

export function saveMatchesTofile(file, matches) {
    fs.open(file, 'w', (err) => {
        if (err) throw err;
    });
    fs.writeFile(file, JSON.stringify(matches), (err) => {
        if (err) throw err;
    });
}

export function readMatchesFromFile(file) {
    try {
        const data = fs.readFileSync(file, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(err);
    }
    return {};
}
