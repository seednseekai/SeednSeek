/**
 * 載入 header 和 footer 組件
 * 這個腳本會自動從 components/header.html 和 components/footer.html 載入內容
 */

async function loadHeader() {
    // 檢查是否已經存在 header，如果存在則跳過載入
    const existingHeader = document.querySelector('.site-header');
    if (existingHeader) {
        // Header 已經存在，只初始化功能
        initMobileMenu();
        initHomepageHeaderState();
        return;
    }
    
    try {
        const response = await fetch('components/header.html');
        if (!response.ok) throw new Error('Failed to load header');
        const html = await response.text();
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (headerPlaceholder) {
            headerPlaceholder.insertAdjacentHTML('afterend', html);
            headerPlaceholder.remove();
        } else {
            // 如果沒有 placeholder，嘗試插入到 body 開頭
            const pageShell = document.querySelector('.page-shell');
            if (pageShell) {
                pageShell.insertAdjacentHTML('afterbegin', html);
            }
        }
        // 初始化移動端選單
        initMobileMenu();
        // 初始化首頁透明導覽列
        initHomepageHeaderState();
    } catch (error) {
        // 如果載入失敗（例如header已經存在於HTML中），仍然初始化
        initMobileMenu();
        initHomepageHeaderState();
    }
}

async function loadFooter() {
    // 檢查是否已經存在 footer，如果存在則跳過載入
    const existingFooter = document.querySelector('.site-footer');
    if (existingFooter) {
        // Footer 已經存在，不需要載入
        return;
    }
    
    try {
        const response = await fetch('components/footer.html');
        if (!response.ok) throw new Error('Failed to load footer');
        const html = await response.text();
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            footerPlaceholder.insertAdjacentHTML('afterend', html);
            footerPlaceholder.remove();
        } else {
            // 如果沒有 placeholder，嘗試插入到 main 之後
            const main = document.querySelector('main');
            if (main) {
                main.insertAdjacentHTML('afterend', html);
            }
        }
    } catch (error) {
        console.error('Error loading footer:', error);
    }
}

function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    let menuBackdrop = document.querySelector('.menu-backdrop');
    
    // 檢查必要元素是否存在
    if (!menuToggle || !mobileNav) {
        console.warn('Menu elements not found', { 
            menuToggle: !!menuToggle, 
            mobileNav: !!mobileNav 
        });
        return;
    }
    
    // 如果背景覆蓋層不存在，創建它
    if (!menuBackdrop) {
        menuBackdrop = document.createElement('div');
        menuBackdrop.className = 'menu-backdrop';
        document.body.appendChild(menuBackdrop);
    }
    
    // 標記為已初始化，避免重複綁定
    if (menuToggle.dataset.initialized === 'true') {
        return; // 已經初始化過，直接返回
    }
    menuToggle.dataset.initialized = 'true';
    
    const toggleMenu = (isOpen) => {
        const wasOpen = mobileNav.classList.contains('active');
        
        if (isOpen === undefined) {
            isOpen = !wasOpen;
        }
        
        if (isOpen) {
            // 打開 menu
            menuBackdrop.classList.add('active');
            mobileNav.classList.add('active');
            menuToggle.classList.add('active');
            menuToggle.setAttribute('aria-expanded', 'true');
            // 防止背景滾動
            document.body.style.overflow = 'hidden';
        } else {
            // 關閉 menu
            menuBackdrop.classList.remove('active');
            mobileNav.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            // 恢復滾動
            document.body.style.overflow = '';
        }
    };
    
    // 點擊 menu toggle 按鈕
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleMenu();
    }, false);
    
    // 點擊背景覆蓋層關閉 menu
    menuBackdrop.addEventListener('click', () => {
        toggleMenu(false);
    }, false);
    
    // 點擊 menu 內的連結時關閉 menu
    const menuLinks = mobileNav.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggleMenu(false);
        }, false);
    });
    
    // ESC 鍵關閉 menu
    const escapeHandler = (e) => {
        if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
            toggleMenu(false);
        }
    };
    document.addEventListener('keydown', escapeHandler, false);
}

function initHomepageHeaderState() {
    const body = document.body;
    if (!body.classList.contains('homepage')) return;

    const header = document.querySelector('.site-header');
    const hero = document.getElementById('homepage-hero');
    if (!header || !hero) return;

    // 找到第二個section（我們的產品與服務）
    const sections = document.querySelectorAll('section');
    const secondSection = sections[1]; // 第一個是hero，第二個是產品與服務
    
    if (!secondSection) return;

    const toggleHeaderState = () => {
        const secondSectionTop = secondSection.offsetTop;
        const scrolledToSecondSection = window.scrollY >= secondSectionTop - 80;
        if (scrolledToSecondSection) {
            header.classList.add('is-solid');
        } else {
            header.classList.remove('is-solid');
        }
    };

    toggleHeaderState();
    window.addEventListener('scroll', toggleHeaderState, { passive: true });
    window.addEventListener('resize', toggleHeaderState);
}

// 初始化函數，確保在所有情況下都能正確初始化
function initializePage() {
    // 先嘗試載入組件（如果需要的話）
    loadHeader();
    loadFooter();
    
    // 無論組件載入成功與否，都確保初始化 menu
    // 使用 setTimeout 確保 DOM 完全準備好
    setTimeout(() => {
        initMobileMenu();
    }, 10);
}

// 當 DOM 載入完成後初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    // DOM 已經載入完成，直接初始化
    initializePage();
}

// 額外確保：如果前面的初始化失敗，在 window.load 時再次嘗試
window.addEventListener('load', () => {
    setTimeout(() => {
        const menuToggle = document.querySelector('.menu-toggle');
        const mobileNav = document.getElementById('mobile-nav');
        // 如果 menu 還沒初始化，重新初始化
        if (menuToggle && mobileNav) {
            if (!menuToggle.dataset.initialized || menuToggle.dataset.initialized !== 'true') {
                // 清除標記，重新初始化
                menuToggle.dataset.initialized = 'false';
                initMobileMenu();
            }
        }
    }, 100);
});

