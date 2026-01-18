/* ==========================================
   Settings.js
========================================== */

document.addEventListener('DOMContentLoaded', () => {
	loadCustomTheme()
	loadSavedTheme()

	// Принудительное обновление, если CSS не подхватился
	const saved = localStorage.getItem('theme') || 'Dark'
	document.body.classList.add(getThemeClass(saved))

	initSettingsListeners()
})

function initSettingsListeners() {
	const uploadBtn = document.getElementById('uploadThemeBtn')
	const fileInput = document.getElementById('themeFileInput')
	const themeSelect = document.getElementById('ThemeSelect')

	if (themeSelect) themeSelect.addEventListener('change', changeTheme)

	if (uploadBtn && fileInput) {
		uploadBtn.addEventListener('click', () => fileInput.click())
		fileInput.addEventListener('change', async e => {
			const file = e.target.files[0]
			if (!file) return
			try {
				const text = await file.text()
				let name = 'theme-custom-' + Date.now()
				const match = text.match(/\.theme-[a-zA-Z0-9_-]+/)
				if (match) name = match[0].replace('.', '')

				localStorage.setItem('customThemeCSS', text)
				localStorage.setItem('customThemeName', name)

				addCustomThemeToDOM(name, text)
				addCustomThemeToSelect(name)
				applyTheme(name)
				if (themeSelect) themeSelect.value = name
				alert('Тема загружена!')
			} catch (err) {
				alert('Ошибка файла')
			}
		})
	}
}

// === THEME LOGIC ===

const THEME_MAP = {
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

function getThemeClass(name) {
	return THEME_MAP[name] || (name.startsWith('theme-') ? name : 'theme-dark')
}

function applyThemeClasses(themeName) {
	// Эффективная очистка классов тем
	document.body.className = document.body.className
		.split(' ')
		.filter(c => !c.startsWith('theme-'))
		.join(' ')

	document.body.classList.add(getThemeClass(themeName))
}

function loadSavedTheme() {
	const saved = localStorage.getItem('theme') || 'Dark'
	applyThemeClasses(saved)
	const select = document.getElementById('ThemeSelect')
	if (select) select.value = saved
}

window.changeTheme = function () {
	const select = document.getElementById('ThemeSelect')
	if (!select) return
	applyTheme(select.value)
}

function applyTheme(name) {
	applyThemeClasses(name)
	localStorage.setItem('theme', name)
}

// === CUSTOM THEMES ===
function loadCustomTheme() {
	const css = localStorage.getItem('customThemeCSS')
	const name = localStorage.getItem('customThemeName')
	if (css && name) {
		addCustomThemeToDOM(name, css)
		addCustomThemeToSelect(name)
	}
}

function addCustomThemeToDOM(name, css) {
	let style = document.getElementById('custom-theme-style')
	if (!style) {
		style = document.createElement('style')
		style.id = 'custom-theme-style'
		document.head.appendChild(style)
	}
	style.textContent = css
}

function addCustomThemeToSelect(name) {
	const select = document.getElementById('ThemeSelect')
	if (!select || [...select.options].some(o => o.value === name)) return
	const option = document.createElement('option')
	option.value = name
	option.textContent = 'Custom: ' + name.replace('theme-', '')
	select.appendChild(option)
}

// === MODALS ===
window.openSettings = function () {
	const panel = document.getElementById('settingsPanel')
	if (panel) {
		// Пробуем найти оверлей из других скриптов или создаем свой
		let ov = document.getElementById('modalOverlay')
		if (!ov) {
			ov = document.createElement('div')
			ov.id = 'modalOverlay'
			ov.className = 'modal-overlay'
			document.body.appendChild(ov)
			ov.onclick = window.closeSettings
		}
		ov.style.display = 'block'
		setTimeout(() => ov.classList.add('visible'), 10)

		panel.style.display = 'flex'
		panel.classList.remove('hidden')
	}
}

window.closeSettings = function () {
	const panel = document.getElementById('settingsPanel')
	if (panel) {
		panel.classList.add('hidden')
		const ov = document.getElementById('modalOverlay')
		if (ov) {
			ov.classList.remove('visible')
			setTimeout(() => (ov.style.display = 'none'), 220)
		}
		setTimeout(() => (panel.style.display = 'none'), 200)
	}
}
