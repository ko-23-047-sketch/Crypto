const ALPHABETS = {
    ru: "абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
    en: "abcdefghijklmnopqrstuvwxyz"
};

const MORSE = {
    'а': '.-', 'б': '-...', 'в': '.--', 'г': '--.', 'д': '-..', 'е': '.', 'ж': '...-', 'з': '--..',
    'и': '..', 'й': '.---', 'к': '-.-', 'л': '.-..', 'м': '--', 'н': '-.', 'о': '---', 'п': '.--.',
    'р': '.-.', 'с': '...', 'т': '-', 'у': '..-', 'ф': '..-.', 'х': '....', 'ц': '-.-.', 'ч': '---.',
    'ш': '----', 'щ': '--.-', 'ъ': '--.--', 'ы': '-.--', 'ь': '-..-', 'э': '..-..', 'ю': '..--', 'я': '.-.-',
    'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.', 'f': '..-.', 'g': '--.', 'h': '....',
    'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..', 'm': '--', 'n': '-.', 'o': '---', 'p': '.--.',
    'q': '--.-', 'r': '.-.', 's': '...', 't': '-', 'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-',
    'y': '-.--', 'z': '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
    '6': '-....', '7': '--...', '8': '---..', '9': '----.', ' ': '/'
};

const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k,v]) => [v,k]));

// --- ИНТЕРФЕЙС ---

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme', !isDark);
    document.getElementById('themeToggle').innerText = isDark ? "☀️ Светлая тема" : "🌙 Темная тема";
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function updateUI() {
    const cipher = document.getElementById('cipherSelect').value;
    const shiftWrap = document.getElementById('shiftWrap');
    const keyWrap = document.getElementById('keyWrap');
    const matrix = document.getElementById('matrixDisplay');

    shiftWrap.style.display = (cipher === 'caesar') ? 'block' : 'none';
    keyWrap.style.display = (['vigenere', 'gronsfeld', 'playfair', 'hill'].includes(cipher)) ? 'block' : 'none';
    
    if (['polybius', 'playfair', 'hill'].includes(cipher)) {
        matrix.style.display = 'block';
        const hints = {
            polybius: "Квадрат Полибия: Буква заменяется на координаты (строка/столбец).",
            playfair: "Шифр Плейфера: Работает с биграммами (парами букв).",
            hill: "Шифр Хилла: Требует матрицу ключа."
        };
        document.getElementById('matrixContent').innerHTML = `<strong>Инфо:</strong> ${hints[cipher]}`;
    } else {
        matrix.style.display = 'none';
    }
}

window.onload = () => {
    if (localStorage.getItem('theme') === 'dark') toggleTheme();
    updateUI();
};

// --- ВСПОМОГАТЕЛЬНЫЕ ---
function mod(n, m) { return ((n % m) + m) % m; }
function getAbc() { return ALPHABETS[document.getElementById('langSelect').value]; }

// --- АЛГОРИТМЫ ---

function caesar(text, shift) {
    const abc = getAbc();
    return text.split('').map(char => {
        const idx = abc.indexOf(char.toLowerCase());
        if (idx === -1) return char;
        const res = abc[mod(idx + shift, abc.length)];
        return char === char.toUpperCase() ? res.toUpperCase() : res;
    }).join('');
}

function atbash(text) {
    const abc = getAbc();
    return text.split('').map(char => {
        const idx = abc.indexOf(char.toLowerCase());
        if (idx === -1) return char;
        const res = abc[abc.length - 1 - idx];
        return char === char.toUpperCase() ? res.toUpperCase() : res;
    }).join('');
}

function vigenere(text, key, isEncrypt, isGronsfeld) {
    if (!key) return "Введите ключ!";
    const abc = getAbc();
    let keyIdx = 0;
    return text.split('').map(char => {
        const idx = abc.indexOf(char.toLowerCase());
        if (idx === -1) return char;
        let shift;
        if (isGronsfeld) {
            shift = parseInt(key[keyIdx % key.length]) || 0;
        } else {
            shift = abc.indexOf(key[keyIdx % key.length].toLowerCase());
        }
        keyIdx++;
        const finalShift = isEncrypt ? shift : -shift;
        const res = abc[mod(idx + finalShift, abc.length)];
        return char === char.toUpperCase() ? res.toUpperCase() : res;
    }).join('');
}

function polybius(text, isEncrypt) {
    const abc = getAbc();
    const size = Math.ceil(Math.sqrt(abc.length));
    if (isEncrypt) {
        return text.toLowerCase().split('').map(c => {
            const i = abc.indexOf(c);
            return i === -1 ? c : `${Math.floor(i/size)+1}${i%size+1} `;
        }).join('').trim();
    } else {
        const coords = text.match(/\d{2}/g);
        if (!coords) return "Ошибка координат";
        return coords.map(c => abc[(parseInt(c[0])-1)*size + (parseInt(c[1])-1)] || '?').join('');
    }
}

function bacon(text, isEncrypt) {
    const dict = { 'a': 'aaaaa', 'b': 'aaaab', 'c': 'aaaba', 'd': 'aaabb', 'e': 'aabaa', 'f': 'aabab', 'g': 'aabba', 'h': 'aabbb', 'i': 'abaaa', 'j': 'abaab', 'k': 'ababa', 'l': 'ababb', 'm': 'abbaa', 'n': 'abbab', 'o': 'abbba', 'p': 'abbbb', 'q': 'baaaa', 'r': 'baaab', 's': 'baaba', 't': 'baabb', 'u': 'babaa', 'v': 'babab', 'w': 'babba', 'x': 'babbb', 'y': 'bbaaa', 'z': 'bbaab' };
    const rev = Object.fromEntries(Object.entries(dict).map(([k,v]) => [v,k]));
    if (isEncrypt) return text.toLowerCase().split('').map(c => dict[c] || c).join(' ');
    return text.split(' ').map(c => rev[c] || '?').join('');
}

// --- ОБРАБОТКА ---

function process(isEncrypt) {
    const text = document.getElementById('inputText').value;
    const cipher = document.getElementById('cipherSelect').value;
    const shift = parseInt(document.getElementById('shiftInput').value) || 0;
    const key = document.getElementById('keyInput').value;
    let res = "";

    if (!text) return;

    switch (cipher) {
        case 'caesar': res = caesar(text, isEncrypt ? shift : -shift); break;
        case 'atbash': res = atbash(text); break;
        case 'vigenere': res = vigenere(text, key, isEncrypt, false); break;
        case 'gronsfeld': res = vigenere(text, key, isEncrypt, true); break;
        case 'morse': 
            res = isEncrypt ? text.toLowerCase().split('').map(c => MORSE[c] || c).join(' ') 
                            : text.split(' ').map(c => MORSE_REV[c] || c).join('');
            break;
        case 'polybius': res = polybius(text, isEncrypt); break;
        case 'bacon': res = bacon(text, isEncrypt); break;
        case 'playfair': res = "Плейфер требует обработки пар букв. Используйте Виженер для схожей сложности."; break;
        case 'hill': res = "Хилл требует матрицу ключа. (В разработке)"; break;
    }
    document.getElementById('outputText').value = res;
}
