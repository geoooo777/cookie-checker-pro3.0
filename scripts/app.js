// app.js — Топовый функционал с поддержкой паролей в новом формате, новыми фильтрами, режимами и стилями

// Пользователи
const users = [
  { username: 'magic', password: 'maGicc-789)!', pin: 159357 },
  { username: 'metahustler', password: 'metaaaHustler1245!', pin: 666666 },
  { username: 'salvador', password: 'SalvDalli314!', pin: 314314 },
  { username: 'user3', password: '123456', pin: 456789 },
  { username: 'user4', password: '123456', pin: 567890 }
];

// Проверка авторизации
if (!localStorage.getItem('isLoggedIn')) {
  if (!window.location.pathname.includes('auth.html')) {
    window.location.href = 'auth.html';
  }
} else {
  if (window.location.pathname.includes('auth.html')) {
    window.location.href = 'dashboard.html';
  }
}

// Состояние
let cookies = [];
let passwords = [];
let filteredCookies = [];
let filteredPasswords = [];
let currentFileName = '';
let currentPasswordFileName = '';
let currentMode = 'all'; // 'cookies', 'passwords', 'validate', 'all'

// База BIN
let BIN_DB = null;

// DOM
const logoutBtn = document.getElementById('logoutBtn');
const cookieFile = document.getElementById('cookieFile');
const passwordFile = document.getElementById('passwordFile');
const fileInfo = document.getElementById('fileInfo');
const passwordInfo = document.getElementById('passwordInfo');
const fileNameSpan = document.getElementById('fileName');
const cookieCountSpan = document.getElementById('cookieCount');
const passwordFileNameSpan = document.getElementById('passwordFileName');
const passwordCountSpan = document.getElementById('passwordCount');
const clearCookiesBtn = document.getElementById('clearCookiesBtn');
const clearPasswordsBtn = document.getElementById('clearPasswordsBtn');
const domainFilter = document.getElementById('domainFilter');
const searchBtn = document.getElementById('searchBtn');
const resultDisplay = document.getElementById('resultDisplay');
const resultCount = document.getElementById('resultCount');
const downloadBtn = document.getElementById('downloadBtn');
const downloadPasswordsBtn = document.getElementById('downloadPasswordsBtn');
const copyBtn = document.getElementById('copyBtn');
const themeToggle = document.getElementById('themeToggle');
const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
const filterCheckboxes = document.querySelectorAll('.filter-checkbox');
const filterItems = document.querySelectorAll('.filter-item');

// Режимы
const modeCookiesBtn = document.getElementById('modeCookiesBtn');
const modePasswordsBtn = document.getElementById('modePasswordsBtn');
const modeValidateBtn = document.getElementById('modeValidateBtn');
const modeAllBtn = document.getElementById('modeAllBtn');

// Конвертер кук в JSON
const jsonInputFile = document.getElementById('jsonInputFile');
const jsonFileInfo = document.getElementById('jsonFileInfo');
const jsonFileNameSpan = document.getElementById('jsonFileName');
const jsonCookieCountSpan = document.getElementById('jsonCookieCount');
const clearJsonCookiesBtn = document.getElementById('clearJsonCookiesBtn');
const formatJsonBtn = document.getElementById('formatJsonBtn');
const downloadJsonBtn = document.getElementById('downloadJsonBtn');

// Чекер карт
const cardNumberInput = document.getElementById('cardNumber');
const cardExpiryInput = document.getElementById('cardExpiry');
const checkCardBtn = document.getElementById('checkCardBtn');
const cardResult = document.getElementById('cardResult');
const cardValidSpan = document.getElementById('cardValid');
const cardTypeSpan = document.getElementById('cardType');
const cardBinSpan = document.getElementById('cardBin');
const cardBankSpan = document.getElementById('cardBank');
const cardCountrySpan = document.getElementById('cardCountry');
const cardSubTypeSpan = document.getElementById('cardSubType');
const cardClassSpan = document.getElementById('cardClass');
const cardPrepaidSpan = document.getElementById('cardPrepaid');
const cardBankUrlSpan = document.getElementById('cardBankUrl');
const cardExpiryStatusSpan = document.getElementById('cardExpiryStatus');

// На странице авторизации
if (window.location.pathname.includes('auth.html')) {
  const authForm = document.getElementById('authForm');
  const pinForm = document.getElementById('pinForm');
  const errorDiv = document.getElementById('error');

  authForm.onsubmit = (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      window.currentUser = user;
      authForm.style.display = 'none';
      pinForm.style.display = 'block';
    } else {
      showError('Неверный логин или пароль');
    }
  };

  pinForm.onsubmit = (e) => {
    e.preventDefault();
    const pin = parseInt(document.getElementById('pin').value);
    if (window.currentUser && pin === window.currentUser.pin) {
      localStorage.setItem('isLoggedIn', true);
      localStorage.setItem('currentUser', JSON.stringify(window.currentUser));
      window.location.href = 'dashboard.html';
    } else {
      showError('Неверный PIN');
    }
  };

  function showError(msg) {
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 3000);
  }
}

// На дашборде
if (window.location.pathname.includes('dashboard.html')) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    window.location.href = 'auth.html';
  }

  // 1. Загрузка темы
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-theme');
  }

  // 2. Загрузка базы BIN
  async function loadBinDatabase() {
    if (BIN_DB) return;
    console.log("Загружаем базу BIN (38 MB) — безопасно с jsDelivr...");
    const response = await fetch("https://cdn.jsdelivr.net/gh/iannuttall/binlist-data@latest/binlist.json");
    BIN_DB = await response.json();
    console.log("База загружена:", BIN_DB.length, "диапазонов");
  }

  // 3. Режимы
  modeCookiesBtn.onclick = () => {
    currentMode = 'cookies';
    setActiveModeButton(modeCookiesBtn);
    updateFilters();
  };

  modePasswordsBtn.onclick = () => {
    currentMode = 'passwords';
    setActiveModeButton(modePasswordsBtn);
    updateFilters();
  };

  modeValidateBtn.onclick = () => {
    currentMode = 'validate';
    setActiveModeButton(modeValidateBtn);
    validateCredentials();
  };

  modeAllBtn.onclick = () => {
    currentMode = 'all';
    setActiveModeButton(modeAllBtn);
    updateFilters();
  };

  function setActiveModeButton(activeBtn) {
    [modeCookiesBtn, modePasswordsBtn, modeValidateBtn, modeAllBtn].forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  // 4. Загрузка куков
  cookieFile.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    currentFileName = file.name;
    fileNameSpan.textContent = currentFileName;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      cookies = parseCookies(text);
      cookieCountSpan.textContent = cookies.length;
      fileInfo.style.display = 'block';
      updateFilters();
    };
    reader.readAsText(file);
  };

  // 5. Загрузка паролей
  passwordFile.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    currentPasswordFileName = file.name;
    passwordFileNameSpan.textContent = currentPasswordFileName;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      passwords = parsePasswords(text);
      passwordCountSpan.textContent = passwords.length;
      passwordInfo.style.display = 'block';
      updateFilters();
    };
    reader.readAsText(file);
  };

  // 6. Парсинг куков
  function parseCookies(text) {
    return text.split('\n')
      .filter(line => !line.startsWith('#') && line.trim() !== '')
      .map(line => {
        const [domain, flag, path, secure, expiration, name, value] = line.split('\t');
        return { domain, flag, path, secure, expiration, name, value };
      });
  }

  // 7. Парсинг паролей
  function parsePasswords(text) {
    const entries = text.split('===============');
    const parsed = [];

    for (const entry of entries) {
      if (!entry.trim()) continue;

      const lines = entry.split('\n').filter(l => l.trim() !== '');

      let url = '';
      let username = '';
      let password = '';

      for (const line of lines) {
        if (line.startsWith('URL:')) {
          url = line.replace('URL: ', '').trim();
        } else if (line.startsWith('Username:')) {
          username = line.replace('Username: ', '').trim();
        } else if (line.startsWith('Password:')) {
          password = line.replace('Password: ', '').trim();
        }
      }

      if (url && username && password) {
        try {
          const domain = new URL(url).hostname;
          parsed.push({ url, domain, username, password });
        } catch (e) {
          const match = url.match(/^(?:https?:\/\/)?([^\/\?#]+)/i);
          if (match && match[1]) {
            parsed.push({ url, domain: match[1], username, password });
          }
        }
      }
    }

    return parsed;
  }

  // 8. Очистка куков
  clearCookiesBtn.onclick = () => {
    cookies = [];
    filteredCookies = [];
    currentFileName = '';
    fileNameSpan.textContent = '';
    cookieCountSpan.textContent = '0';
    fileInfo.style.display = 'none';
    if (passwords.length === 0) {
      resultDisplay.textContent = '';
      resultCount.textContent = 'Найдено: 0';
      downloadBtn.style.display = 'none';
      downloadPasswordsBtn.style.display = 'none';
      filterCheckboxes.forEach(checkbox => checkbox.checked = false);
    } else {
      updateFilters();
    }
    alert('Куки очищены');
  };

  // 9. Очистка паролей
  clearPasswordsBtn.onclick = () => {
    passwords = [];
    filteredPasswords = [];
    currentPasswordFileName = '';
    passwordFileNameSpan.textContent = '';
    passwordCountSpan.textContent = '0';
    passwordInfo.style.display = 'none';
    if (cookies.length === 0) {
      resultDisplay.textContent = '';
      resultCount.textContent = 'Найдено: 0';
      downloadBtn.style.display = 'none';
      downloadPasswordsBtn.style.display = 'none';
      filterCheckboxes.forEach(checkbox => checkbox.checked = false);
    } else {
      updateFilters();
    }
    alert('Пароли очищены');
  };

  // 10. Валидация кук и паролей
  function validateCredentials() {
    if (cookies.length === 0 || passwords.length === 0) {
      resultDisplay.textContent = 'Для проверки валидности нужно загрузить и куки, и пароли.';
      resultCount.textContent = 'Найдено: 0';
      downloadBtn.style.display = 'none';
      downloadPasswordsBtn.style.display = 'none';
      return;
    }

    const validCredentials = [];
    for (const cookie of cookies) {
      for (const password of passwords) {
        if (cookie.domain === password.domain) {
          validCredentials.push({
            domain: cookie.domain,
            cookie: `${cookie.domain}\t${cookie.flag}\t${cookie.path}\t${cookie.secure}\t${cookie.expiration}\t${cookie.name}\t${cookie.value}`,
            password: `URL: ${password.url}\nUsername: ${password.username}\nPassword: ${password.password}`
          });
        }
      }
    }

    resultCount.textContent = `Найдено: ${validCredentials.length} валидных пар`;
    resultDisplay.textContent = formatValidatedCredentials(validCredentials);
    downloadBtn.style.display = 'none';
    downloadPasswordsBtn.style.display = 'none';
  }

  // 11. Формат валидных куки/паролей
  function formatValidatedCredentials(credentials) {
    let output = '';
    credentials.forEach(c => {
      output += `# ${c.domain}\n`;
      output += c.cookie + '\n';
      output += c.password + '\n';
      output += '===============\n\n';
    });
    return output;
  }

  // 12. Фильтрация по нескольким доменам
  function filterByDomains(domains) {
    filteredCookies = cookies.filter(c => domains.some(d => c.domain.includes(d)));
    filteredPasswords = passwords.filter(p => domains.some(d => p.domain.includes(d)));

    if (currentMode === 'cookies') {
      resultCount.textContent = `Найдено: ${filteredCookies.length} кук`;
      resultDisplay.textContent = formatCookiesByDomain(filteredCookies);
      downloadBtn.style.display = filteredCookies.length > 0 ? 'block' : 'none';
      downloadPasswordsBtn.style.display = 'none';
    } else if (currentMode === 'passwords') {
      resultCount.textContent = `Найдено: ${filteredPasswords.length} паролей`;
      resultDisplay.textContent = formatPasswords(filteredPasswords);
      downloadPasswordsBtn.style.display = filteredPasswords.length > 0 ? 'block' : 'none';
      downloadBtn.style.display = 'none';
    } else if (currentMode === 'validate') {
      validateCredentials();
    } else { // all
      resultCount.textContent = `Найдено: ${filteredCookies.length} кук, ${filteredPasswords.length} паролей`;
      resultDisplay.textContent = formatResults(filteredCookies, filteredPasswords);
      downloadBtn.style.display = filteredCookies.length > 0 ? 'block' : 'none';
      downloadPasswordsBtn.style.display = filteredPasswords.length > 0 ? 'block' : 'none';
    }
  }

  // 13. Формат результатов (куки + пароли)
  function formatResults(cookies, passwords) {
    let output = '';

    if (cookies.length > 0) {
      output += '# Куки:\n';
      const grouped = {};
      cookies.forEach(c => {
        if (!grouped[c.domain]) grouped[c.domain] = [];
        grouped[c.domain].push(`${c.domain}\t${c.flag}\t${c.path}\t${c.secure}\t${c.expiration}\t${c.name}\t${c.value}`);
      });
      for (const domain in grouped) {
        output += `# ${domain}\n`;
        output += grouped[domain].join('\n');
        output += '\n\n';
      }
    }

    if (passwords.length > 0) {
      output += '# Пароли:\n';
      passwords.forEach(p => {
        output += `URL: ${p.url}\n`;
        output += `Username: ${p.username}\n`;
        output += `Password: ${p.password}\n`;
        output += `Application: Google_[Chrome]_Default\n`;
        output += '===============\n';
      });
    }

    return output;
  }

  // 14. Формат только паролей
  function formatPasswords(passwords) {
    let output = '';
    passwords.forEach(p => {
      output += `URL: ${p.url}\n`;
      output += `Username: ${p.username}\n`;
      output += `Password: ${p.password}\n`;
      output += `Application: Google_[Chrome]_Default\n`;
      output += '===============\n';
    });
    return output;
  }

  // 15. Обработчики фильтров
  filterItems.forEach((item, index) => {
    item.onclick = () => {
      const checkbox = filterCheckboxes[index];
      checkbox.checked = !checkbox.checked;
      updateFilters();
    };
  });

  filterCheckboxes.forEach(checkbox => {
    checkbox.onchange = () => {
      updateFilters();
    };
  });

  categoryCheckboxes.forEach(checkbox => {
    checkbox.onchange = () => {
      const category = checkbox.closest('.filter-category');
      const categoryCheckboxes = category.querySelectorAll('.filter-checkbox');
      categoryCheckboxes.forEach(cb => {
        cb.checked = checkbox.checked;
      });
      updateFilters();
    };
  });

  function updateFilters() {
    const selectedDomains = [];
    filterCheckboxes.forEach((checkbox, index) => {
      if (checkbox.checked) {
        const domain = filterItems[index].querySelector('.filter-domain').textContent;
        selectedDomains.push(domain);
      }
    });
    if (selectedDomains.length > 0) {
      filterByDomains(selectedDomains);
    } else {
      if (cookies.length === 0 && passwords.length === 0) {
        resultDisplay.textContent = '';
        resultCount.textContent = 'Найдено: 0';
        downloadBtn.style.display = 'none';
        downloadPasswordsBtn.style.display = 'none';
      } else if (currentMode === 'validate') {
        validateCredentials();
      } else {
        if (currentMode === 'cookies') {
          resultCount.textContent = `Найдено: ${cookies.length} кук`;
          resultDisplay.textContent = formatCookiesByDomain(cookies);
          downloadBtn.style.display = cookies.length > 0 ? 'block' : 'none';
          downloadPasswordsBtn.style.display = 'none';
        } else if (currentMode === 'passwords') {
          resultCount.textContent = `Найдено: ${passwords.length} паролей`;
          resultDisplay.textContent = formatPasswords(passwords);
          downloadPasswordsBtn.style.display = passwords.length > 0 ? 'block' : 'none';
          downloadBtn.style.display = 'none';
        } else if (currentMode === 'all') {
          resultCount.textContent = `Найдено: ${cookies.length} кук, ${passwords.length} паролей`;
          resultDisplay.textContent = formatResults(cookies, passwords);
          downloadBtn.style.display = cookies.length > 0 ? 'block' : 'none';
          downloadPasswordsBtn.style.display = passwords.length > 0 ? 'block' : 'none';
        }
      }
    }
  }

  // 16. Ручной поиск
  searchBtn.onclick = () => {
    const domain = domainFilter.value.trim();
    if (!domain) return;
    filterByDomains([domain]);
  };

  // 17. Копирование
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(resultDisplay.textContent);
    alert('Скопировано в буфер обмена');
  };

  // 18. Скачивание куков
  downloadBtn.onclick = () => {
    const content = formatCookiesByDomain(filteredCookies);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cookies_${currentFileName || 'filtered'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 19. Скачивание паролей
  downloadPasswordsBtn.onclick = () => {
    let content = '';
    filteredPasswords.forEach(p => {
      content += `URL: ${p.url}\n`;
      content += `Username: ${p.username}\n`;
      content += `Password: ${p.password}\n`;
      content += `Application: Google_[Chrome]_Default\n`;
      content += '===============\n';
    });
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `passwords_${currentPasswordFileName || 'filtered'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 20. Формат куков по доменам
  function formatCookiesByDomain(cookies) {
    const grouped = {};
    cookies.forEach(c => {
      if (!grouped[c.domain]) grouped[c.domain] = [];
      grouped[c.domain].push(`${c.domain}\t${c.flag}\t${c.path}\t${c.secure}\t${c.expiration}\t${c.name}\t${c.value}`);
    });

    let output = '';
    for (const domain in grouped) {
      output += `# ${domain}\n`;
      output += grouped[domain].join('\n');
      output += '\n\n';
    }
    return output;
  }

  // 21. Конвертер кук в JSON
  formatJsonBtn.onclick = async () => {
    const text = jsonTextInput.value.trim();
    if (!text) {
      alert('Введите содержимое файла с куками');
      return;
    }

    const cookies = parseCookies(text);
    const jsonContent = JSON.stringify(cookies, null, 2);

    // Показать кнопку скачивания
    downloadJsonBtn.style.display = 'block';

    // При нажатии на скачивание
    downloadJsonBtn.onclick = () => {
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cookies.json';
      a.click();
      URL.revokeObjectURL(url);
    };
  };

  // 22. Тема
  themeToggle.onclick = () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  };

  // 23. Выход
  logoutBtn.onclick = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'auth.html';
  };

  // 24. Чекер карт (с базой BIN)
  checkCardBtn.onclick = async () => {
    await loadBinDatabase(); // Загружаем базу, если ещё не загружена

    const number = cardNumberInput.value.replace(/\s/g, '');
    const expiry = cardExpiryInput.value;

    if (!number || !expiry) {
      cardResult.style.display = 'block';
      cardValidSpan.innerHTML = 'Введите номер карты и срок действия.';
      cardTypeSpan.textContent = '-';
      cardBinSpan.textContent = '-';
      cardBankSpan.textContent = '-';
      cardCountrySpan.textContent = '-';
      cardSubTypeSpan.textContent = '-';
      cardClassSpan.textContent = '-';
      cardPrepaidSpan.textContent = '-';
      cardBankUrlSpan.innerHTML = '-';
      cardExpiryStatusSpan.textContent = '-';
      return;
    }

    const result = analyzeCardWithBinDb(number, expiry);
    cardResult.style.display = 'block';
  };

  function analyzeCardWithBinDb(number, expiry) {
    // Валидация номера (алгоритм Луна)
    const isValid = luhnValidate(number);
    cardValidSpan.innerHTML = isValid ? '<span style="color:#00ff88;">ВАЛИДЕН 🟢</span>' : '<span style="color:#ff0066;">НЕВАЛИДЕН 🔴</span>';

    // Определение типа карты
    const cardType = getCardType(number);
    cardTypeSpan.textContent = cardType;

    // Определение BIN
    const bin = number.substring(0, 8); // Используем 8 символов для поиска в базе
    cardBinSpan.textContent = bin;

    // Поиск информации по BIN в базе
    const binInfo = findBinInfo(bin);

    if (binInfo) {
      cardBankSpan.textContent = binInfo.bank_name || 'Неизвестный';
      cardCountrySpan.innerHTML = `${binInfo.country_name || 'Неизвестно'} ${countryToFlag(binInfo.country_alpha2)}`;
      cardSubTypeSpan.textContent = binInfo.card_type || 'Неизвестный';
      cardClassSpan.textContent = binInfo.card_category || 'Standard';
      cardPrepaidSpan.textContent = binInfo.prepaid ? 'Да' : 'Нет';
      cardBankUrlSpan.innerHTML = binInfo.bank_url ? `<a href="https://${binInfo.bank_url}" target="_blank">${binInfo.bank_url}</a>` : 'Нет';
    } else {
      cardBankSpan.textContent = 'Неизвестный';
      cardCountrySpan.textContent = 'Неизвестно';
      cardSubTypeSpan.textContent = 'Неизвестный';
      cardClassSpan.textContent = 'Standard';
      cardPrepaidSpan.textContent = 'Нет';
      cardBankUrlSpan.innerHTML = 'Нет';
    }

    // Проверка срока действия
    const [expMonth, expYear] = expiry.split('/');
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (parseInt(expYear) < currentYear || (parseInt(expYear) === currentYear && parseInt(expMonth) < currentMonth)) {
      cardExpiryStatusSpan.innerHTML = '<span style="color:#ff0066;">ПРОСРОЧЕН 🔴</span>';
    } else {
      cardExpiryStatusSpan.innerHTML = '<span style="color:#00ff88;">АКТУАЛЕН 🟢</span>';
    }

    return '';
  }

  function findBinInfo(bin) {
    // Ищем в базе BIN
    // bin — строка (например, "47820012")
    // range_start и range_end — числа (например, 47820000 и 47820099)
    const binAsNumber = parseInt(bin.padEnd(8, '0')); // Приведём к 8 символам (дополнив нулями)

    return BIN_DB.find(entry => {
      const start = parseInt(entry.range_start);
      const end = parseInt(entry.range_end);
      return binAsNumber >= start && binAsNumber <= end;
    }) || null;
  }

  function luhnValidate(cardNumber) {
    let sum = 0;
    let isEven = false;
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i));
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  }

  function getCardType(number) {
    if (/^4/.test(number)) return 'Visa';
    if (/^5[1-5]/.test(number)) return 'Mastercard';
    if (/^3[47]/.test(number)) return 'American Express';
    if (/^6(?:011|5)/.test(number)) return 'Discover';
    if (/^(?:2131|1800|35)/.test(number)) return 'JCB';
    if (/^3(?:0[0-5]|[68])/.test(number)) return 'Diners Club';
    return 'Неизвестный';
  }

  function countryToFlag(countryCode) {
    if (!countryCode) return '';
    return countryCode.toUpperCase().replace(/./g, char =>
      String.fromCodePoint(0x1F1E6 + char.charCodeAt(0) - 65)
    );
  }
}
