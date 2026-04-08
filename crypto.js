// Переключение тем
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

// Загрузка сохраненной темы
window.onload = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') toggleTheme();
};

// Обновление UI при выборе шифра
function updateUI() {
    const cipher = document.getElementById('cipherSelect').value;
    const shiftWrap = document.getElementById('shiftWrap');
    const keyWrap = document.getElementById('keyWrap');
    const matrix = document.getElementById('matrixDisplay');

    // Показываем нужные поля
    shiftWrap.style.display = (cipher === 'caesar' || cipher === 'gronsfeld') ? 'block' : 'none';
    keyWrap.style.display = (['vigenere', 'hill', 'playfair'].includes(cipher)) ? 'block' : 'none';
    
    // Демонстрация матрицы для Хилла или Полибия
    if (cipher === 'hill') {
        matrix.style.display = 'block';
        document.getElementById('matrixContent').innerHTML = 
            "<table border='1' style='width:100px; text-align:center; margin: 10px auto;'>" +
            "<tr><td>K1</td><td>K2</td></tr><tr><td>K3</td><td>K4</td></tr></table>" +
            "<small>(Пример матрицы 2x2 для ключа)</small>";
    } else {
        matrix.style.display = 'none';
    }
}

// Пример функции шифрования (Цезарь)
function caesar(text, shift) {
    return text.replace(/[а-яa-z]/gi, (char) => {
        const start = char <= 'Z' ? 65 : (char <= 'я' && char >= 'а' ? 1072 : 97);
        const alphabetSize = (char >= 'а' && char <= 'я') || (char >= 'А' && char <= 'Я') ? 32 : 26;
        let code = char.charCodeAt(0);
        
        // Корректировка для Ё
        if (char === 'ё' || char === 'Ё') return char; 

        return String.fromCharCode(Math.floor(mod((code - start + shift), alphabetSize)) + start);
    });
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

function process(isEncrypt) {
    const text = document.getElementById('inputText').value;
    const cipher = document.getElementById('cipherSelect').value;
    const shift = parseInt(document.getElementById('shiftInput').value);
    
    let result = "";
    if (cipher === 'caesar') {
        result = caesar(text, isEncrypt ? shift : -shift);
    } else {
        result = "Логика для " + cipher + " будет добавлена по аналогии.";
    }
    
    document.getElementById('outputText').value = result;
}
