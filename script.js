async function loadData() {
    try {
        const response = await fetch('https://pleshagsi.vercel.app/api/gsi');
        if (!response.ok) {
            throw new Error(`Ошибка сети: ${response.status}`);
        }
        const data = await response.json();

        console.log('Полученные данные:', data);

        if (data.length === 0) {
            console.warn('Пустой массив данных!');
            return;
        }

        const matchData = data[0];
        updateUI(matchData);

    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
    }
}

function updateUI(matchData) {
    const ctTeam = matchData.map.team_ct;
    const tTeam = matchData.map.team_t;

    document.getElementById('ct-team-name').textContent = ctTeam.name;
    document.getElementById('t-team-name').textContent = tTeam.name;

    // Обновляем заголовки столбцов игроков на название команд
    document.getElementById('ct-header-name').textContent = ctTeam.name;
    document.getElementById('t-header-name').textContent = tTeam.name;

    const ctLogoPath = `teams/${ctTeam.name}.png`;
    const tLogoPath = `teams/${tTeam.name}.png`;

    document.getElementById('ct-team-logo').src = ctLogoPath;
    document.getElementById('t-team-logo').src = tLogoPath;

    document.getElementById('ct-score').textContent = ctTeam.score;
    document.getElementById('t-score').textContent = tTeam.score;

    const mapName = matchData.map.name;
    document.getElementById('map-info').textContent = mapName;

    const allPlayers = matchData.allplayers;
    const playersArray = Object.values(allPlayers);

    let ctPlayers = playersArray.filter(p => p.team === 'CT');
    let tPlayers = playersArray.filter(p => p.team === 'T');

    // Сортируем игроков по количеству убийств (Kills)
    ctPlayers.sort((a, b) => b.match_stats.kills - a.match_stats.kills);
    tPlayers.sort((a, b) => b.match_stats.kills - a.match_stats.kills);

    renderTeamPlayers(ctPlayers, 'ct-players-container');
    renderTeamPlayers(tPlayers, 't-players-container');

    renderRoundHistory(matchData.map.round_wins);
}

function renderTeamPlayers(players, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    players.forEach(player => {
        const { kills, assists, deaths, score } = player.match_stats;
        const plusMinus = kills - deaths;

        const row = document.createElement('div');
        row.className = 'player-row';

        row.appendChild(createCol(player.name, 'player-col player-name'));
        row.appendChild(createCol(kills, 'stat-col'));
        row.appendChild(createCol(deaths, 'stat-col'));
        row.appendChild(createCol(assists, 'stat-col'));
        row.appendChild(createCol((plusMinus >= 0 ? '+' : '') + plusMinus, 'stat-col'));
        row.appendChild(createCol(score, 'stat-col'));

        container.appendChild(row);
    });
}

function createCol(text, classes) {
    const col = document.createElement('div');
    col.className = classes;
    col.textContent = text;
    return col;
}

function renderRoundHistory(roundWins) {
    const roundHistoryContainer = document.getElementById('round-history');
    roundHistoryContainer.innerHTML = '';

    // Заголовок "Round History"
    const roundHistoryTitle = document.createElement('div');
    roundHistoryTitle.className = 'round-history-title';
    roundHistoryTitle.textContent = 'Round History';
    roundHistoryContainer.appendChild(roundHistoryTitle);

    const roundNumbers = Object.keys(roundWins).map(n => parseInt(n)).sort((a,b) => a - b);

    // Первая половина: 1-12, вторая половина: >12
    const firstHalfRounds = roundNumbers.filter(n => n <= 12);
    const secondHalfRounds = roundNumbers.filter(n => n > 12);

    const halvesContainer = document.createElement('div');
    halvesContainer.className = 'halves-container';
    roundHistoryContainer.appendChild(halvesContainer);

    const firstHalfContainer = document.createElement('div');
    firstHalfContainer.className = 'half-rounds';
    halvesContainer.appendChild(firstHalfContainer);

    firstHalfRounds.forEach(roundNumber => {
        const roundWrapper = createRoundIcon(roundNumber, roundWins[roundNumber.toString()]);
        firstHalfContainer.appendChild(roundWrapper);
    });

    // Разделительная линия по центру
    const divider = document.createElement('div');
    divider.className = 'rounds-divider';
    halvesContainer.appendChild(divider);

    const secondHalfContainer = document.createElement('div');
    secondHalfContainer.className = 'half-rounds';
    halvesContainer.appendChild(secondHalfContainer);

    secondHalfRounds.forEach(roundNumber => {
        const roundWrapper = createRoundIcon(roundNumber, roundWins[roundNumber.toString()]);
        secondHalfContainer.appendChild(roundWrapper);
    });
}

function createRoundIcon(roundNumber, result) {
    let iconPath;
    let teamColorClass;

    switch (result) {
        case 't_win_elimination':
            iconPath = 'icons/t_win_elimination.png';
            teamColorClass = 't-win';
            break;
        case 't_win_bomb':
            iconPath = 'icons/t_win_bomb.png';
            teamColorClass = 't-win';
            break;
        case 'ct_win_elimination':
            iconPath = 'icons/ct_win_elimination.png';
            teamColorClass = 'ct-win';
            break;
        case 'ct_win_defuse':
            iconPath = 'icons/ct_win_defuse.png';
            teamColorClass = 'ct-win';
            break;
        case 'ct_win_time':
            iconPath = 'icons/ct_win_time.png';
            teamColorClass = 'ct-win';
            break;
        default:
            iconPath = 'icons/default.png';
            teamColorClass = '';
            break;
    }

    const roundWrapper = document.createElement('div');
    roundWrapper.className = 'round-wrapper';

    const icon = document.createElement('img');
    icon.src = iconPath;
    icon.alt = result;
    icon.className = `round-icon ${teamColorClass}`;
    icon.setAttribute('data-round-info', `Round ${roundNumber}: ${result}`);

    const roundLabel = document.createElement('span');
    roundLabel.className = 'round-number';
    roundLabel.textContent = roundNumber;

    roundWrapper.appendChild(icon);
    roundWrapper.appendChild(roundLabel);

    return roundWrapper;
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setInterval(loadData, 2000);
});
