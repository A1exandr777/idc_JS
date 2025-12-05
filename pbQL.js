'use strict';

const phoneBook = new Map();

function syntaxError(lineNumber, charNumber) {
    throw new Error(`SyntaxError: Unexpected token at ${lineNumber}:${charNumber}`);
}

function run(query) {
    const result = [];

    if (query.length > 0 && !query.endsWith(';')) {
        const lines = query.split(';');
        syntaxError(lines.length, lines[lines.length - 1].length + 1);
    }

    const commands = query.split(';');
    if (commands.length > 0 && commands[commands.length - 1] === '') {
        commands.pop();
    }

    commands.forEach((commandStr, index) => {
        const lineNumber = index + 1;
        const output = parseAndExecute(commandStr, lineNumber);
        if (output) {
            result.push(...output);
        }
    });

    return result;
}

function parseAndExecute(command, lineNumber) {
    let idx = 0;

    function readWord() {
        if (idx >= command.length) return null;

        let end = command.indexOf(' ', idx);
        if (end === -1) end = command.length;

        const word = command.substring(idx, end);
        const start = idx;

        idx = end + 1;

        return { word, start, end };
    }

    function readRest() {
        if (idx > command.length) return '';
        return command.substring(idx);
    }

    while (idx < command.length && command[idx] === ' ') {
        idx++;
    }

    const actionToken = readWord();

    if (!actionToken && command.length === 0) {
        syntaxError(lineNumber, 1);
    }
    if (!actionToken) {
        syntaxError(lineNumber, 1);
    }

    if (actionToken.word === '') {
        syntaxError(lineNumber, actionToken.start + 1);
    }

    const action = actionToken.word;

    if (action === 'Создай') {
        const objToken = readWord();
        if (!objToken || objToken.word !== 'контакт') {
            syntaxError(lineNumber, objToken ? objToken.start + 1 : command.length + 1);
        }

        const name = readRest();

        if (!phoneBook.has(name)) {
            phoneBook.set(name, { phones: [], emails: [] });
        }

    } else if (action === 'Удали') {
        const nextToken = readWord();
        if (!nextToken) syntaxError(lineNumber, command.length + 1);

        if (nextToken.word === 'контакт') {
            const name = readRest();
            if (!name) syntaxError(lineNumber, command.length + 1);
            if (phoneBook.has(name)) {
                phoneBook.delete(name);
            }
        } else if (nextToken.word === 'контакты,') {
            const whereToken = readWord();
            if (!whereToken || whereToken.word !== 'где') {
                syntaxError(lineNumber, whereToken ? whereToken.start + 1 : command.length + 1);
            }
            const isToken = readWord();
            if (!isToken || isToken.word !== 'есть') {
                syntaxError(lineNumber, isToken ? isToken.start + 1 : command.length + 1);
            }

            const query = readRest();
            if (query === '') return;

            const toDelete = [];
            for (const [name, data] of phoneBook) {
                if (isMatch(name, data, query)) {
                    toDelete.push(name);
                }
            }
            toDelete.forEach(n => phoneBook.delete(n));

        } else if (nextToken.word === 'телефон' || nextToken.word === 'почту') {
            const fields = [{ type: nextToken.word === 'телефон' ? 'phone' : 'email', val: null }];

            const valToken = readWord();
            if (!valToken || valToken.word === '') syntaxError(lineNumber, valToken ? valToken.start + 1 : command.length + 1);
            fields[0].val = valToken.word;
            validateField(fields[0].type, fields[0].val, lineNumber, valToken.start + 1);

            parseAndExecuteFieldUpdates(fields, lineNumber, command, idx, 'delete');
        } else {
            syntaxError(lineNumber, nextToken.start + 1);
        }

    } else if (action === 'Добавь') {
        const typeToken = readWord();
        if (!typeToken) syntaxError(lineNumber, command.length + 1);
        if (typeToken.word !== 'телефон' && typeToken.word !== 'почту') {
            syntaxError(lineNumber, typeToken.start + 1);
        }

        const valToken = readWord();
        if (!valToken || valToken.word === '') syntaxError(lineNumber, valToken ? valToken.start + 1 : command.length + 1);

        const type = typeToken.word === 'телефон' ? 'phone' : 'email';
        validateField(type, valToken.word, lineNumber, valToken.start + 1);

        const fields = [{ type, val: valToken.word }];

        parseAndExecuteFieldUpdates(fields, lineNumber, command, idx, 'add');

    } else if (action === 'Покажи') {
        const requestedFields = [];
        let currToken = readWord();

        while (true) {
            if (!currToken) syntaxError(lineNumber, command.length + 1);

            if (['имя', 'почты', 'телефоны'].includes(currToken.word)) {
                requestedFields.push(currToken.word);
            } else {
                syntaxError(lineNumber, currToken.start + 1);
            }

            currToken = readWord();
            if (!currToken) syntaxError(lineNumber, command.length + 1);

            if (currToken.word === 'для') {
                break;
            } else if (currToken.word === 'и') {
                currToken = readWord();
            } else {
                syntaxError(lineNumber, currToken.start + 1);
            }
        }

        const contactsToken = readWord();
        if (!contactsToken || contactsToken.word !== 'контактов,') syntaxError(lineNumber, contactsToken ? contactsToken.start + 1 : command.length + 1);

        const whereToken = readWord();
        if (!whereToken || whereToken.word !== 'где') syntaxError(lineNumber, whereToken ? whereToken.start + 1 : command.length + 1);

        const isToken = readWord();
        if (!isToken || isToken.word !== 'есть') syntaxError(lineNumber, isToken ? isToken.start + 1 : command.length + 1);

        const query = readRest();
        if (query === '') return [];

        const output = [];
        for (const [name, data] of phoneBook) {
            if (isMatch(name, data, query)) {
                const row = [];
                requestedFields.forEach(field => {
                    if (field === 'имя') row.push(name);
                    else if (field === 'почты') row.push(data.emails.join(','));
                    else if (field === 'телефоны') row.push(data.phones.map(formatPhone).join(','));
                });
                output.push(row.join(';'));
            }
        }
        return output;

    } else {
        syntaxError(lineNumber, actionToken.start + 1);
    }
}

function parseAndExecuteFieldUpdates(fields, lineNumber, command, startIdx, mode) {
    let idx = startIdx;

    function readWord() {
        if (idx >= command.length) return null;
        let end = command.indexOf(' ', idx);
        if (end === -1) end = command.length;
        const word = command.substring(idx, end);
        const start = idx;
        idx = end + 1;
        return { word, start };
    }

    function readRest() {
        if (idx > command.length) return '';
        return command.substring(idx);
    }

    let nextToken = readWord();

    while (nextToken && nextToken.word === 'и') {
        const typeToken = readWord();
        if (!typeToken) syntaxError(lineNumber, command.length + 1);
        if (typeToken.word !== 'телефон' && typeToken.word !== 'почту') {
            syntaxError(lineNumber, typeToken.start + 1);
        }

        const valToken = readWord();
        if (!valToken || valToken.word === '') syntaxError(lineNumber, valToken ? valToken.start + 1 : command.length + 1);

        const type = typeToken.word === 'телефон' ? 'phone' : 'email';
        validateField(type, valToken.word, lineNumber, valToken.start + 1);
        fields.push({ type, val: valToken.word });

        nextToken = readWord();
    }

    if (!nextToken || nextToken.word !== 'для') {
        syntaxError(lineNumber, nextToken ? nextToken.start + 1 : command.length + 1);
    }

    const contactToken = readWord();
    if (!contactToken || contactToken.word !== 'контакта') {
        syntaxError(lineNumber, contactToken ? contactToken.start + 1 : command.length + 1);
    }

    const name = readRest();
    if (!name) syntaxError(lineNumber, command.length + 1);

    if (phoneBook.has(name)) {
        const contact = phoneBook.get(name);
        fields.forEach(f => {
            if (mode === 'add') {
                if (f.type === 'phone') {
                    if (!contact.phones.includes(f.val)) contact.phones.push(f.val);
                } else {
                    if (!contact.emails.includes(f.val)) contact.emails.push(f.val);
                }
            } else {
                const arr = f.type === 'phone' ? contact.phones : contact.emails;
                const index = arr.indexOf(f.val);
                if (index !== -1) arr.splice(index, 1);
            }
        });
    }
}

function validateField(type, value, line, char) {
    if (type === 'phone') {
        if (!/^\d{10}$/.test(value)) {
            syntaxError(line, char);
        }
    }
}

function isMatch(name, data, query) {
    if (name.includes(query)) return true;
    for (const phone of data.phones) {
        if (phone.includes(query)) return true;
    }
    for (const email of data.emails) {
        if (email.includes(query)) return true;
    }
    return false;
}

function formatPhone(phone) {
    return `+7 (${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 8)}-${phone.slice(8)}`;
}

module.exports = { phoneBook, run };