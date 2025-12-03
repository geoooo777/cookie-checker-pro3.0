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

// Для конвертера JSON
let jsonCookies = [];

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

  // 2. Режимы
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

  // 20. Конвертер кук в JSON
  jsonInputFile.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    jsonFileNameSpan.textContent = file.name;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      jsonCookies = parseCookies(text);
      jsonCookieCountSpan.textContent = jsonCookies.length;
      jsonFileInfo.style.display = 'block';
    };
    reader.readAsText(file);
  };

  formatJsonBtn.onclick = () => {
    if (jsonCookies.length === 0) {
      alert('Сначала загрузите файл с куками.');
      return;
    }

    const jsonData = JSON.stringify(jsonCookies, null, 2);

    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cookies_${jsonFileNameSpan.textContent.replace('.txt', '') || 'converted'}.json`;
    a.click();
    URL.revokeObjectURL(url);

    alert('Куки успешно конвертированы в JSON и скачаны.');
  };

  // 21. Чекер карт
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

    // Определение банка (только международные)
    const bank = getBankByBin(bin);
    cardBankSpan.textContent = bank;

    // Определение страны (только международные)
    const country = getCountryByBin(bin);
    cardCountrySpan.textContent = country;

    // Определение типа (кредит/дебет)
    const cardSubType = getCardSubType(bin);
    cardSubTypeSpan.textContent = cardSubType;

    // Определение класса карты (только международные)
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
    // Только международные банки (без российских)
    const banks = {
      '411111': 'Visa Test',
      '555555': 'Mastercard Test',
      '378282': 'American Express Test',
      '520082': 'Capital One',
      '400005': 'Chase',
      '545454': 'Citi',
      '511234': 'Wells Fargo',
      '511111': 'Barclays UK',
      '402400': 'US Bank',
      '542418': 'TD Bank Canada',
      '400018': 'Bank of America',
      '511234': 'HSBC UK',
      '400023': 'Discover',
      '547300': 'Santander Spain',
      '400000': 'Ally Financial',
      '510000': 'Santander UK',
      '400001': 'BNP Paribas France',
      '530000': 'ING Group Netherlands',
      '400002': 'Deutsche Bank Germany',
      '540000': 'Commerzbank Germany',
      '400003': 'UniCredit Italy',
      '550000': 'BBVA Spain',
      '400004': 'CaixaBank Spain',
      '560000': 'Crédit Agricole France',
      '400006': 'Société Générale France',
      '570000': 'AXA Banque France',
      '400007': 'Banco do Brasil',
      '580000': 'Itaú Unibanco Brazil',
      '400008': 'Bradesco Brazil',
      '590000': 'Santander Mexico',
      '400010': 'Banamex Mexico',
      '500000': 'Mitsubishi UFJ Japan',
      '400011': 'Sumitomo Mitsui Japan',
      '510001': 'Mizuho Bank Japan',
      '400012': 'SMBC Card Japan',
      '520001': 'China Construction Bank',
      '400013': 'Industrial and Commercial Bank of China',
      '530001': 'Agricultural Bank of China',
      '400014': 'Bank of China',
      '540001': 'HSBC Hong Kong',
      '400015': 'Standard Chartered Hong Kong',
      '550001': 'Bank of East Asia Hong Kong',
      '400016': 'OCBC Singapore',
      '560001': 'DBS Bank Singapore',
      '400017': 'UOB Singapore',
      '570001': 'Commonwealth Bank Australia',
      '400019': 'Westpac Australia',
      '547419': 'Chase',
      '542842': 'Citi',
      '512345': 'Barclays UK',
      '543210': 'HSBC UK',
      '510510': 'American Express',
      '540540': 'Discover',
      '511234': 'Capital One',
      '543210': 'Wells Fargo',
      '510010': 'Bank of America',
      '520002': 'US Bank',
      '547301': 'TD Bank Canada',

      // Добавь новые BIN-ы
      '478200': 'Bank of America',
      '478201': 'Chase',
      '478202': 'Citi',
      '478203': 'Wells Fargo',
      '478204': 'US Bank',
      '478205': 'TD Bank Canada',
      '478206': 'Barclays UK',
      '478207': 'HSBC UK',
      '478208': 'Discover',
      '478209': 'Santander Spain',
      '478210': 'Ally Financial',
      '478211': 'Santander UK',
      '478212': 'BNP Paribas France',
      '478213': 'ING Group Netherlands',
      '478214': 'Deutsche Bank Germany',
      '478215': 'Commerzbank Germany',
      '478216': 'UniCredit Italy',
      '478217': 'BBVA Spain',
      '478218': 'CaixaBank Spain',
      '478219': 'Crédit Agricole France',
      '478220': 'Société Générale France',
      '478221': 'AXA Banque France',
      '478222': 'Banco do Brasil',
      '478223': 'Itaú Unibanco Brazil',
      '478224': 'Bradesco Brazil',
      '478225': 'Santander Mexico',
      '478226': 'Banamex Mexico',
      '478227': 'Mitsubishi UFJ Japan',
      '478228': 'Sumitomo Mitsui Japan',
      '478229': 'Mizuho Bank Japan',
      '478230': 'SMBC Card Japan',
      '478231': 'China Construction Bank',
      '478232': 'Industrial and Commercial Bank of China',
      '478233': 'Agricultural Bank of China',
      '478234': 'Bank of China',
      '478235': 'HSBC Hong Kong',
      '478236': 'Standard Chartered Hong Kong',
      '478237': 'Bank of East Asia Hong Kong',
      '478238': 'OCBC Singapore',
      '478239': 'DBS Bank Singapore',
      '478240': 'UOB Singapore',
      '478241': 'Commonwealth Bank Australia',
      '478242': 'Westpac Australia',
      '478243': 'ANZ Australia',
      '478244': 'National Australia Bank',
      '478245': 'Royal Bank of Scotland',
      '478246': 'Lloyds Bank UK',
      '478247': 'NatWest UK',
      '478248': 'Santander UK',
      '478249': 'TSB Bank UK',
      '478250': 'Monzo UK',
      '478251': 'Starling Bank UK',
      '478252': 'Revolut UK',
      '478253': 'N26 Germany',
      '478254': 'Wirecard Germany',
      '478255': 'Solarisbank Germany',
      '478256': 'Comdirect Germany',
      '478257': 'Postbank Germany',
      '478258': 'Sparkasse Germany',
      '478259': 'Volksbank Germany',
      '478260': 'DKB Germany',
      '478261': 'ING Germany',
      '478262': 'Targobank Germany',
      '478263': 'Santander Consumer Bank Germany',
      '478264': 'BMW Bank Germany',
      '478265': 'Mercedes-Benz Bank Germany',
      '478266': 'Volkswagen Bank Germany',
      '478267': 'Opel Bank Germany',
      '478268': 'Renault Bank Germany',
      '478269': 'Peugeot Bank Germany',
      '478270': 'Citroën Bank Germany',
      '478271': 'Fiat Bank Germany',
      '478272': 'Alfa Romeo Bank Germany',
      '478273': 'Lancia Bank Germany',
      '478274': 'Maserati Bank Germany',
      '478275': 'Ferrari Bank Germany',
      '478276': 'Lamborghini Bank Germany',
      '478277': 'Porsche Bank Germany',
      '478278': 'Audi Bank Germany',
      '478279': 'BMW Bank Germany',
      '478280': 'Mercedes-Benz Bank Germany',
      '478281': 'Volkswagen Bank Germany',
      '478282': 'American Express Test',
      '478283': 'Chase',
      '478284': 'Citi',
      '478285': 'Wells Fargo',
      '478286': 'US Bank',
      '478287': 'TD Bank Canada',
      '478288': 'Barclays UK',
      '478289': 'HSBC UK',
      '478290': 'Discover',
      '478291': 'Santander Spain',
      '478292': 'Ally Financial',
      '478293': 'Santander UK',
      '478294': 'BNP Paribas France',
      '478295': 'ING Group Netherlands',
      '478296': 'Deutsche Bank Germany',
      '478297': 'Commerzbank Germany',
      '478298': 'UniCredit Italy',
      '478299': 'BBVA Spain',
    };
    return banks[bin] || 'Неизвестный';
  }

  function getCountryByBin(bin) {
    // Только международные страны (без России)
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
      '400000': 'USA',
      '510000': 'UK',
      '400001': 'France',
      '530000': 'Netherlands',
      '400002': 'Germany',
      '540000': 'Germany',
      '400003': 'Italy',
      '550000': 'Spain',
      '400004': 'Spain',
      '560000': 'France',
      '400006': 'France',
      '570000': 'France',
      '400007': 'Brazil',
      '580000': 'Brazil',
      '400008': 'Brazil',
      '590000': 'Mexico',
      '400010': 'Mexico',
      '500000': 'Japan',
      '400011': 'Japan',
      '510001': 'Japan',
      '400012': 'Japan',
      '520001': 'China',
      '400013': 'China',
      '530001': 'China',
      '400014': 'China',
      '540001': 'Hong Kong',
      '400015': 'Hong Kong',
      '550001': 'Hong Kong',
      '400016': 'Singapore',
      '560001': 'Singapore',
      '400017': 'Singapore',
      '570001': 'Australia',
      '400019': 'Australia',
      '547419': 'USA',
      '542842': 'USA',
      '512345': 'UK',
      '543210': 'UK',
      '510510': 'USA',
      '540540': 'USA',
      '511234': 'USA',
      '543210': 'UK',
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
}
