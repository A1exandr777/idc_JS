'use strict';

function getAppropriateMoment(schedule, duration, workingHours) {
    const bankTimeZone = Number(workingHours.from.split('+')[1]) || 0;
    const bankShift = bankTimeZone * 60;

    const safeSchedule = JSON.parse(JSON.stringify(schedule));
    const bankWorkingMoments = parseWorkingHours(workingHours);
    const gangSchedule = parseSchedule(safeSchedule);

    const MIN_IN_WEEK = 7 * 24 * 60;
    const timeline = new Array(MIN_IN_WEEK).fill(false);

    function toBankTime(utcMin) {
        return (utcMin + bankShift + MIN_IN_WEEK) % MIN_IN_WEEK;
    }

    bankWorkingMoments.forEach(window => {
        let start = toBankTime(window.from);
        let end = toBankTime(window.to);

        if (start > end) {
            for (let i = start; i < MIN_IN_WEEK; i++) timeline[i] = true;
            for (let i = 0; i < end; i++) timeline[i] = true;
        } else {
            for (let i = start; i < end; i++) {
                timeline[i] = true;
            }
        }
    });

    Object.values(gangSchedule).forEach(memberWindows => {
        memberWindows.forEach(window => {
            let start = toBankTime(window.from);
            let end = toBankTime(window.to);

            if (start > end) {
                for (let i = start; i < MIN_IN_WEEK; i++) timeline[i] = false;
                for (let i = 0; i < end; i++) timeline[i] = false;
            } else {
                for (let i = start; i < end; i++) {
                    timeline[i] = false;
                }
            }
        });
    });

    const deadline = 3 * 24 * 60;

    let foundTime = -1;

    function findMoment(startFrom) {
        for (let i = startFrom; i <= deadline - duration; i++) {
            let success = true;
            for (let j = 0; j < duration; j++) {
                if (!timeline[i + j]) {
                    success = false;
                    break;
                }
            }
            if (success) {
                return i;
            }
        }
        return -1;
    }

    foundTime = findMoment(0);

    return {
        exists() {
            return foundTime !== -1;
        },

        format(template) {
            if (foundTime === -1) return "";

            const dayIdx = Math.floor(foundTime / 1440);
            const minInDay = foundTime % 1440;
            const hour = Math.floor(minInDay / 60);
            const min = minInDay % 60;

            const days = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

            return template
                .replace('%DD', days[dayIdx])
                .replace('%HH', hour.toString().padStart(2, '0'))
                .replace('%MM', min.toString().padStart(2, '0'));
        },

        tryLater() {
            if (foundTime === -1) return false;

            const nextStart = foundTime + 30;
            const nextMoment = findMoment(nextStart);

            if (nextMoment !== -1) {
                foundTime = nextMoment;
                return true;
            }
            return false;
        }
    };
}

function parseWorkingHours(workingHours) {
    let schedule = [
        {from: `ПН ${workingHours.from}`, to: `ПН ${workingHours.to}`},
        {from: `ВТ ${workingHours.from}`, to: `ВТ ${workingHours.to}`},
        {from: `СР ${workingHours.from}`, to: `СР ${workingHours.to}`},
        {from: `ЧТ ${workingHours.from}`, to: `ЧТ ${workingHours.to}`},
        {from: `ПТ ${workingHours.from}`, to: `ПТ ${workingHours.to}`},
        {from: `СБ ${workingHours.from}`, to: `СБ ${workingHours.to}`},
        {from: `ВС ${workingHours.from}`, to: `ВС ${workingHours.to}`}
    ];
    schedule = normalizeFreeTimeWindows(schedule);
    schedule = turnWindowsIntoMin(schedule);
    return schedule;
}

function hoursToMin(str) {
    const weekdays = ["ПН","ВТ","СР","ЧТ","ПТ","СБ","ВС"];
    let reg = /(?:(?<wday>ПН|ВТ|СР|ЧТ|ПТ|СБ|ВС) )?(?<hours>\d+):(?<minute>\d+)(?<timeZone>\+\d+)?/;
    const match = reg.exec(str);
    if (!match) return 0;
    const {wday, hours, minute} = match.groups;
    return weekdays.indexOf(wday)*1440 + Number(hours) * 60 + Number(minute);
}

function turnWindowsIntoMin(freeTimeWindows) {
    for (let i = 0; i < freeTimeWindows.length; i++){
        freeTimeWindows[i] = {from: hoursToMin(freeTimeWindows[i].from),to: hoursToMin(freeTimeWindows[i].to)};
    }
    return freeTimeWindows;
}

function convertToUts(str){
    let reg = /(?:(?<wday>ПН|ВТ|СР|ЧТ|ПТ|СБ|ВС) )?(?<hours>\d+):(?<minute>\d+)(?<timeZone>\+\d+)?/;
    const weekdays = ["ПН","ВТ","СР","ЧТ","ПТ","СБ","ВС"];
    const match = reg.exec(str);
    const {wday, hours, minute, timeZone} = match.groups;

    let h = Number(hours);
    let tz = Number(timeZone);
    let utcWeekday;
    let utcHours = (h - tz + 24) % 24;

    if (tz > h){
        let dayIdx = weekdays.indexOf(wday) - 1;
        if (dayIdx < 0) dayIdx = 6;
        utcWeekday = weekdays[dayIdx];
    }
    else{
        utcWeekday = wday;
    }
    return `${utcWeekday} ${utcHours}:${minute}`;
}

function normalizeFreeTimeWindows(freeTimeWindows) {
    for (let i = 0; i < freeTimeWindows.length; i++){
        freeTimeWindows[i] = {from: convertToUts(freeTimeWindows[i].from),to: convertToUts(freeTimeWindows[i].to)};
    }
    return freeTimeWindows;
}

function parseSchedule(schedule){
    const nameOfFriends = Object.keys(schedule);
    const numberOfFriends = nameOfFriends.length;
    for (let i = 0; i < numberOfFriends; i++) {
        let freeTimeWindows = schedule[nameOfFriends[i]];
        freeTimeWindows = normalizeFreeTimeWindows(freeTimeWindows);
        freeTimeWindows = turnWindowsIntoMin(freeTimeWindows);
        schedule[nameOfFriends[i]] = freeTimeWindows;
    }
    return schedule;
}

module.exports = {
    getAppropriateMoment
};