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

const TEXT_CONTENT = {
    titles: {
        app: 'TumLinks - Acelerador de URLs Profesional',
        free: 'TumLinks - Plan Básico',
        premium: 'TumLinks - Plan Premium',
        modal: 'Selecciona tu Plan TumLinks',
        premiumModal: 'Activación Plan Premium'
    },
    messages: {
        welcome: 'Bienvenido a TumLinks',
        accessGranted: 'Acceso concedido correctamente',
        captchaFailed: 'Código de verificación incorrecto',
        linkCreated: 'Enlace acelerado creado exitosamente',
        linkCopied: 'Enlace copiado al portapapeles',
        linkDeleted: 'Enlace eliminado correctamente',
        premiumActivated: '¡Plan Premium activado con éxito!',
        dailyLimitReached: 'Límite diario alcanzado. Actualiza para enlaces ilimitados',
        invalidUrl: 'Por favor, introduce una URL válida',
        invalidPhone: 'Número no autorizado para Plan Premium',
        processing: 'Procesando solicitud...',
        optimizing: 'Optimizando enlace...',
        verificationSuccess: 'Verificación de seguridad completada',
        qrGenerated: 'Código QR premium generado',
        downloadReady: 'Archivo listo para descargar'
    },
    labels: {
        urlInput: 'URL para acelerar',
        customAlias: 'Alias personalizado',
        generateQR: 'Generar código QR avanzado',
        phoneInput: 'Número de teléfono autorizado',
        captchaInput: 'Código de verificación de seguridad'
    },
    buttons: {
        continue: 'Continuar',
        refresh: 'Regenerar Código',
        verify: 'Verificar y Continuar',
        shorten: 'Acelerar URL',
        shortenPremium: 'Acelerar URL Premium',
        copy: 'Copiar',
        cancel: 'Volver',
        activate: 'Activar Premium',
        upgrade: 'Actualizar a Premium',
        delete: 'Eliminar',
        download: 'Descargar QR',
        share: 'Compartir',
        switchMode: 'Cambiar Plan'
    },
    badges: {
        free: 'PLAN BÁSICO',
        premium: 'PLAN PREMIUM',
        active: 'ACTIVA'
    },
    features: {
        unlimited: 'Enlaces ilimitados',
        qrCodes: 'Códigos QR avanzados',
        customization: 'Personalización completa',
        analytics: 'Analytics en tiempo real',
        priority: 'Soporte prioritario 24/7',
        speed: 'Máxima velocidad',
        security: 'Seguridad avanzada'
    }
};

class TumLinksApp {
    constructor() {
        this.initializeApp();
    }

    initializeApp() {
        document.addEventListener('DOMContentLoaded', () => {
            this.cacheElements();
            this.loadUserData();
            this.generateCaptcha();
            this.setupEventListeners();
            this.showModeModal();
        });
    }

    cacheElements() {
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
        elements.progressFill = document.getElementById('progressFill');
        elements.upgradeToPremium = document.getElementById('upgradeToPremium');
        elements.switchModeFree = document.getElementById('switchModeFree');
        
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
        elements.downloadQR = document.getElementById('downloadQR');
        elements.shareQR = document.getElementById('shareQR');
        elements.totalLinks = document.getElementById('totalLinks');
        elements.totalClicks = document.getElementById('totalClicks');
        elements.switchModePremium = document.getElementById('switchModePremium');
        
        elements.phoneInput = document.getElementById('phoneInput');
        elements.cancelPremium = document.getElementById('cancelPremium');
        elements.activatePremium = document.getElementById('activatePremium');
        
        elements.toast = document.getElementById('toast');
        elements.ariaLive = document.getElementById('ariaLive');
    }

    loadUserData() {
        analyticsData = JSON.parse(localStorage.getItem('tumlinksAnalytics') || '{}');
        userPhone = localStorage.getItem('tumlinks_phone') || '';
        dailyLinks = JSON.parse(localStorage.getItem('tumlinks_daily_links') || '{"count": 0, "date": ""}');
        
        const links = JSON.parse(localStorage.getItem('tumlinks') || '[]');
        analyticsData.totalLinks = links.length;
        analyticsData.totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);
    }

    setupEventListeners() {
        elements.freeModeSelect.addEventListener('click', () => this.selectMode('free'));
        elements.premiumModeSelect.addEventListener('click', () => this.selectMode('premium'));
        elements.refreshCaptcha.addEventListener('click', () => this.generateCaptcha());
        elements.verifyCaptcha.addEventListener('click', () => this.verifyCaptchaHandler());
        elements.captchaInput.addEventListener('keypress', (e) => this.captchaKeypressHandler(e));
        
        elements.shortenFormFree.addEventListener('submit', (e) => this.shortenFormHandler(e, 'free'));
        elements.shortenFormPremium.addEventListener('submit', (e) => this.shortenFormHandler(e, 'premium'));
        
        elements.copyBtnFree.addEventListener('click', () => this.copyButtonHandler('free'));
        elements.copyBtnPremium.addEventListener('click', () => this.copyButtonHandler('premium'));
        
        elements.upgradeToPremium.addEventListener('click', () => this.showPremiumModal());
        elements.switchModeFree.addEventListener('click', () => this.showModeModal());
        elements.switchModePremium.addEventListener('click', () => this.showModeModal());
        
        elements.cancelPremium.addEventListener('click', () => this.cancelPremiumHandler());
        elements.activatePremium.addEventListener('click', () => this.activatePremiumHandler());
        
        elements.downloadQR.addEventListener('click', () => this.downloadQRCode());
        elements.shareQR.addEventListener('click', () => this.shareQRCode());
        
        document.addEventListener('visibilitychange', () => this.visibilityChangeHandler());
    }

    showModeModal() {
        this.hideAllContainers();
        elements.modeModal.style.display = 'flex';
        elements.captchaSection.style.display = 'none';
        
        if (userPhone && this.isPremiumNumber(userPhone)) {
            elements.premiumModeSelect.classList.add('active');
            elements.freeModeSelect.classList.remove('active');
        } else {
            elements.freeModeSelect.classList.add('active');
            elements.premiumModeSelect.classList.remove('active');
        }
        
        this.updateDocumentTitle(TEXT_CONTENT.titles.modal);
    }

    hideAllContainers() {
        elements.modeModal.style.display = 'none';
        elements.premiumModal.style.display = 'none';
        elements.freeContainer.style.display = 'none';
        elements.premiumContainer.style.display = 'none';
    }

    selectMode(mode) {
        elements.freeModeSelect.classList.toggle('active', mode === 'free');
        elements.premiumModeSelect.classList.toggle('active', mode === 'premium');
        elements.captchaSection.style.display = 'block';
        elements.captchaInput.focus();
        currentMode = mode;
    }

    generateCaptcha() {
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

    verifyCaptchaHandler() {
        if (elements.captchaInput.value.toUpperCase() === currentCaptcha) {
            this.hideAllContainers();
            
            if (currentMode === 'free') {
                this.showFreeInterface();
            } else if (currentMode === 'premium') {
                if (userPhone && this.isPremiumNumber(userPhone)) {
                    this.showPremiumInterface();
                } else {
                    this.showPremiumModal();
                }
            }
            
            this.trackAnalytics('access_granted');
            this.showToast(TEXT_CONTENT.messages.verificationSuccess, 'success');
            this.announceToScreenReader(TEXT_CONTENT.messages.accessGranted);
        } else {
            elements.captchaError.style.display = 'flex';
            elements.captchaError.setAttribute('role', 'alert');
            this.generateCaptcha();
            this.trackAnalytics('captcha_failed');
            this.announceToScreenReader(TEXT_CONTENT.messages.captchaFailed);
        }
    }

    captchaKeypressHandler(e) {
        if (e.key === 'Enter') {
            this.verifyCaptchaHandler();
        }
    }

    showFreeInterface() {
        this.updateDocumentTitle(TEXT_CONTENT.titles.free);
        elements.freeContainer.style.display = 'block';
        this.checkDailyLimit();
        this.updateDailyCounter();
        this.announceToScreenReader(TEXT_CONTENT.messages.welcome + ' - Plan Básico');
    }

    showPremiumInterface() {
        this.updateDocumentTitle(TEXT_CONTENT.titles.premium);
        elements.premiumContainer.style.display = 'block';
        this.loadSavedLinks();
        this.updateAnalyticsSummary();
        this.announceToScreenReader(TEXT_CONTENT.messages.welcome + ' - Plan Premium');
    }

    isPremiumNumber(phone) {
        return ALLOWED_PREMIUM_NUMBERS.includes(phone);
    }

    showPremiumModal() {
        elements.premiumModal.style.display = 'flex';
        elements.phoneInput.focus();
        this.updateDocumentTitle(TEXT_CONTENT.titles.premiumModal);
    }

    cancelPremiumHandler() {
        elements.premiumModal.style.display = 'none';
        this.showModeModal();
    }

    activatePremiumHandler() {
        const phone = elements.phoneInput.value.trim();
        
        if (!phone) {
            this.showToast('Por favor, ingresa tu número de teléfono', 'error');
            return;
        }
        
        if (!this.isPremiumNumber(phone)) {
            this.showToast(TEXT_CONTENT.messages.invalidPhone, 'error');
            this.announceToScreenReader(TEXT_CONTENT.messages.invalidPhone);
            return;
        }
        
        userPhone = phone;
        localStorage.setItem('tumlinks_phone', phone);
        elements.premiumModal.style.display = 'none';
        this.showPremiumInterface();
        this.showToast(TEXT_CONTENT.messages.premiumActivated, 'premium');
        this.trackAnalytics('premium_activated');
        this.announceToScreenReader(TEXT_CONTENT.messages.premiumActivated);
    }

    shortenFormHandler(e, mode) {
        e.preventDefault();
        
        if (mode === 'free' && !this.canCreateLink()) {
            this.showToast(TEXT_CONTENT.messages.dailyLimitReached, 'error');
            this.announceToScreenReader(TEXT_CONTENT.messages.dailyLimitReached);
            return;
        }
        
        const urlInput = mode === 'free' ? elements.urlInputFree : elements.urlInputPremium;
        
        if (!this.isValidUrl(urlInput.value)) {
            this.showToast(TEXT_CONTENT.messages.invalidUrl, 'error');
            this.announceToScreenReader(TEXT_CONTENT.messages.invalidUrl);
            return;
        }
        
        this.showLoadingState(mode, true);
        
        const urlToShorten = urlInput.value;
        const alias = mode === 'premium' ? (elements.customAliasPremium.value || this.generateShortCode()) : this.generateShortCode();
        const apiKey = mode === 'premium' ? PREMIUM_API_KEY : FREE_API_KEY;
        const generateQR = mode === 'premium' && elements.generateQR.checked;
        
        setTimeout(() => {
            const shortCode = alias;
            const shortenedUrl = `https://tum.link/${shortCode}`;
            
            this.showResult(mode, shortenedUrl, generateQR);
            this.saveLink(urlToShorten, shortenedUrl, shortCode, apiKey, mode);
            
            if (mode === 'free') {
                this.incrementDailyCount();
            }
            
            this.trackAnalytics('links_created');
            this.showToast(TEXT_CONTENT.messages.linkCreated, 'success');
            this.announceToScreenReader(TEXT_CONTENT.messages.linkCreated + ': ' + shortenedUrl);
            
            this.resetForm(mode);
        }, 1500);
    }

    showLoadingState(mode, show) {
        const loading = mode === 'free' ? elements.loadingFree : elements.loadingPremium;
        const submitBtn = mode === 'free' ? elements.submitBtnFree : elements.submitBtnPremium;
        
        if (show) {
            loading.style.display = 'block';
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        } else {
            loading.style.display = 'none';
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    showResult(mode, shortenedUrl, generateQR = false) {
        this.showLoadingState(mode, false);
        
        const resultContainer = mode === 'free' ? elements.resultContainerFree : elements.resultContainerPremium;
        const shortUrl = mode === 'free' ? elements.shortUrlFree : elements.shortUrlPremium;
        
        shortUrl.value = shortenedUrl;
        resultContainer.style.display = 'block';
        
        if (generateQR && mode === 'premium') {
            this.generateQRCode(shortenedUrl);
            elements.qrContainer.style.display = 'block';
        } else if (mode === 'premium') {
            elements.qrContainer.style.display = 'none';
        }
        
        shortUrl.focus();
    }

    resetForm(mode) {
        const urlInput = mode === 'free' ? elements.urlInputFree : elements.urlInputPremium;
        urlInput.value = '';
        
        if (mode === 'premium') {
            elements.customAliasPremium.value = '';
            elements.generateQR.checked = false;
        }
    }

    copyButtonHandler(mode) {
        const shortUrl = mode === 'free' ? elements.shortUrlFree : elements.shortUrlPremium;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shortUrl.value).then(() => {
                this.showToast(TEXT_CONTENT.messages.linkCopied);
                this.trackAnalytics('copies');
                this.announceToScreenReader(TEXT_CONTENT.messages.linkCopied);
            }).catch(() => {
                this.fallbackCopyText(shortUrl.value);
            });
        } else {
            this.fallbackCopyText(shortUrl.value);
        }
    }

    checkDailyLimit() {
        const today = new Date().toDateString();
        if (dailyLinks.date !== today) {
            dailyLinks = { count: 0, date: today };
            localStorage.setItem('tumlinks_daily_links', JSON.stringify(dailyLinks));
        }
    }

    updateDailyCounter() {
        elements.linksTodaySpan.textContent = dailyLinks.count;
        const progress = (dailyLinks.count / 5) * 100;
        elements.progressFill.style.width = `${progress}%`;
    }

    canCreateLink() {
        return dailyLinks.count < 5;
    }

    incrementDailyCount() {
        dailyLinks.count++;
        localStorage.setItem('tumlinks_daily_links', JSON.stringify(dailyLinks));
        this.updateDailyCounter();
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    generateShortCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    generateQRCode(url) {
        const canvas = elements.qrCanvas;
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(0.5, '#8b5cf6');
        gradient.addColorStop(1, '#ec4899');
        
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = gradient;
        const size = 8;
        const padding = 30;
        
        for (let i = 0; i < 11; i++) {
            for (let j = 0; j < 11; j++) {
                if ((i < 2 || i > 8 || j < 2 || j > 8) || 
                    (i === 3 && j === 3) || (i === 7 && j === 7)) {
                    ctx.fillRect(padding + i * size, padding + j * size, size, size);
                }
            }
        }
        
        ctx.fillStyle = '#8a94b0';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TumLinks Premium', canvas.width / 2, canvas.height - 10);
    }

    downloadQRCode() {
        const canvas = elements.qrCanvas;
        const link = document.createElement('a');
        link.download = 'tumlinks-qr-code.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        this.showToast(TEXT_CONTENT.messages.downloadReady, 'info');
    }

    shareQRCode() {
        if (navigator.share) {
            canvas.toBlob(blob => {
                const file = new File([blob], 'tumlinks-qr-code.png', { type: 'image/png' });
                navigator.share({
                    files: [file],
                    title: 'TumLinks QR Code',
                    text: 'Comparte este código QR generado con TumLinks'
                });
            });
        } else {
            this.copyButtonHandler('premium');
        }
    }

    saveLink(originalUrl, shortUrl, shortCode, apiKey, mode) {
        const links = JSON.parse(localStorage.getItem('tumlinks') || '[]');
        
        const newLink = {
            id: Date.now(),
            originalUrl: originalUrl,
            shortUrl: shortUrl,
            shortCode: shortCode,
            apiKey: apiKey,
            mode: mode,
            createdAt: new Date().toISOString(),
            clickCount: Math.floor(Math.random() * 50),
            lastAccessed: new Date().toISOString(),
            createdDate: new Date().toLocaleDateString('es-ES')
        };
        
        links.unshift(newLink);
        localStorage.setItem('tumlinks', JSON.stringify(links.slice(0, 20)));
        
        if (mode === 'premium') {
            this.loadSavedLinks();
            this.updateAnalyticsSummary();
        }
    }

    loadSavedLinks() {
        const links = JSON.parse(localStorage.getItem('tumlinks') || '[]');
        const premiumLinks = links.filter(link => link.mode === 'premium');
        
        if (premiumLinks.length === 0) {
            elements.emptyStatePremium.style.display = 'block';
            elements.linksListPremium.setAttribute('aria-label', 'No hay enlaces premium acelerados');
            return;
        }
        
        elements.emptyStatePremium.style.display = 'none';
        elements.linksListPremium.innerHTML = '';
        elements.linksListPremium.setAttribute('aria-label', `Lista de ${premiumLinks.length} enlaces premium acelerados`);
        
        const fragment = document.createDocumentFragment();
        
        premiumLinks.forEach(link => {
            const linkItem = this.createLinkElement(link);
            fragment.appendChild(linkItem);
        });
        
        elements.linksListPremium.appendChild(fragment);
    }

    createLinkElement(link) {
        const linkItem = document.createElement('div');
        linkItem.className = 'link-item';
        linkItem.setAttribute('role', 'listitem');
        
        linkItem.innerHTML = `
            <div class="original-url" title="${link.originalUrl}">${link.originalUrl}</div>
            <div class="short-url" title="${link.shortUrl}">${link.shortUrl}</div>
            <div class="link-stats-compact">
                <i class="fas fa-chart-bar"></i>
                ${link.clickCount} clics
            </div>
            <div class="link-actions">
                <button class="action-btn copy-link" title="${TEXT_CONTENT.buttons.copy}" aria-label="${TEXT_CONTENT.buttons.copy} enlace: ${link.shortUrl}">
                    <i class="fas fa-copy"></i>
                    Copiar
                </button>
                <button class="action-btn delete-link" title="${TEXT_CONTENT.buttons.delete}" aria-label="${TEXT_CONTENT.buttons.delete} enlace: ${link.originalUrl}">
                    <i class="fas fa-trash"></i>
                    Eliminar
                </button>
            </div>
        `;
        
        linkItem.querySelector('.copy-link').addEventListener('click', () => {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(link.shortUrl).then(() => {
                    this.showToast(TEXT_CONTENT.messages.linkCopied);
                    this.trackAnalytics('copies');
                    this.announceToScreenReader(TEXT_CONTENT.messages.linkCopied);
                });
            } else {
                this.fallbackCopyText(link.shortUrl);
            }
        });
        
        linkItem.querySelector('.delete-link').addEventListener('click', () => {
            if (confirm(`¿Estás seguro de que quieres eliminar el enlace ${link.shortUrl}?`)) {
                this.deleteLink(link.id);
                this.trackAnalytics('links_deleted');
                this.showToast(TEXT_CONTENT.messages.linkDeleted, 'info');
                this.announceToScreenReader(TEXT_CONTENT.messages.linkDeleted);
            }
        });
        
        return linkItem;
    }

    deleteLink(id) {
        const links = JSON.parse(localStorage.getItem('tumlinks') || '[]');
        const updatedLinks = links.filter(link => link.id !== id);
        localStorage.setItem('tumlinks', JSON.stringify(updatedLinks));
        this.loadSavedLinks();
        this.updateAnalyticsSummary();
    }

    updateAnalyticsSummary() {
        const links = JSON.parse(localStorage.getItem('tumlinks') || '[]');
        const premiumLinks = links.filter(link => link.mode === 'premium');
        const totalClicks = premiumLinks.reduce((sum, link) => sum + link.clickCount, 0);
        
        elements.totalLinks.textContent = `${premiumLinks.length} enlaces`;
        elements.totalClicks.textContent = `${totalClicks} clics`;
    }

    fallbackCopyText(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showToast(TEXT_CONTENT.messages.linkCopied);
            this.trackAnalytics('copies');
            this.announceToScreenReader(TEXT_CONTENT.messages.linkCopied);
        } catch (err) {
            this.showToast('Error al copiar el enlace', 'error');
            this.announceToScreenReader('Error al copiar el enlace');
        }
        
        document.body.removeChild(textArea);
    }

    trackAnalytics(event) {
        if (!analyticsData[event]) analyticsData[event] = 0;
        analyticsData[event]++;
        analyticsData.lastUpdate = new Date().toISOString();
        localStorage.setItem('tumlinksAnalytics', JSON.stringify(analyticsData));
    }

    showToast(message, type = 'success') {
        elements.toast.textContent = message;
        elements.toast.className = `toast ${type}`;
        
        const typeConfig = {
            success: { background: 'var(--success-gradient)', icon: '✓' },
            error: { background: 'var(--accent-error)', icon: '!' },
            info: { background: 'var(--accent-info)', icon: 'i' },
            premium: { background: 'var(--premium-gradient)', icon: '👑' }
        };
        
        elements.toast.classList.add('show');
        
        setTimeout(() => {
            elements.toast.classList.remove('show');
        }, 4000);
    }

    announceToScreenReader(message) {
        elements.ariaLive.textContent = message;
        setTimeout(() => {
            elements.ariaLive.textContent = '';
        }, 1000);
    }

    updateDocumentTitle(title) {
        document.title = title;
    }

    visibilityChangeHandler() {
        if (!document.hidden && currentMode === 'premium') {
            setTimeout(() => this.autoUpdateClickCounts(), 15000);
        }
    }

    autoUpdateClickCounts() {
        if (!document.hidden && currentMode === 'premium') {
            const links = JSON.parse(localStorage.getItem('tumlinks') || '[]');
            let updated = false;
            
            links.forEach(link => {
                if (Math.random() > 0.7 && link.mode === 'premium') {
                    link.clickCount += Math.floor(Math.random() * 5);
                    link.lastAccessed = new Date().toISOString();
                    updated = true;
                }
            });
            
            if (updated) {
                localStorage.setItem('tumlinks', JSON.stringify(links));
                this.loadSavedLinks();
                this.updateAnalyticsSummary();
            }
        }
        
        setTimeout(() => this.autoUpdateClickCounts(), 20000);
    }
}

new TumLinksApp();

if (!document.hidden) {
    setTimeout(() => {
        const app = new TumLinksApp();
        if (currentMode === 'premium') {
            app.autoUpdateClickCounts();
        }
    }, 15000);
}