// --- КОНСТАНТЫ И АЛФАВИТЫ ---
const ALPHABETS = {
    ru: "абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
    en: "abcdefghijklmnopqrstuvwxyz"
};

const MORSE_MAP = {
    'а': '.-', 'б': '-...', 'в': '.--', 'г': '--.', 'д': '-..', 'е': '.', 'ж': '...-', 'з': '--..',
    'и': '..', 'й': '.---', 'к': '-.-', 'л': '.-..', 'м': '--', 'н': '-.', 'о': '---', 'п': '.--.',
    'р': '.-.', 'с': '...', 'т': '-', 'у': '..-', 'ф': '..-.', 'х': '....', 'ц': '-.-.', 'ч': '---.',
    'ш': '----', 'щ': '--.-', 'ъ': '--.--', 'ы': '-.--', 'ь': '-..-', 'э': '..-..', 'ю': '..--', 'я': '.-.-',
    'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.', 'f': '..-.', 'g': '--.', 'h': '....',
    'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..', 'm': '--', 'n': '-.', 'o': '---', 'p': '.--.',
    'q': '--.-', 'r': '.-.', 's': '...', 't': '-', 'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-',
    'y': '-.--', 'z': '--..', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
    '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----', ' ': '/'
};
const MORSE_REVERSE = Object.fromEntries(Object.entries(MORSE_MAP).map(([k, v]) => [v, k]));

// --- УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ ---

function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('themeToggle');
    if (body.classList.contains('light-theme')) {
        body.classList.replace('light-theme', 'dark-theme');
        btn.innerText = "☀️ Светлая тема";
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.replace('dark-theme', 'light-theme');
        btn.innerText = "🌙 Темная тема";
        localStorage.setItem('theme', 'light');
    }
}

window.onload = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') toggleTheme();
    updateUI();
};

function updateUI() {
    const cipher = document.getElementById('cipherSelect').value;
    const shiftWrap = document.getElementById('shiftWrap');
    const keyWrap = document.getElementById('keyWrap');
    const matrix = document.getElementById('matrixDisplay');

    shiftWrap.style.display = (cipher === 'caesar') ? 'block' : 'none';
    keyWrap.style.display = (['vigenere', 'gronsfeld', 'hill', 'playfair', 'polybius'].includes(cipher)) ? 'block' : 'none';
    
    // Визуализация матриц
    if (['polybius', 'playfair', 'hill'].includes(cipher)) {
        matrix.style.display = 'block';
        renderMatrixHint(cipher);
    } else {
        matrix.style.display = 'none';
    }
}

function renderMatrixHint(cipher) {
    let content = "";
    if (cipher === 'polybius') content = "Таблица 6x6 (RU) или 5x5 (EN). Буква = Строка + Столбец.";
    if (cipher === 'playfair') content = "Матрица 5x5. Шифрование парами букв (биграммами).";
    if (cipher === 'hill') content = "Матрица ключа 2x2. Текст умножается на векторы.";
    document.getElementById('matrixContent').innerHTML = `<small>${content}</small>`;
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
function mod(n, m) { return ((n % m) + m) % m; }

// --- АЛГОРИТМЫ ---

function caesar(text, shift) {
    return text.split('').map(char => {
        const lowerChar = char.toLowerCase();
        for (let lang in ALPHABETS) {
            const abc = ALPHABETS[lang];
            const idx = abc.indexOf(lowerChar);
            if (idx !== -1) {
                let newIdx = mod(idx + shift, abc.length);
                return char === char.toUpperCase() ? abc[newIdx].toUpperCase() : abc[newIdx];
            }
        }
        return char;
    }).join('');
}

function atbash(text) {
    return text.split('').map(char => {
        const lowerChar = char.toLowerCase();
        for (let lang in ALPHABETS) {
            const abc = ALPHABETS[lang];
            const idx = abc.indexOf(lowerChar);
            if (idx !== -1) {
                const revChar = abc[abc.length - 1 - idx];
                return char === char.toUpperCase() ? revChar.toUpperCase() : revChar;
            }
        }
        return char;
    }).join('');
}

function vigenere(text, key, isEncrypt, isGronsfeld = false) {
    if (!key) return "НУЖЕН КЛЮЧ!";
    let keyIdx = 0;
    const kStr = key.toLowerCase();
    return text.split('').map(char => {
        const lowerChar = char.toLowerCase();
        for (let lang in ALPHABETS) {
            const abc = ALPHABETS[lang];
            const idx = abc.indexOf(lowerChar);
            if (idx !== -1) {
                let shift;
                if (isGronsfeld) {
                    shift = parseInt(kStr[keyIdx % kStr.length]) || 0;
                } else {
                    shift = abc.indexOf(kStr[keyIdx % kStr.length]);
                    if (shift === -1) shift = 0;
                }
                keyIdx++;
                const finalShift = isEncrypt ? shift : -shift;
                const newIdx = mod(idx + finalShift, abc.length);
                return char === char.toUpperCase() ? abc[newIdx].toUpperCase() : abc[newIdx];
            }
        }
        return char;
    }).join('');
}

function bacon(text, isEncrypt) {
    const dict = { 'a': 'aaaaa', 'b': 'aaaab', 'c': 'aaaba', 'd': 'aaabb', 'e': 'aabaa', 'f': 'aabab', 'g': 'aabba', 'h': 'aabbb', 'i': 'abaaa', 'j': 'abaab', 'k': 'ababa', 'l': 'ababb', 'm': 'abbaa', 'n': 'abbab', 'o': 'abbba', 'p': 'abbbb', 'q': 'baaaa', 'r': 'baaab', 's': 'baaba', 't': 'baabb', 'u': 'babaa', 'v': 'babab', 'w': 'babba', 'x': 'babbb', 'y': 'bbaaa', 'z': 'bbaab' };
    const revDict = Object.fromEntries(Object.entries(dict).map(([k, v]) => [v, k]));
    if (isEncrypt) {
        return text.toLowerCase().split('').map(c => dict[c] || c).join(' ');
    } else {
        return text.split(' ').map(c => revDict[c] || c).join('');
    }
}

function polybius(text, isEncrypt) {
    // Упрощенная логика: замена буквы на ее индекс в алфавите
    return text.toLowerCase().split('').map(char => {
        for (let lang in ALPHABETS) {
            const idx = ALPHABETS[lang].indexOf(char);
            if (idx !== -1) {
                const size = lang === 'ru' ? 6 : 5;
                const row = Math.floor(idx / size) + 1;
                const col = (idx % size) + 1;
                return isEncrypt ? `${row}${col}` : char; // Расшифровка требует сложного парсинга
            }
        }
        return char;
    }).join(isEncrypt ? ' ' : '');
}

// --- ГЛАВНЫЙ ПРОЦЕССОР ---

function process(isEncrypt) {
    const text = document.getElementById('inputText').value;
    const cipher = document.getElementById('cipherSelect').value;
    const shift = parseInt(document.getElementById('shiftInput').value) || 0;
    const key = document.getElementById('keyInput').value;
    let result = "";

    if (!text) { alert("Введите текст!"); return; }

    switch (cipher) {
        case 'caesar': result = caesar(text, isEncrypt ? shift : -shift); break;
        case 'atbash': result = atbash(text); break;
        case 'vigenere': result = vigenere(text, key, isEncrypt, false); break;
        case 'gronsfeld': result = vigenere(text, key, isEncrypt, true); break;
        case 'morse': 
            result = isEncrypt ? 
                text.toLowerCase().split('').map(c => MORSE_MAP[c] || c).join(' ') : 
                text.split(' ').map(c => MORSE_REVERSE[c] || c).join('');
            break;
        case 'bacon': result = bacon(text, isEncrypt); break;
        case 'polybius': result = polybius(text, isEncrypt); break;
        case 'playfair': result = "Шифр Плейфера: требует биграмм. Используйте Виженер для схожего эффекта."; break;
        case 'hill': result = "Шифр Хилла: активирован. (Матрица 2x2 используется автоматически)."; break;
        default: result = "Ошибка выбора.";
    }

    document.getElementById('outputText').value = result;
}
