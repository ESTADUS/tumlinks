const ALLOWED_PREMIUM_NUMBERS = [
    '+53 50369270',
    '+34 601 234 567',
    '+34 602 345 678',
    '+34 603 456 789',
    '+34 604 567 890',
    '+34 605 678 901',
    '+34 606 789 012',
    '+34 607 890 123',
    '+34 608 901 234',
    '+34 609 012 345'
];

const FREE_API_KEY = 'spoo_L6nh37Wt';
const PREMIUM_API_KEY = 'spoo_3t57QDDs';

let currentMode = null;
let analyticsData = {};
let currentCaptcha = '';
let userPhone = '';
let dailyLinks = { count: 0, date: '' };

const elements = {};

document.addEventListener('DOMContentLoaded', function() {
    cacheElements();
    initializeApp();
});

function cacheElements() {
    elements.modeModal = document.getElementById('modeModal');
    elements.premiumModal = document.getElementById('premiumModal');
    elements.captchaSection = document.getElementById('captchaSection');
    elements.captchaText = document.getElementById('captchaText');
    elements.captchaInput = document.getElementById('captchaInput');
    elements.captchaError = document.getElementById('captchaError');
    elements.refreshCaptcha = document.getElementById('refreshCaptcha');
    elements.verifyCaptcha = document.getElementById('verifyCaptcha');
    elements.freeModeSelect = document.getElementById('freeModeSelect');
    elements.premiumModeSelect = document.getElementById('premiumModeSelect');
    elements.freeContainer = document.getElementById('freeContainer');
    elements.premiumContainer = document.getElementById('premiumContainer');
    elements.shortenFormFree = document.getElementById('shorten-form-free');
    elements.urlInputFree = document.getElementById('url-input-free');
    elements.submitBtnFree = document.getElementById('submitBtnFree');
    elements.loadingFree = document.getElementById('loadingFree');
    elements.resultContainerFree = document.getElementById('result-container-free');
    elements.shortUrlFree = document.getElementById('short-url-free');
    elements.copyBtnFree = document.getElementById('copy-btn-free');
    elements.limitCounter = document.getElementById('limitCounter');
    elements.linksTodaySpan = document.getElementById('linksToday');
    elements.upgradeToPremium = document.getElementById('upgradeToPremium');
    elements.shortenFormPremium = document.getElementById('shorten-form-premium');
    elements.urlInputPremium = document.getElementById('url-input-premium');
    elements.customAliasPremium = document.getElementById('custom-alias-premium');
    elements.submitBtnPremium = document.getElementById('submitBtnPremium');
    elements.loadingPremium = document.getElementById('loadingPremium');
    elements.resultContainerPremium = document.getElementById('result-container-premium');
    elements.shortUrlPremium = document.getElementById('short-url-premium');
    elements.copyBtnPremium = document.getElementById('copy-btn-premium');
    elements.linksListPremium = document.getElementById('links-list-premium');
    elements.emptyStatePremium = document.getElementById('empty-state-premium');
    elements.generateQR = document.getElementById('generateQR');
    elements.qrContainer = document.getElementById('qr-container');
    elements.qrCanvas = document.getElementById('qr-code');
    elements.phoneInput = document.getElementById('phoneInput');
    elements.cancelPremium = document.getElementById('cancelPremium');
    elements.activatePremium = document.getElementById('activatePremium');
    elements.toast = document.getElementById('toast');
    elements.ariaLive = document.getElementById('ariaLive');
}

function initializeApp() {
    loadUserData();
    generateCaptcha();
    setupEventListeners();
    
    if (userPhone && isPremiumNumber(userPhone)) {
        showModeModal();
    } else {
        showModeModal();
    }
}

function loadUserData() {
    analyticsData = JSON.parse(localStorage.getItem('tumlinksAnalytics') || '{}');
    userPhone = localStorage.getItem('tumlinks_phone') || '';
    dailyLinks = JSON.parse(localStorage.getItem('tumlinks_daily_links') || '{"count": 0, "date": ""}');
}

function setupEventListeners() {
    elements.freeModeSelect.addEventListener('click', () => selectMode('free'));
    elements.premiumModeSelect.addEventListener('click', () => selectMode('premium'));
    elements.refreshCaptcha.addEventListener('click', generateCaptcha);
    elements.verifyCaptcha.addEventListener('click', verifyCaptchaHandler);
    elements.captchaInput.addEventListener('keypress', captchaKeypressHandler);
    elements.shortenFormFree.addEventListener('submit', (e) => shortenFormHandler(e, 'free'));
    elements.shortenFormPremium.addEventListener('submit', (e) => shortenFormHandler(e, 'premium'));
    elements.copyBtnFree.addEventListener('click', () => copyButtonHandler('free'));
    elements.copyBtnPremium.addEventListener('click', () => copyButtonHandler('premium'));
    elements.upgradeToPremium.addEventListener('click', showPremiumModal);
    elements.cancelPremium.addEventListener('click', cancelPremiumHandler);
    elements.activatePremium.addEventListener('click', activatePremiumHandler);
    document.addEventListener('visibilitychange', visibilityChangeHandler);
}

function showModeModal() {
    elements.modeModal.style.display = 'flex';
    elements.captchaSection.style.display = 'none';
    
    if (userPhone && isPremiumNumber(userPhone)) {
        elements.premiumModeSelect.classList.add('active');
    } else {
        elements.freeModeSelect.classList.add('active');
    }
}

function selectMode(mode) {
    elements.freeModeSelect.classList.toggle('active', mode === 'free');
    elements.premiumModeSelect.classList.toggle('active', mode === 'premium');
    elements.captchaSection.style.display = 'block';
    elements.captchaInput.focus();
    currentMode = mode;
}

function generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    currentCaptcha = '';
    for (let i = 0; i < 6; i++) {
        currentCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    elements.captchaText.textContent = currentCaptcha;
    elements.captchaInput.value = '';
    elements.captchaError.style.display = 'none';
    elements.captchaInput.focus();
}

function verifyCaptchaHandler() {
    if (elements.captchaInput.value.toUpperCase() === currentCaptcha) {
        elements.modeModal.style.display = 'none';
        
        if (currentMode === 'free') {
            showFreeInterface();
        } else if (currentMode === 'premium') {
            if (userPhone && isPremiumNumber(userPhone)) {
                showPremiumInterface();
            } else {
                showPremiumModal();
            }
        }
        
        trackAnalytics('access_granted');
        announceToScreenReader('Verificación completada. Bienvenido a TumLinks');
    } else {
        elements.captchaError.style.display = 'block';
        elements.captchaError.setAttribute('role', 'alert');
        generateCaptcha();
        trackAnalytics('captcha_failed');
        announceToScreenReader('Código incorrecto. Por favor, intente nuevamente.');
    }
}

function captchaKeypressHandler(e) {
    if (e.key === 'Enter') {
        verifyCaptchaHandler();
    }
}

function showFreeInterface() {
    elements.freeContainer.style.display = 'block';
    checkDailyLimit();
    updateDailyCounter();
    announceToScreenReader('Interfaz de modo gratuito cargada');
}

function showPremiumInterface() {
    elements.premiumContainer.style.display = 'block';
    loadSavedLinks();
    announceToScreenReader('Interfaz de modo premium cargada');
}

function isPremiumNumber(phone) {
    return ALLOWED_PREMIUM_NUMBERS.includes(phone);
}

function showPremiumModal() {
    elements.premiumModal.style.display = 'flex';
    elements.phoneInput.focus();
}

function cancelPremiumHandler() {
    elements.premiumModal.style.display = 'none';
    showModeModal();
}

function activatePremiumHandler() {
    const phone = elements.phoneInput.value.trim();
    
    if (!phone) {
        showToast('Por favor, ingresa tu número de teléfono', 'error');
        return;
    }
    
    if (!isPremiumNumber(phone)) {
        showToast('Número no autorizado para modo Premium', 'error');
        announceToScreenReader('Número telefónico no autorizado para modo Premium');
        return;
    }
    
    userPhone = phone;
    localStorage.setItem('tumlinks_phone', phone);
    elements.premiumModal.style.display = 'none';
    showPremiumInterface();
    showToast('¡Modo Premium activado!', 'success');
    trackAnalytics('premium_activated');
    announceToScreenReader('Modo Premium activado exitosamente');
}

function shortenFormHandler(e, mode) {
    e.preventDefault();
    
    if (mode === 'free' && !canCreateLink()) {
        showToast('Límite diario alcanzado. Actualiza a Premium para enlaces ilimitados', 'error');
        announceToScreenReader('Límite diario alcanzado. Considera actualizar al modo Premium');
        return;
    }
    
    const urlInput = mode === 'free' ? elements.urlInputFree : elements.urlInputPremium;
    
    if (!isValidUrl(urlInput.value)) {
        showToast('Por favor, introduce una URL válida', 'error');
        announceToScreenReader('Error: Por favor, introduce una URL válida');
        return;
    }
    
    const loading = mode === 'free' ? elements.loadingFree : elements.loadingPremium;
    const resultContainer = mode === 'free' ? elements.resultContainerFree : elements.resultContainerPremium;
    
    loading.style.display = 'block';
    resultContainer.style.display = 'none';
    
    const urlToShorten = urlInput.value;
    const alias = mode === 'premium' ? (elements.customAliasPremium.value || generateShortCode()) : generateShortCode();
    const apiKey = mode === 'premium' ? PREMIUM_API_KEY : FREE_API_KEY;
    const generateQR = mode === 'premium' && elements.generateQR.checked;
    
    setTimeout(() => {
        const shortCode = alias;
        const shortenedUrl = `https://tum.link/${shortCode}`;
        
        const shortUrl = mode === 'free' ? elements.shortUrlFree : elements.shortUrlPremium;
        shortUrl.value = shortenedUrl;
        
        loading.style.display = 'none';
        resultContainer.style.display = 'block';
        
        if (generateQR && mode === 'premium') {
            generateQRCode(shortenedUrl);
            elements.qrContainer.style.display = 'block';
        } else if (mode === 'premium') {
            elements.qrContainer.style.display = 'none';
        }
        
        saveLink(urlToShorten, shortenedUrl, shortCode, apiKey, mode);
        
        if (mode === 'free') {
            incrementDailyCount();
        }
        
        trackAnalytics('links_created');
        announceToScreenReader(`URL acelerada creada: ${shortenedUrl}`);
        
        urlInput.value = '';
        if (mode === 'premium') {
            elements.customAliasPremium.value = '';
            elements.generateQR.checked = false;
        }
        
        shortUrl.focus();
    }, 800);
}

function copyButtonHandler(mode) {
    const shortUrl = mode === 'free' ? elements.shortUrlFree : elements.shortUrlPremium;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shortUrl.value).then(() => {
            showToast('Enlace copiado al portapapeles');
            trackAnalytics('copies');
            announceToScreenReader('Enlace copiado al portapapeles');
        }).catch(() => {
            fallbackCopyText(shortUrl.value);
        });
    } else {
        fallbackCopyText(shortUrl.value);
    }
}

function checkDailyLimit() {
    const today = new Date().toDateString();
    if (dailyLinks.date !== today) {
        dailyLinks = { count: 0, date: today };
        localStorage.setItem('tumlinks_daily_links', JSON.stringify(dailyLinks));
    }
}

function updateDailyCounter() {
    elements.linksTodaySpan.textContent = dailyLinks.count;
}

function canCreateLink() {
    return dailyLinks.count < 5;
}

function incrementDailyCount() {
    dailyLinks.count++;
    localStorage.setItem('tumlinks_daily_links', JSON.stringify(dailyLinks));
    updateDailyCounter();
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function generateShortCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function generateQRCode(url) {
    const canvas = elements.qrCanvas;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#f8fafc';
    const size = 10;
    const padding = 20;
    
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            if ((i === 0 || i === 6 || j === 0 || j === 6) || 
                (i === 2 && j === 2) || (i === 4 && j === 4)) {
                ctx.fillRect(padding + i * size, padding + j * size, size, size);
            }
        }
    }
    
    ctx.fillStyle = '#64748b';
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('QR Code', canvas.width / 2, canvas.height - 5);
}

function saveLink(originalUrl, shortUrl, shortCode, apiKey, mode) {
    const links = JSON.parse(localStorage.getItem('tumlinks') || '[]');
    
    const newLink = {
        id: Date.now(),
        originalUrl: originalUrl,
        shortUrl: shortUrl,
        shortCode: shortCode,
        apiKey: apiKey,
        mode: mode,
        createdAt: new Date().toISOString(),
        clickCount: Math.floor(Math.random() * 50)
    };
    
    links.unshift(newLink);
    localStorage.setItem('tumlinks', JSON.stringify(links.slice(0, 15)));
    
    if (mode === 'premium') {
        loadSavedLinks();
    }
}

function loadSavedLinks() {
    const links = JSON.parse(localStorage.getItem('tumlinks') || '[]');
    const premiumLinks = links.filter(link => link.mode === 'premium');
    
    if (premiumLinks.length === 0) {
        elements.emptyStatePremium.style.display = 'block';
        elements.linksListPremium.setAttribute('aria-label', 'Lista vacía de enlaces acelerados');
        return;
    }
    
    elements.emptyStatePremium.style.display = 'none';
    elements.linksListPremium.innerHTML = '';
    elements.linksListPremium.setAttribute('aria-label', `Lista de ${premiumLinks.length} enlaces acelerados`);
    
    const fragment = document.createDocumentFragment();
    
    premiumLinks.forEach(link => {
        const linkItem = createLinkElement(link);
        fragment.appendChild(linkItem);
    });
    
    elements.linksListPremium.appendChild(fragment);
}

function createLinkElement(link) {
    const linkItem = document.createElement('div');
    linkItem.className = 'link-item';
    linkItem.setAttribute('role', 'listitem');
    
    const linkInfo = document.createElement('div');
    linkInfo.className = 'link-info';
    
    const originalUrl = document.createElement('div');
    originalUrl.className = 'original-url';
    originalUrl.textContent = link.originalUrl;
    originalUrl.title = link.originalUrl;
    
    const shortUrl = document.createElement('div');
    shortUrl.className = 'short-url';
    shortUrl.textContent = link.shortUrl;
    shortUrl.title = link.shortUrl;
    
    linkInfo.appendChild(originalUrl);
    linkInfo.appendChild(shortUrl);
    
    const linkActions = document.createElement('div');
    linkActions.className = 'link-actions';
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'action-btn';
    copyBtn.innerHTML = '<i class="fas fa-copy" aria-hidden="true"></i>';
    copyBtn.title = 'Copiar enlace';
    copyBtn.setAttribute('aria-label', `Copiar enlace: ${link.shortUrl}`);
    copyBtn.addEventListener('click', () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(link.shortUrl).then(() => {
                showToast('Enlace copiado');
                trackAnalytics('copies');
                announceToScreenReader('Enlace copiado al portapapeles');
            });
        } else {
            fallbackCopyText(link.shortUrl);
        }
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash" aria-hidden="true"></i>';
    deleteBtn.title = 'Eliminar enlace';
    deleteBtn.setAttribute('aria-label', `Eliminar enlace: ${link.originalUrl}`);
    deleteBtn.addEventListener('click', () => {
        if (confirm(`¿Estás seguro de que quieres eliminar el enlace ${link.shortUrl}?`)) {
            deleteLink(link.id);
            trackAnalytics('links_deleted');
            announceToScreenReader('Enlace eliminado');
        }
    });
    
    const statsBtn = document.createElement('button');
    statsBtn.className = 'action-btn';
    statsBtn.innerHTML = `<i class="fas fa-chart-bar" aria-hidden="true"></i> ${link.clickCount}`;
    statsBtn.title = `${link.clickCount} clics`;
    statsBtn.setAttribute('aria-label', `${link.clickCount} clics en este enlace`);
    
    linkActions.appendChild(copyBtn);
    linkActions.appendChild(statsBtn);
    linkActions.appendChild(deleteBtn);
    
    linkItem.appendChild(linkInfo);
    linkItem.appendChild(linkActions);
    
    return linkItem;
}

function deleteLink(id) {
    const links = JSON.parse(localStorage.getItem('tumlinks') || '[]');
    const updatedLinks = links.filter(link => link.id !== id);
    localStorage.setItem('tumlinks', JSON.stringify(updatedLinks));
    loadSavedLinks();
}

function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('Enlace copiado al portapapeles');
        trackAnalytics('copies');
        announceToScreenReader('Enlace copiado al portapapeles');
    } catch (err) {
        showToast('Error al copiar el enlace', 'error');
        announceToScreenReader('Error al copiar el enlace');
    }
    
    document.body.removeChild(textArea);
}

function trackAnalytics(event) {
    if (!analyticsData[event]) analyticsData[event] = 0;
    analyticsData[event]++;
    analyticsData.lastUpdate = new Date().toISOString();
    localStorage.setItem('tumlinksAnalytics', JSON.stringify(analyticsData));
}

function showToast(message, type = 'success') {
    elements.toast.textContent = message;
    elements.toast.style.background = type === 'error' ? '#ef4444' : 
                                   type === 'info' ? '#6366f1' : 
                                   type === 'premium' ? '#f59e0b' : '#10b981';
    elements.toast.classList.add('show');
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

function announceToScreenReader(message) {
    elements.ariaLive.textContent = message;
    setTimeout(() => {
        elements.ariaLive.textContent = '';
    }, 1000);
}

function visibilityChangeHandler() {
    if (!document.hidden && currentMode === 'premium') {
        setTimeout(autoUpdateClickCounts, 15000);
    }
}

function autoUpdateClickCounts() {
    if (!document.hidden && currentMode === 'premium') {
        const links = JSON.parse(localStorage.getItem('tumlinks') || '[]');
        let updated = false;
        
        links.forEach(link => {
            if (Math.random() > 0.7) {
                link.clickCount += Math.floor(Math.random() * 3);
                updated = true;
            }
        });
        
        if (updated) {
            localStorage.setItem('tumlinks', JSON.stringify(links));
            loadSavedLinks();
        }
    }
    
    setTimeout(autoUpdateClickCounts, 15000);
}

if (!document.hidden && currentMode === 'premium') {
    setTimeout(autoUpdateClickCounts, 15000);
}