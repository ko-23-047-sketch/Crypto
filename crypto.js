// --- КОНСТАНТЫ И АЛФАВИТЫ ---
const ALPHABETS = {
    ru: "абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
    en: "abcdefghijklmnopqrstuvwxyz"
};

const MORSE_MAP = {
    'а': '.-', 'б': '-...', 'в': '.--', 'г': '--.', 'д': '-..', 'е': '.', 'ж': '...-', 'з': '--..',
    'и': '..', 'й': '.---', 'к': '-.-', 'л': '.-..', 'м': '--', 'n': '-.', 'о': '---', 'п': '.--.',
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
    updateUI(); // Инициализация полей
};

function updateUI() {
    const cipher = document.getElementById('cipherSelect').value;
    const shiftWrap = document.getElementById('shiftWrap');
    const keyWrap = document.getElementById('keyWrap');
    const matrix = document.getElementById('matrixDisplay');

    // Настройка видимости
    shiftWrap.style.display = (cipher === 'caesar' || cipher === 'gronsfeld') ? 'block' : 'none';
    keyWrap.style.display = (['vigenere', 'gronsfeld', 'hill', 'playfair'].includes(cipher)) ? 'block' : 'none';
    
    // Показ матрицы для шифра Хилла или Полибия
    if (cipher === 'hill' || cipher === 'polybius') {
        matrix.style.display = 'block';
        if(cipher === 'hill') {
            document.getElementById('matrixContent').innerHTML = "Таблица 2x2 для Хилла";
        } else {
            document.getElementById('matrixContent').innerHTML = "Сетка 6x6 (RU) / 5x5 (EN)";
        }
    } else {
        matrix.style.display = 'none';
    }
}

// --- ЛОГИКА ШИФРОВАНИЯ ---

function mod(n, m) { return ((n % m) + m) % m; }

// 1. Цезарь
function caesar(text, shift) {
    return text.split('').map(char => {
        const isUpper = char === char.toUpperCase();
        const lowerChar = char.toLowerCase();
        for (let lang in ALPHABETS) {
            const abc = ALPHABETS[lang];
            const idx = abc.indexOf(lowerChar);
            if (idx !== -1) {
                let newIdx = mod(idx + shift, abc.length);
                return isUpper ? abc[newIdx].toUpperCase() : abc[newIdx];
            }
        }
        return char;
    }).join('');
}

// 2. Атбаш
function atbash(text) {
    return text.split('').map(char => {
        const isUpper = char === char.toUpperCase();
        const lowerChar = char.toLowerCase();
        for (let lang in ALPHABETS) {
            const abc = ALPHABETS[lang];
            const idx = abc.indexOf(lowerChar);
            if (idx !== -1) {
                const revChar = abc[abc.length - 1 - idx];
                return isUpper ? revChar.toUpperCase() : revChar;
            }
        }
        return char;
    }).join('');
}

// 3. Виженер и Гронсфельд (общая база)
function vigenereBase(text, key, isEncrypt, isNumbers = false) {
    if (!key) return "Введите ключ!";
    let keyIdx = 0;
    const keyStr = key.toLowerCase();

    return text.split('').map(char => {
        const isUpper = char === char.toUpperCase();
        const lowerChar = char.toLowerCase();
        for (let lang in ALPHABETS) {
            const abc = ALPHABETS[lang];
            const idx = abc.indexOf(lowerChar);
            if (idx !== -1) {
                let shift;
                if (isNumbers) {
                    shift = parseInt(keyStr[keyIdx % keyStr.length]) || 0;
                } else {
                    shift = abc.indexOf(keyStr[keyIdx % keyStr.length]);
                    if (shift === -1) shift = 0;
                }
                const finalShift = isEncrypt ? shift : -shift;
                keyIdx++;
                const newIdx = mod(idx + finalShift, abc.length);
                return isUpper ? abc[newIdx].toUpperCase() : abc[newIdx];
            }
        }
        return char;
    }).join('');
}

// 4. Морзе
function morse(text, isEncrypt) {
    if (isEncrypt) {
        return text.toLowerCase().split('').map(c => MORSE_MAP[c] || c).join(' ');
    } else {
        return text.split(' ').map(c => MORSE_REVERSE[c] || '?').join('');
    }
}

// --- ГЛАВНАЯ ФУНКЦИЯ ---

function process(isEncrypt) {
    const text = document.getElementById('inputText').value;
    const cipher = document.getElementById('cipherSelect').value;
    const shift = parseInt(document.getElementById('shiftInput').value) || 0;
    const key = document.getElementById('keyInput').value;
    
    let result = "";

    switch(cipher) {
        case 'caesar':
            result = caesar(text, isEncrypt ? shift : -shift);
            break;
        case 'atbash':
            result = atbash(text);
            break;
        case 'vigenere':
            result = vigenereBase(text, key, isEncrypt, false);
            break;
        case 'gronsfeld':
            result = vigenereBase(text, key, isEncrypt, true);
            break;
        case 'morse':
            result = morse(text, isEncrypt);
            break;
        case 'polybius':
            result = "Логика Полибия требует отрисовки динамической таблицы.";
            break;
        default:
            result = "Этот метод (" + cipher + ") еще в разработке.";
    }
    
    document.getElementById('outputText').value = result;
}
