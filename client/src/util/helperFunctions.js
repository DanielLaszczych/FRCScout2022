import { mode } from 'mathjs';

export function sortRegisteredEvents(events) {
    return events.sort((a, b) => {
        let delta = new Date(a.startDate) - new Date(b.startDate);
        if (delta === 0) {
            delta = new Date(a.endDate) - new Date(b.endDate);
            if (delta === 0) {
                delta = a.name.localeCompare(b.name);
            }
        }
        return delta;
    });
}

export function sortBlueAllianceEvents(events) {
    return events.sort((a, b) => {
        let delta = new Date(a.start_date) - new Date(b.start_date);
        if (delta === 0) {
            delta = new Date(a.end_date) - new Date(b.end_date);
            if (delta === 0) {
                delta = a.name.localeCompare(b.name);
            }
        }
        return delta;
    });
}

export function sortMatches(matches) {
    return matches.sort((a, b) => {
        if (a.matchNumber.substring(0, 2) === 'qm') {
            if (b.matchNumber.substring(0, 2) === 'qm') {
                let delta = a.matchNumber.substring(2) - b.matchNumber.substring(2);
                if (delta === 0) {
                    return a.station.charAt(0) === b.station.charAt(0) ? a.station.charAt(1) - b.station.charAt(1) : a.station.charAt(0) < b.station.charAt(0) ? 1 : -1;
                } else {
                    return delta;
                }
            } else {
                return -1;
            }
        } else if (a.matchNumber.substring(0, 2) === 'qf') {
            if (b.matchNumber.substring(0, 2) === 'qf') {
                let delta = a.matchNumber.substring(2, 3) + a.matchNumber.substring(4) - (b.matchNumber.substring(2, 3) + b.matchNumber.substring(4));
                if (delta === 0) {
                    return a.station.charAt(0) === b.station.charAt(0) ? a.station.charAt(1) - b.station.charAt(1) : a.station.charAt(0) < b.station.charAt(0) ? 1 : -1;
                } else {
                    return delta;
                }
            } else {
                if (b.matchNumber.substring(0, 2) === 'qm') {
                    return 1;
                } else {
                    return -1;
                }
            }
        } else if (a.matchNumber.substring(0, 2) === 'sf') {
            if (b.matchNumber.substring(0, 2) === 'sf') {
                let delta = a.matchNumber.substring(2, 3) + a.matchNumber.substring(4) - (b.matchNumber.substring(2, 3) + b.matchNumber.substring(4));
                if (delta === 0) {
                    return a.station.charAt(0) === b.station.charAt(0) ? a.station.charAt(1) - b.station.charAt(1) : a.station.charAt(0) < b.station.charAt(0) ? 1 : -1;
                } else {
                    return delta;
                }
            } else {
                if (b.matchNumber.substring(0, 2) === 'qm' || b.matchNumber.substring(0, 2) === 'qf') {
                    return 1;
                } else {
                    return -1;
                }
            }
        } else if (a.matchNumber.substring(0, 1) === 'f') {
            if (b.matchNumber.substring(0, 1) === 'f') {
                let delta = a.matchNumber.substring(3) - b.matchNumber.substring(3);
                if (delta === 0) {
                    return a.station.charAt(0) === b.station.charAt(0) ? a.station.charAt(1) - b.station.charAt(1) : a.station.charAt(0) < b.station.charAt(0) ? 1 : -1;
                } else {
                    return delta;
                }
            } else {
                if (b.matchNumber.substring(0, 2) === 'qm' || b.matchNumber.substring(0, 2) === 'qf' || b.matchNumber.substring(0, 2) === 'sf') {
                    return 1;
                } else {
                    return -1;
                }
            }
        } else {
            return 0;
        }
    });
}

export function convertMatchKeyToString(matchKey) {
    switch (matchKey.substring(0, 2)) {
        case 'qm':
            return 'Quals ' + matchKey.substring(2);
        case 'qf':
            return `Quarters ${matchKey.substring(2, 3)} Match ${matchKey.substring(4)}`;
        case 'sf':
            return `Semis ${matchKey.substring(2, 3)} Match ${matchKey.substring(4)}`;
        default:
            return `Finals ${matchKey.substring(3)}`;
    }
}

export function convertStationKeyToString(stationKey) {
    switch (stationKey.charAt(0)) {
        case 'r':
            return `Red ${stationKey.charAt(1)}`;
        default:
            return `Blue ${stationKey.charAt(1)}`;
    }
}

export function getFields(array, field) {
    return array.map((a) => a[field]);
}

export const medianArr = (x) => {
    if (x.length === 0) {
        return 'N/A';
    }
    let sortedx = x.sort((a, b) => a - b);
    let halfIndex = Math.floor(sortedx.length / 2);

    return sortedx.length % 2 ? sortedx[Math.floor(sortedx.length / 2.0)] : (sortedx[halfIndex - 1] + sortedx[halfIndex]) / 2.0;
};

export function getPercentageForTFField(array, field) {
    let total = 0;
    array.forEach((a) => (total += a[field]));
    return total / array.length;
}

export function countOccurencesForTFField(array, field) {
    let total = 0;
    array.forEach((a) => (total += a[field]));
    return total;
}

export function getFractionForClimb(array) {
    let totalClimbs = 0;
    let successfulClimbs = 0;
    array.forEach((a) => {
        totalClimbs += a['climbTime'] > 0 ? 1 : 0;
        if (a['climbTime'] > 0) {
            successfulClimbs += a['climbRung'] !== 'Failed' ? 1 : 0;
        }
    });
    if (totalClimbs === 0) {
        return 'No attempted climbs';
    }
    return `${successfulClimbs}/${totalClimbs}`;
}

export function getSuccessfulClimbTimes(arr) {
    return arr.filter((a) => a.climbTime > 0 && a.climbRung !== 'Failed').map((a) => a['climbTime']);
}

export function getSucessfulClimbRungMode(arr) {
    let filteredArr = arr.filter((a) => a.climbTime > 0 && a.climbRung !== 'Failed').map((a) => a['climbRung']);
    if (filteredArr.length === 0) {
        return 'N/A';
    }
    return mode(filteredArr).join(', ');
}

export function getDefenseRatings(arr) {
    return arr.filter((a) => a.defenseRating > 0).map((a) => a['defenseRating']);
}
