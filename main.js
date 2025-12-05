'use strict';

/**
 * Складывает два целых числа
 * @param {Number} a Первое целое
 * @param {Number} b Второе целое
 * @throws {TypeError} Когда в аргументы переданы не числа
 * @returns {Number} Сумма аргументов
 */
function abProblem(a, b) {
    if ((Number.isFinite(a)) && Number.isFinite(b)){
        return a+b;
    }else{
        throw new TypeError();
    }
}

/**
 * Определяет век по году
 * @param {Number} year Год, целое положительное число
 * @throws {TypeError} Когда в качестве года передано не число
 * @throws {RangeError} Когда год – отрицательное значение
 * @returns {Number} Век, полученный из года
 */
function centuryByYearProblem(year) {
    if (Number.isFinite(year)){
        if (year >= 0){
            if (year % 100 === 0){
                return (year / 100);
            }else{
                return Math.trunc(year/100) + 1;
            }
        }else{
            throw new RangeError;
        }
    }else{
        throw new TypeError;
    }
}

/**
 * Переводит цвет из формата HEX в формат RGB
 * @param {String} hexColor Цвет в формате HEX, например, '#FFFFFF'
 * @throws {TypeError} Когда цвет передан не строкой
 * @throws {RangeError} Когда значения цвета выходят за пределы допустимых
 * @returns {String} Цвет в формате RGB, например, '(255, 255, 255)'
 */

function hexToDec(hex){
    const hex_digits = "0123456789ABCDEF";
    let dec = 0;
    for (let digit of hex.toUpperCase()){
        if (digit<="F"){
            dec = dec*16 +  hex_digits.indexOf(digit);
        }else throw new RangeError;

    }
    return dec
}

function colorsProblem(hexColor) {
    if(typeof hexColor === "string"){
        let hex1 = hexColor.slice(1,3);
        let hex2 = hexColor.slice(3,5);
        let hex3 = hexColor.slice(5);
        return `(${hexToDec(hex1)}, ${hexToDec(hex2)}, ${hexToDec(hex3)})`;
    }else{
        throw new TypeError;
    }
}
/**
 * Находит n-ое число Фибоначчи
 * @param {Number} n Положение числа в ряде Фибоначчи
 * @throws {TypeError} Когда в качестве положения в ряде передано не число
 * @throws {RangeError} Когда положение в ряде не является целым положительным числом
 * @returns {Number} Число Фибоначчи, находящееся на n-ой позиции
 */
function fibonacciProblem(n) {
    let n0 = 0;
    let n1 = 1;
    let n2;
    if (!Number.isFinite(n)) throw new TypeError;
    if (n<=0 || !Number.isInteger(n)) throw new RangeError;
    if (n === 1) return 1
    else if (Number.isFinite(n) && n > 0 && Number.isInteger(n)) {
        for (let i =2; i<=n; i++){
            n2 = n0+n1;
            n0 = n1;
            n1 = n2;
        }
        return n2;
    }
}
/**
 * Транспонирует матрицу
 * @param {(Any[])[]} matrix Матрица размерности MxN
 * @throws {TypeError} Когда в функцию передаётся не двумерный массив
 * @returns {(Any[])[]} Транспонированная матрица размера NxM
 */
function matrixProblem(matrix) {
    const m = matrix[0].length;
    const n = matrix.length;
    if (matrix.every(inner => Array.isArray(inner))){
        let newMatrix = [];
        for (let i = 0; i < m; i++ ){
            newMatrix[i] = [];
            for (let j = 0; j < n; j++ ){
                newMatrix[i][j] = matrix[j][i];
            }
        }
        return newMatrix;
    }else{
        throw new TypeError;
    }
}

/**
 * Переводит число в другую систему счисления
 * @param {Number} n Число для перевода в другую систему счисления
 * @param {Number} targetNs Система счисления, в которую нужно перевести (Число от 2 до 36)
 * @throws {TypeError} Когда переданы аргументы некорректного типа
 * @throws {RangeError} Когда система счисления выходит за пределы значений [2, 36]
 * @returns {String} Число n в системе счисления targetNs
 */
function numSysPr(n,targetNs){
    let newNum = [];
    let isNeg = n<0;
    let num = Math.abs(n)
    while (num>0){
        let rem = num%targetNs;
        let strRem;
        if (rem >=10){
            strRem = String.fromCharCode("a".charCodeAt(0) + rem - 10);
        }else{
            strRem = rem.toString();
        }
        newNum.unshift(strRem);
        num = Math.trunc(num/targetNs);
    }
    if (isNeg){
        newNum.unshift("-");
        return newNum.join("");
    }else{
        return newNum.join("");
    }
}


function fractalPart(n){
    let fractPart = Math.abs(Number((n - Math.trunc(n)).toFixed(13)));
    return fractPart;
}


function numberSystemProblem(n, targetNs) {
    if (targetNs < 2 || targetNs > 36){
        throw new RangeError;
    }
    if (!(Number.isFinite(targetNs) && Number.isFinite(n))){
        throw new TypeError;
    }
    if (n === 0) {
        return "0";
    }
    if (!Number.isInteger(n)){
        let fractPart = fractalPart(n);
        let intPart = numSysPr(Math.trunc(n), targetNs);
        let interim = 0;
        let newNum=[];
        while (Number(fractPart.toFixed(5)) > 0){
            interim = fractPart*targetNs;
            newNum.push(Math.trunc(interim));
            fractPart = fractalPart(interim);
        }
        return intPart + "." + newNum.join("");
    }
    return numSysPr(n, targetNs);
}
/**
 * Проверяет соответствие телефонного номера формату
 * @param {String} phoneNumber Номер телефона в формате '8–800–xxx–xx–xx'
 * @throws {TypeError} Когда в качестве аргумента передаётся не строка
 * @returns {Boolean} Если соответствует формату, то true, а иначе false
 */
function phoneProblem(phoneNumber) {
    if (typeof phoneNumber !== "string"){
        throw new TypeError;
    }
    let reg = /^8[-–—]800[-–—]\d{3}[-–—]\d{2}[-–—]\d{2}$/;
    return reg.test(phoneNumber);
}

/**
 * Определяет количество улыбающихся смайликов в строке
 * @param {String} text Строка в которой производится поиск
 * @throws {TypeError} Когда в качестве аргумента передаётся не строка
 * @returns {Number} Количество улыбающихся смайликов в строке
 */
function smilesProblem(text) {
    if (typeof text !== "string"){
        throw new TypeError;
    }
    else{
        let count = 0
        for (let r = 2; r<text.length;r++){
            let threeSymb = text.charAt(r-2)+text.charAt(r-1)+text.charAt(r);
            if (threeSymb === ":-)" || threeSymb === "(-:"){
                count++
            }
        }
        return count;
    }
}
/**
 * Определяет победителя в игре "Крестики-нолики"
 * Тестами гарантируются корректные аргументы.
 * @param {(('x' | 'o')[])[]} field Игровое поле 3x3 завершённой игры
 * @returns {'x' | 'o' | 'draw'} Результат игры
 */
function columnsToRow(field){
    let newField = [];
    for (let i = 0; i < field.length; i++){
        newField[i] = [];
        for (let j = 0; j < field[i].length; j++){
            newField[i][j] = field[j][i];
        }
    }
    return newField;
}

function ticTacToeProblem(field) {
    for (let r of field){
        if (r.every(inner => inner === "x")){ return 'x'}
        if (r.every(inner => inner === "o")){ return 'o'}
    }
    for (let r of columnsToRow(field)){
        if (r.every(inner => inner === "x")){ return 'x'}
        if (r.every(inner => inner === "o")){ return 'o'}
    }
    if (field[0][0] === field[1][1] && field[1][1] === field[2][2]){
        if (field[0][0] === "o"){
            return "o"
        }
        return "x"
    }
    if (field[0][2] === field[1][1] && field[1][1] === field[2][0] && field[1][1] === "o"){
        return "o"
    }else if (field[0][2] === field[1][1] && field[1][1] === field[2][0] && field[1][1]=== "x"){
        return "x"
    }
    return "draw";
}
const regExp = /\D/
console.log(regExp.exec(("23ASasd4524asd")))
module.exports = {
    abProblem,
    centuryByYearProblem,
    colorsProblem,
    fibonacciProblem,
    matrixProblem,
    numberSystemProblem,
    phoneProblem,
    smilesProblem,
    ticTacToeProblem
};

