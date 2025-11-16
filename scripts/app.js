// app.js — Топовый функционал с поддержкой паролей в новом формате, новыми фильтрами, режимами и стилями

// Пользователи
const users = [
  { username: 'magic', password: 'maGicc-789)!', pin: 159357 },
  { username: 'metahustler', password: 'metaaaHustler1245!', pin: 666666 },
  { username: 'salvador', password: 'SalvDalli314!', pin: 314314 },
  { username: 'user3', password: '123456', pin: 456789 },
  { username: 'user4', password: '123456', pin: 567890 }
];

// Состояние
let cookies = [];
let passwords = [];
let filteredCookies = [];
let filteredPasswords = [];
let currentFileName = '';
let currentPasswordFileName = '';
let currentMode = 'all'; // 'cookies', 'passwords', 'validate', 'all'

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

// Вкладки
const tabCookiesBtn = document.getElementById('tabCookiesBtn');
const tabCardsBtn = document.getElementById('tabCardsBtn');
const cookiesSection = document.getElementById('cookiesSection');
const cardsSection = document.getElementById('cardsSection');

// Чекер карт
const cardNumberInput = document.getElementById('cardNumber');
const cardExpiryInput = document.getElementById('cardExpiry');
const checkCardBtn = document.getElementById('checkCardBtn');
const cardResult = document.getElementById('cardResult');

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

  // 1. Тема (загрузка из localStorage)
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-theme');
  }

  // 2. Вкладки
  tabCookiesBtn.onclick = () => {
    cookiesSection.classList.add('active');
    cardsSection.classList.remove('active');
    tabCookiesBtn.classList.add('active');
    tabCardsBtn.classList.remove('active');
  };

  tabCardsBtn.onclick = () => {
    cardsSection.classList.add('active');
    cookiesSection.classList.remove('active');
    tabCardsBtn.classList.add('active');
    tabCookiesBtn.classList.remove('active');
  };

  // 3. Режимы (только для куки/паролей)
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

  // 21. Тема
  themeToggle.onclick = () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  };

  // 22. Выход
  logoutBtn.onclick = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'auth.html';
  };

  // 23. Чекер карт
  checkCardBtn.onclick = () => {
    const number = cardNumberInput.value.replace(/\s/g, '');
    const expiry = cardExpiryInput.value;

    if (!number || !expiry) {
      cardResult.textContent = 'Введите номер карты и срок действия.';
      cardResult.style.display = 'block';
      return;
    }

    const result = analyzeCard(number, expiry);
    cardResult.textContent = result;
    cardResult.style.display = 'block';
  };

  function analyzeCard(number, expiry) {
    let output = '';

    // Валидация номера (алгоритм Луна)
    if (!luhnValidate(number)) {
      output += '❌ Номер карты: НЕВАЛИДЕН (ошибка в формате/цифрах)\n';
    } else {
      output += '✅ Номер карты: ВАЛИДЕН\n';
    }

    // Определение типа карты
    const cardType = getCardType(number);
    output += `💳 Тип карты: ${cardType}\n`;

    // Определение BIN
    const bin = number.substring(0, 6);
    output += `🔢 BIN: ${bin}\n`;

    // Определение банка (упрощённо)
    const bank = getBankByBin(bin);
    output += `🏦 Банк: ${bank}\n`;

    // Определение страны (упрощённо)
    const country = getCountryByBin(bin);
    output += `🌍 Страна: ${country}\n`;

    // Определение типа (кредит/дебет)
    const cardSubType = getCardSubType(bin);
    output += `💳 Подтип: ${cardSubType}\n`;

    // Определение класса карты (упрощённо)
    const cardClass = getCardClass(bin, cardType);
    output += `🏷️ Класс: ${cardClass}\n`;

    // Проверка срока действия
    const [expMonth, expYear] = expiry.split('/');
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (parseInt(expYear) < currentYear || (parseInt(expYear) === currentYear && parseInt(expMonth) < currentMonth)) {
      output += `⏰ Срок действия: ПРОСРОЧЕН\n`;
    } else {
      output += `⏰ Срок действия: АКТУАЛЕН\n`;
    }

    return output;
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

  function getBankByBin(bin) {
    // Это упрощённый список. В реальности нужно API.
    const banks = {
      '411111': 'Visa Test',
      '555555': 'Mastercard Test',
      '378282': 'American Express Test',
      '520082': 'Capital One',
      '400005': 'Chase',
      '545454': 'Citi',
      '453999': 'Wells Fargo',
      '511111': 'Barclays',
      '402400': 'US Bank',
      '542418': 'TD Bank',
      '400018': 'Bank of America',
      '511234': 'HSBC',
      '400023': 'Discover',
      '547300': 'Santander',
      '400000': 'Ally',
      '510000': 'Sberbank',
      '431195': 'Tinkoff',
      '400001': 'Raiffeisen',
      '520000': 'VTB',
      '400002': 'Gazprombank',
      '530000': 'Rosbank',
      '400003': 'Promsvyazbank',
      '540000': 'Credit Europe Bank',
      '400004': 'Home Credit Bank',
      '550000': 'OTP Bank',
      '400006': 'Renaissance Capital',
      '560000': 'Sovcombank',
      '400007': 'Alpha Bank',
      '570000': 'Unistream',
      '400008': 'QIWI Bank',
      '580000': 'Tinkoff Bank',
      '400009': 'Raiffeisenbank',
      '590000': 'RosEvroBank',
      '400010': 'Binbank',
      '500000': 'MKB',
      '400011': 'Rusfinance Bank',
      '510001': 'Mortgage Bank',
      '400012': 'TransCapital Bank',
      '520001': 'Svyaznoy Bank',
      '400013': 'Russian Standard Bank',
      '530001': 'Home Credit Bank',
      '400014': 'OTP Bank',
      '540001': 'Sberbank',
      '400015': 'VTB',
      '550001': 'Gazprombank',
      '400016': 'Raiffeisenbank',
      '560001': 'Alfa-Bank',
      '400017': 'Tinkoff',
      '570001': 'Sovcombank',
      '400019': 'Promsvyazbank',
      '547419': 'Chase',
      '542842': 'Citi',
      '512345': 'Barclays',
      '543210': 'HSBC',
      '510510': 'American Express',
      '540540': 'Discover',
      '511234': 'Capital One',
      '543210': 'Wells Fargo',
      '510010': 'Bank of America',
      '520002': 'US Bank',
      '547301': 'TD Bank',
    };
    return banks[bin] || 'Неизвестный';
  }

  function getCountryByBin(bin) {
    // Упрощённо
    const countries = {
      '411111': 'USA',
      '555555': 'USA',
      '378282': 'USA',
      '520082': 'USA',
      '400005': 'USA',
      '545454': 'USA',
      '453999': 'USA',
      '511111': 'UK',
      '402400': 'USA',
      '542418': 'Canada',
      '400018': 'USA',
      '511234': 'UK',
      '400023': 'USA',
      '547300': 'Spain',
      '400000': 'Russia',
      '510000': 'Russia',
      '400001': 'Russia',
      '530000': 'Russia',
      '400002': 'Russia',
      '540000': 'Russia',
      '400003': 'Russia',
      '550000': 'Russia',
      '400004': 'Russia',
      '560000': 'Russia',
      '400006': 'Russia',
      '570000': 'Russia',
      '400007': 'Russia',
      '580000': 'Russia',
      '400008': 'Russia',
      '590000': 'Russia',
      '400010': 'Russia',
      '500000': 'Russia',
      '400011': 'Russia',
      '510001': 'Russia',
      '400012': 'Russia',
      '520001': 'Russia',
      '400013': 'Russia',
      '530001': 'Russia',
      '400014': 'Russia',
      '540001': 'Russia',
      '400015': 'Russia',
      '550001': 'Russia',
      '400016': 'Russia',
      '560001': 'Russia',
      '400017': 'Russia',
      '570001': 'Russia',
      '400019': 'Russia',
      '547419': 'USA',
      '542842': 'USA',
      '512345': 'UK',
      '543210': 'USA',
      '510510': 'USA',
      '540540': 'USA',
      '511234': 'USA',
      '543210': 'USA',
      '510010': 'USA',
      '520002': 'USA',
    };
    return countries[bin] || 'Неизвестная';
  }

  function getCardSubType(bin) {
    // Упрощённо
    const types = {
      '520082': 'Credit',
      '400005': 'Credit',
      '545454': 'Credit',
      '453999': 'Credit',
      '511111': 'Credit',
      '402400': 'Debit',
      '542418': 'Credit',
      '400018': 'Debit',
      '511234': 'Credit',
      '400023': 'Credit',
      '547300': 'Debit',
      '400000': 'Debit',
      '510000': 'Credit',
      '400001': 'Debit',
      '530000': 'Credit',
      '400002': 'Credit',
      '540000': 'Credit',
      '400003': 'Debit',
      '550000': 'Credit',
      '400004': 'Debit',
      '560000': 'Credit',
      '400006': 'Credit',
      '570000': 'Debit',
      '400007': 'Credit',
      '580000': 'Debit',
      '400008': 'Debit',
      '590000': 'Credit',
      '400010': 'Credit',
      '500000': 'Credit',
      '400011': 'Debit',
      '510001': 'Credit',
      '400012': 'Credit',
      '520001': 'Debit',
      '400013': 'Credit',
      '530001': 'Debit',
      '400014': 'Credit',
      '540001': 'Debit',
      '400015': 'Debit',
      '550001': 'Credit',
      '400016': 'Credit',
      '560001': 'Credit',
      '400017': 'Credit',
      '570001': 'Debit',
      '400019': 'Debit',
      '547419': 'Credit',
      '542842': 'Credit',
      '512345': 'Credit',
      '543210': 'Credit',
      '510510': 'Credit',
      '540540': 'Credit',
      '511234': 'Credit',
      '543210': 'Credit',
      '510010': 'Credit',
      '520002': 'Credit',
    };
    return types[bin] || 'Неизвестный';
  }

  function getCardClass(bin, type) {
    // Упрощённо
    const classes = {
      '520082': 'Travel Rewards',
      '400005': 'Cash Back',
      '545454': 'Business',
      '453999': 'Standard',
      '511111': 'Premium',
      '402400': 'Standard',
      '542418': 'Business',
      '400018': 'Standard',
      '511234': 'Premium',
      '400023': 'Standard',
      '547300': 'Standard',
      '400000': 'Standard',
      '510000': 'Premium',
      '400001': 'Standard',
      '530000': 'Premium',
      '400002': 'Premium',
      '540000': 'Standard',
      '400003': 'Standard',
      '550000': 'Standard',
      '400004': 'Standard',
      '560000': 'Premium',
      '400006': 'Premium',
      '570000': 'Standard',
      '400007': 'Premium',
      '580000': 'Standard',
      '400008': 'Standard',
      '590000': 'Premium',
      '400010': 'Standard',
      '500000': 'Premium',
      '400011': 'Standard',
      '510001': 'Standard',
      '400012': 'Standard',
      '520001': 'Standard',
      '400013': 'Premium',
      '530001': 'Standard',
      '400014': 'Premium',
      '540001': 'Standard',
      '400015': 'Standard',
      '550001': 'Premium',
      '400016': 'Premium',
      '560001': 'Premium',
      '400017': 'Travel Rewards',
      '570001': 'Standard',
      '400019': 'Standard',
      '547419': 'Cash Back',
      '542842': 'Travel Rewards',
      '512345': 'Premium',
      '543210': 'Business',
      '510510': 'Premium',
      '540540': 'Cash Back',
      '511234': 'Business',
      '543210': 'Premium',
      '510010': 'Standard',
      '520002': 'Business',
    };
    return classes[bin] || (type === 'American Express' ? 'Premium' : 'Standard');
  }
}
