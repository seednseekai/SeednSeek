/**
 * 語言切換：拉桿切換 中文 / EN
 * 不依賴 Element.closest，並在 load 後綁定確保按鈕可點
 */
(function () {
    var STORAGE_KEY = 'seednseek-lang';

    function getLang() {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved === 'en' || saved === 'zh') return saved;
        } catch (_) {}
        return 'zh';
    }

    function setLang(lang) {
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (_) {}
        if (!document.body) return;
        document.documentElement.lang = lang === 'en' ? 'en' : 'zh-Hant';
        document.body.classList.remove('lang-zh', 'lang-en');
        document.body.classList.add('lang-' + lang);
        updateToggleButtons(lang);
        updatePlaceholdersAndOptions(lang);
    }

    /** 依語言更新 contact 等頁的 input/textarea placeholder 與 select option 文字 */
    function updatePlaceholdersAndOptions(lang) {
        var phAttr = lang === 'zh' ? 'data-placeholder-zh' : 'data-placeholder-en';
        var els = document.querySelectorAll('[' + phAttr + ']');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            var val = el.getAttribute(phAttr);
            if (val != null) el.placeholder = val;
        }
        var optZh = document.querySelectorAll('option[data-lang-zh]');
        var optAttr = lang === 'zh' ? 'data-lang-zh' : 'data-lang-en';
        for (var j = 0; j < optZh.length; j++) {
            var opt = optZh[j];
            var text = opt.getAttribute(optAttr);
            if (text != null) opt.textContent = text;
        }
    }

    function updateToggleButtons(lang) {
        var btns = document.querySelectorAll('.lang-toggle-btn');
        for (var i = 0; i < btns.length; i++) {
            var btn = btns[i];
            var isActive = btn.getAttribute('data-lang') === lang;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        }
    }

    function init() {
        if (!document.body) return;
        var lang = getLang();
        document.body.classList.add('lang-' + lang);
        document.documentElement.lang = lang === 'en' ? 'en' : 'zh-Hant';
        updateToggleButtons(lang);
        updatePlaceholdersAndOptions(lang);
    }

    /** 點擊整個拉桿就切換語言：從目標往上找是否在 .lang-toggle 內 */
    function findLangToggle(el) {
        while (el && el !== document.body) {
            if (el.classList && el.classList.contains('lang-toggle')) return el;
            el = el.parentNode;
        }
        return null;
    }

    function onBodyClick(e) {
        var target = e.target;
        if (!target) return;
        var lever = findLangToggle(target);
        if (!lever) return;
        e.preventDefault();
        e.stopPropagation();
        var isZh = document.body.classList.contains('lang-zh');
        var next = isZh ? 'en' : 'zh';
        setLang(next);
    }

    var bound = false;
    function run() {
        init();
        if (!bound && document.body) {
            bound = true;
            document.body.addEventListener('click', onBodyClick, true);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
