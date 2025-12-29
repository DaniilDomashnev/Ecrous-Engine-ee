/* ==========================================
   Settings.js - Исправленная версия
========================================== */

// Ждем полной готовности DOM перед запуском чего-либо
document.addEventListener('DOMContentLoaded', () => {
	loadSavedTheme()
	loadCustomTheme()
	restoreAnimations()
	restoreHints()
	initSettingsListeners() // Безопасный запуск слушателей
})

/* ==========================================
   ИНИЦИАЛИЗАЦИЯ СЛУШАТЕЛЕЙ (БЕЗОПАСНО)
========================================== */
function initSettingsListeners() {
	const uploadBtn = document.getElementById('uploadThemeBtn')
	const fileInput = document.getElementById('themeFileInput')
	const themeSelect = document.getElementById('ThemeSelect')

	// Проверяем, существуют ли элементы, прежде чем вешать события
	if (uploadBtn && fileInput) {
		uploadBtn.addEventListener('click', () => {
			fileInput.click()
		})

		fileInput.addEventListener('change', async event => {
			const file = event.target.files[0]
			if (!file) return

			try {
				const text = await file.text()
				// Ищем имя класса темы или генерируем уникальное
				const match = text.match(/\.theme-[a-zA-Z0-9_-]+/)
				let themeName = 'theme-custom-' + Date.now()

				if (match) themeName = match[0].replace('.', '')

				// Сохраняем
				localStorage.setItem('customThemeCSS', text)
				localStorage.setItem('customThemeName', themeName)

				addCustomThemeToDOM(themeName, text)
				addCustomThemeToSelect(themeName)

				applyTheme(themeName)

				if (themeSelect) themeSelect.value = themeName

				alert('Тема успешно загружена!')
			} catch (e) {
				console.error(e)
				alert('Ошибка чтения файла')
			}
		})
	}
}

/* ==========================================
   ЗАГРУЗКА СОХРАНЕННОЙ ТЕМЫ
========================================== */
function loadSavedTheme() {
	const saved = localStorage.getItem('theme') || 'Dark'
	applyThemeClasses(saved)

	const select = document.getElementById('ThemeSelect')
	if (select) select.value = saved
}

/* ==========================================
   ВОССТАНОВЛЕНИЕ КАСТОМНОЙ ТЕМЫ
========================================== */
function loadCustomTheme() {
	const css = localStorage.getItem('customThemeCSS')
	const name = localStorage.getItem('customThemeName')

	if (!css || !name) return

	addCustomThemeToDOM(name, css)
	addCustomThemeToSelect(name)
}

/* ==========================================
   СМЕНА ТЕМЫ (ИЗ SELECT)
========================================== */
function changeTheme() {
	const select = document.getElementById('ThemeSelect')
	if (!select) return

	const theme = select.value
	applyThemeClasses(theme)
	localStorage.setItem('theme', theme)
}

/* ==========================================
   ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ПРИМЕНЕНИЯ КЛАССОВ
========================================== */
function applyThemeClasses(themeName) {
	// Удаляем старые темы
	document.body.classList.remove(
		...Array.from(document.body.classList).filter(cls =>
			cls.startsWith('theme-')
		)
	)

	if (themeName.startsWith('theme-')) {
		document.body.classList.add(themeName)
	} else {
		const map = {
			Dark: 'theme-dark',
			Light: 'theme-light',
			Night: 'theme-night',
			Ruby: 'theme-ruby',
			RubyLight: 'theme-ruby-light',
			RubyNeon: 'theme-ruby-neon',
			Emerald: 'theme-emerald',
			Gold: 'theme-gold',
			Diamond: 'theme-diamond',
			Sapphire: 'theme-sapphire',
			Gray: 'theme-gray',
			Mint: 'theme-mint',
			Sakura: 'theme-sakura',
			Sunset: 'theme-sunset',
			Frost: 'theme-frost',
		}
		document.body.classList.add(map[themeName] || 'theme-dark')
	}
}

/* ==========================================
   ПРИМЕНЕНИЕ КАСТОМНОЙ ТЕМЫ (HELPER)
========================================== */
function applyTheme(name) {
	applyThemeClasses(name)
	localStorage.setItem('theme', name)
}

/* ==========================================
   DOM ОПЕРАЦИИ ДЛЯ КАСТОМНЫХ ТЕМ
========================================== */
function addCustomThemeToDOM(name, css) {
	const old = document.getElementById('custom-theme-style')
	if (old) old.remove()

	const style = document.createElement('style')
	style.id = 'custom-theme-style'
	style.textContent = css
	document.head.appendChild(style)
}

function addCustomThemeToSelect(name) {
	const select = document.getElementById('ThemeSelect')
	if (!select) return

	if ([...select.options].some(o => o.value === name)) return

	const option = document.createElement('option')
	option.value = name
	option.textContent = 'Custom: ' + name.replace('theme-', '')
	select.appendChild(option)
}

/* ==========================================
   УПРАВЛЕНИЕ ОКНОМ
========================================== */
function openSettings() {
	const panel = document.getElementById('settingsPanel')
	if (panel) {
		// Ensure overlay exists and show it
		const overlay = ensureModalOverlay()
		overlay.style.display = 'block'
		// small delay to allow CSS transition
		setTimeout(() => overlay.classList.add('visible'), 10)

		panel.style.display = 'flex' // Важно: flex для центрирования
		// Небольшая задержка для анимации opacity, если она есть в CSS
		setTimeout(() => panel.classList.remove('hidden'), 10)

		// prevent body scroll while modal open
		document.documentElement.style.overflow = 'hidden'
	}
}

function closeSettings() {
	const panel = document.getElementById('settingsPanel')
	if (panel) {
		panel.classList.add('hidden')
		// hide overlay with transition
		const overlay = document.getElementById('modalOverlay')
		if (overlay) {
			overlay.classList.remove('visible')
			setTimeout(() => {
				overlay.style.display = 'none'
			}, 220)
		}

		setTimeout(() => {
			panel.style.display = 'none'
			// restore scroll
			document.documentElement.style.overflow = ''
		}, 200) // Ждем завершения CSS transition
	}
}

/* ===== Overlay helper ===== */
function ensureModalOverlay() {
	let overlay = document.getElementById('modalOverlay')
	if (overlay) return overlay

	overlay = document.createElement('div')
	overlay.id = 'modalOverlay'
	overlay.setAttribute('aria-hidden', 'true')
	// ensure CSS class is present so styles from Settings.css apply
	overlay.classList.add('modal-overlay')
	// minimal styling here; main styles in Settings.css
	overlay.style.display = 'none'
	// clicking overlay closes all open panels (not only settings)
	overlay.addEventListener('click', () => {
		try {
			closeAllModals()
		} catch (e) {
			// fallback: try to at least close settings
			try {
				closeSettings()
			} catch (e) {}
		}
	})
	overlay.tabIndex = -1
	document.body.appendChild(overlay)
	return overlay
}

/* Close any open modal/panel in the app. This centralizes overlay click behavior. */
function closeAllModals() {
	// call known close helpers if present
	const closers = [
		'closeSettings',
		'closeProfile',
		'closeMyProjects',
		'closeNews',
		'closeFullNews',
		'closeThanks',
		'closeTutorials',
		'closeCreateProject',
	]

	closers.forEach(name => {
		try {
			const fn = window[name]
			if (typeof fn === 'function') fn()
		} catch (e) {}
	})

	// ensure overlay hides
	const overlay = document.getElementById('modalOverlay')
	if (overlay) {
		overlay.classList.remove('visible')
		setTimeout(() => {
			overlay.style.display = 'none'
		}, 220)
	}

	// restore scroll
	try {
		document.documentElement.style.overflow = ''
	} catch (e) {}
}

/* ==========================================
   АНИМАЦИИ И ПОДСКАЗКИ
========================================== */
function toggleUIAnimations() {
	const el = document.getElementById('uiAnimations')
	if (!el) return

	if (el.checked) {
		document.body.classList.remove('no-animations')
		localStorage.setItem('uiAnimations', 'on')
	} else {
		document.body.classList.add('no-animations')
		localStorage.setItem('uiAnimations', 'off')
	}
}

function restoreAnimations() {
	if (localStorage.getItem('uiAnimations') === 'off') {
		document.body.classList.add('no-animations')
		const el = document.getElementById('uiAnimations')
		if (el) el.checked = false
	}
}

function toggleHints() {
	const el = document.getElementById('uiHints')
	if (el) localStorage.setItem('uiHints', el.checked ? 'on' : 'off')
}

function restoreHints() {
	if (localStorage.getItem('uiHints') === 'off') {
		const el = document.getElementById('uiHints')
		if (el) el.checked = false
	}
}
