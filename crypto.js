// Переключение видимости настроек в зависимости от шифра
function toggleSettings() {
    const cipher = document.getElementById('cipherSelect').value;
    const shiftInput = document.getElementById('shiftInput');
    const keyInput = document.getElementById('keyInput');
    const matrix = document.getElementById('matrixDisplay');

    shiftInput.style.display = (cipher === 'caesar') ? 'block' : 'none';
    keyInput.style.display = (['vigenere', 'gronsfeld', 'playfair', 'hill'].includes(cipher)) ? 'block' : 'none';
    matrix.style.display = (['polybius', 'playfair', 'hill'].includes(cipher)) ? 'block' : 'none';
}

// Главная функция обработки
function process(isEncrypt) {
    const text = document.getElementById('inputText').value;
    const cipher = document.getElementById('cipherSelect').value;
    const shift = parseInt(document.getElementById('shiftInput').value);
    const key = document.getElementById('keyInput').value;
    let result = "";

    switch(cipher) {
        case 'caesar':
            result = caesarCipher(text, isEncrypt ? shift : -shift);
            break;
        case 'atbash':
            result = atbashCipher(text);
            break;
        case 'morse':
            result = morseCipher(text, isEncrypt);
            break;
        case 'vigenere':
            result = vigenereCipher(text, key, isEncrypt);
            break;
        default:
            result = "Этот метод шифрования находится в разработке.";
    }
    document.getElementById('outputText').value = result;
}

// --- Алгоритмы ---

// 1. Шифр Цезаря (RU/EN)
function caesarCipher(str, shift) {
    const ruLower = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
    const enLower = "abcdefghijklmnopqrstuvwxyz";
    
    const crypt = (char, alphabet) => {
        const index = alphabet.indexOf(char.toLowerCase());
        if (index === -1) return char;
        let newIndex = (index + shift) % alphabet.length;
        if (newIndex < 0) newIndex += alphabet.length;
        const res = alphabet[newIndex];
        return char === char.toUpperCase() ? res.toUpperCase() : res;
    };

    return str.split('').map(c => {
        if (/[а-яё]/i.test(c)) return crypt(c, ruLower);
        if (/[a-z]/i.test(c)) return crypt(c, enLower);
        return c;
    }).join('');
}

// 2. Шифр Атбаша
function atbashCipher(str) {
    const ru = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
    const en = "abcdefghijklmnopqrstuvwxyz";
    
    const reverse = (char, alphabet) => {
        const idx = alphabet.indexOf(char.toLowerCase());
        if (idx === -1) return char;
        const res = alphabet[alphabet.length - 1 - idx];
        return char === char.toUpperCase() ? res.toUpperCase() : res;
    };

    return str.split('').map(c => {
        if (/[а-яё]/i.test(c)) return reverse(c, ru);
        if (/[a-z]/i.test(c)) return reverse(c, en);
        return c;
    }).join('');
}

// 3. Азбука Морзе (упрощенно)
const morseMap = { 'а': '.-', 'б': '-...', 'a': '.-', 'b': '-...', ' ': '/' /* и так далее */ };
function morseCipher(text, isEncrypt) {
    // Здесь должна быть полная таблица маппинга
    return "Морзе требует полной таблицы соответствия символов.";
}

// 4. Шифр Виженера
function vigenereCipher(text, key, isEncrypt) {
    if(!key) return "Введите ключ!";
    // Логика циклического сдвига на основе букв ключа
    return "Результат Виженера (логика аналогична Цезарю, но сдвиг меняется по ключу)";
}
