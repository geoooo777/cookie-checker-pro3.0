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

  // 1. Тема (загрузка из localStorage)
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-theme');
  }

  // 2. Режимы (только для куки/паролей)
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

  // 3. Загрузка куков
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

  // 4. Загрузка паролей
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

  // 5. Парсинг куков
  function parseCookies(text) {
    return text.split('\n')
      .filter(line => !line.startsWith('#') && line.trim() !== '')
      .map(line => {
        const [domain, flag, path, secure, expiration, name, value] = line.split('\t');
        return { domain, flag, path, secure, expiration, name, value };
      });
  }

  // 6. Парсинг паролей
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

  // 7. Очистка куков
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

  // 8. Очистка паролей
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

  // 9. Валидация кук и паролей
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

  // 10. Формат валидных куки/паролей
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

  // 11. Фильтрация по нескольким доменам
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

  // 12. Формат результатов (куки + пароли)
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

  // 13. Формат только паролей
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

  // 14. Обработчики фильтров
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

  // 15. Ручной поиск
  searchBtn.onclick = () => {
    const domain = domainFilter.value.trim();
    if (!domain) return;
    filterByDomains([domain]);
  };

  // 16. Копирование
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(resultDisplay.textContent);
    alert('Скопировано в буфер обмена');
  };

  // 17. Скачивание куков
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

  // 18. Скачивание паролей
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

  // 19. Формат куков по доменам
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

  // 20. Тема
  themeToggle.onclick = () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  };

  // 21. Выход
  logoutBtn.onclick = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'auth.html';
  };

  // 22. Чекер карт
  checkCardBtn.onclick = () => {
    const number = cardNumberInput.value.replace(/\s/g, '');
    const expiry = cardExpiryInput.value;

    if (!number || !expiry) {
      cardResult.style.display = 'block';
      cardValidSpan.textContent = 'Введите номер карты и срок действия.';
      cardTypeSpan.textContent = '-';
      cardBinSpan.textContent = '-';
      cardBankSpan.textContent = '-';
      cardCountrySpan.textContent = '-';
      cardSubTypeSpan.textContent = '-';
      cardClassSpan.textContent = '-';
      cardExpiryStatusSpan.textContent = '-';
      return;
    }

    const result = analyzeCard(number, expiry);
    cardResult.style.display = 'block';
  };

  function analyzeCard(number, expiry) {
    // Валидация номера (алгоритм Луна)
    const isValid = luhnValidate(number);
    cardValidSpan.textContent = isValid ? 'ВАЛИДЕН' : 'НЕВАЛИДЕН';

    // Определение типа карты
    const cardType = getCardType(number);
    cardTypeSpan.textContent = cardType;

    // Определение BIN
    const bin = number.substring(0, 6);
    cardBinSpan.textContent = bin;

    // Определение банка (упрощённо)
    const bank = getBankByBin(bin);
    cardBankSpan.textContent = bank;

    // Определение страны (упрощённо)
    const country = getCountryByBin(bin);
    cardCountrySpan.textContent = country;

    // Определение типа (кредит/дебет)
    const cardSubType = getCardSubType(bin);
    cardSubTypeSpan.textContent = cardSubType;

    // Определение класса карты (упрощённо)
    const cardClass = getCardClass(bin, cardType);
    cardClassSpan.textContent = cardClass;

    // Проверка срока действия
    const [expMonth, expYear] = expiry.split('/');
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (parseInt(expYear) < currentYear || (parseInt(expYear) === currentYear && parseInt(expMonth) < currentMonth)) {
      cardExpiryStatusSpan.textContent = 'ПРОСРОЧЕН';
    } else {
      cardExpiryStatusSpan.textContent = 'АКТУАЛЕН';
    }

    return '';
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
      '511234': 'Wells Fargo',
      '511111': 'Barclays',
      '402400': 'US Bank',
      '542418': 'TD Bank',
      '400018': 'Bank of America',
      '511234': 'HSBC',
      '400023': 'Discover',
      '547300': 'Santander',
      '400000': 'Ally',
      '510000': 'Sberbank',
      '400001': 'Tinkoff',
      '511234': 'Raiffeisen',
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

      // Добавь новые BIN-ы
      '478200': 'Bank of America', // Пример
      '478201': 'Chase', // Пример
      '478202': 'Citi', // Пример
      '478203': 'Wells Fargo', // Пример
      '478204': 'US Bank', // Пример
      '478205': 'TD Bank', // Пример
      '478206': 'Barclays', // Пример
      '478207': 'HSBC', // Пример
      '478208': 'Discover', // Пример
      '478209': 'Santander', // Пример
      '478210': 'Ally', // Пример
      '478211': 'Sberbank', // Пример
      '478212': 'Tinkoff', // Пример
      '478213': 'Raiffeisen', // Пример
      '478214': 'VTB', // Пример
      '478215': 'Gazprombank', // Пример
      '478216': 'Rosbank', // Пример
      '478217': 'Promsvyazbank', // Пример
      '478218': 'Credit Europe Bank', // Пример
      '478219': 'Home Credit Bank', // Пример
      '478220': 'OTP Bank', // Пример
      '478221': 'Renaissance Capital', // Пример
      '478222': 'Sovcombank', // Пример
      '478223': 'Alpha Bank', // Пример
      '478224': 'Unistream', // Пример
      '478225': 'QIWI Bank', // Пример
      '478226': 'Tinkoff Bank', // Пример
      '478227': 'Raiffeisenbank', // Пример
      '478228': 'RosEvroBank', // Пример
      '478229': 'Binbank', // Пример
      '478230': 'MKB', // Пример
      '478231': 'Rusfinance Bank', // Пример
      '478232': 'Mortgage Bank', // Пример
      '478233': 'TransCapital Bank', // Пример
      '478234': 'Svyaznoy Bank', // Пример
      '478235': 'Russian Standard Bank', // Пример
      '478236': 'Home Credit Bank', // Пример
      '478237': 'OTP Bank', // Пример
      '478238': 'Sberbank', // Пример
      '478239': 'VTB', // Пример
      '478240': 'Gazprombank', // Пример
      '478241': 'Raiffeisenbank', // Пример
      '478242': 'Alfa-Bank', // Пример
      '478243': 'Tinkoff', // Пример
      '478244': 'Sovcombank', // Пример
      '478245': 'Promsvyazbank', // Пример
      '478246': 'Chase', // Пример
      '478247': 'Citi', // Пример
      '478248': 'Wells Fargo', // Пример
      '478249': 'US Bank', // Пример
      '478250': 'TD Bank', // Пример
      '478251': 'Barclays', // Пример
      '478252': 'HSBC', // Пример
      '478253': 'Discover', // Пример
      '478254': 'Santander', // Пример
      '478255': 'Ally', // Пример
      '478256': 'Sberbank', // Пример
      '478257': 'Tinkoff', // Пример
      '478258': 'Raiffeisen', // Пример
      '478259': 'VTB', // Пример
      '478260': 'Gazprombank', // Пример
      '478261': 'Rosbank', // Пример
      '478262': 'Promsvyazbank', // Пример
      '478263': 'Credit Europe Bank', // Пример
      '478264': 'Home Credit Bank', // Пример
      '478265': 'OTP Bank', // Пример
      '478266': 'Renaissance Capital', // Пример
      '478267': 'Sovcombank', // Пример
      '478268': 'Alpha Bank', // Пример
      '478269': 'Unistream', // Пример
      '478270': 'QIWI Bank', // Пример
      '478271': 'Tinkoff Bank', // Пример
      '478272': 'Raiffeisenbank', // Пример
      '478273': 'RosEvroBank', // Пример
      '478274': 'Binbank', // Пример
      '478275': 'MKB', // Пример
      '478276': 'Rusfinance Bank', // Пример
      '478277': 'Mortgage Bank', // Пример
      '478278': 'TransCapital Bank', // Пример
      '478279': 'Svyaznoy Bank', // Пример
      '478280': 'Russian Standard Bank', // Пример
      '478281': 'Home Credit Bank', // Пример
      '478282': 'American Express Test', // Пример
      '478283': 'Chase', // Пример
      '478284': 'Citi', // Пример
      '478285': 'Wells Fargo', // Пример
      '478286': 'US Bank', // Пример
      '478287': 'TD Bank', // Пример
      '478288': 'Barclays', // Пример
      '478289': 'HSBC', // Пример
      '478290': 'Discover', // Пример
      '478291': 'Santander', // Пример
      '478292': 'Ally', // Пример
      '478293': 'Sberbank', // Пример
      '478294': 'Tinkoff', // Пример
      '478295': 'Raiffeisen', // Пример
      '478296': 'VTB', // Пример
      '478297': 'Gazprombank', // Пример
      '478298': 'Rosbank', // Пример
      '478299': 'Promsvyazbank', // Пример
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
