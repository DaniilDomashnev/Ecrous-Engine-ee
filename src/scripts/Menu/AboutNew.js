/* ==========================================
   AboutNew.js
========================================== */

const UPDATE_CONFIG = {
	version: 'ECX 2026.15.01',
	changes: [
		{
			type: 'new',
			text: {
				ru: 'Добавлены новые блоки "создать спрайт" и "сменить кадр/картинку"',
			},
		},
		{
			type: 'fix',
			text: { ru: 'Блоки на телефоне работают нормально, при отдалении тоже' },
		},
	],
}

const STORAGE_KEY_VERSION = 'EcrousEngine_LastViewedVersion'

const BADGE_KEYS = { new: 'badgeNew', fix: 'badgeFix', update: 'badgeUpdate' }
const BADGE_FALLBACKS = {
	ru: { new: 'Новое', fix: 'Исправлено', update: 'Улучшено' },
	en: { new: 'New', fix: 'Fixed', update: 'Improved' },
	uk: { new: 'Нове', fix: 'Виправлено', update: 'Покращено' },
	kz: { new: 'Жаңа', fix: 'Түзетілді', update: 'Жақсартылды' },
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
	initChangelog()
	checkAndShowUpdate()
})

window.initChangelog = initChangelog

function getCurrentLanguage() {
	return localStorage.getItem('language') || 'ru'
}

function initChangelog() {
	const container = document.getElementById('changelogContainer')
	const versionSpan = document.getElementById('newVersionNumber')

	if (versionSpan) versionSpan.innerText = UPDATE_CONFIG.version
	if (!container) return

	container.innerHTML = ''
	const currentLang = getCurrentLanguage()
	const fragment = document.createDocumentFragment() // Оптимизация рендеринга

	UPDATE_CONFIG.changes.forEach(item => {
		const row = document.createElement('div')
		row.className = 'changelog-item'

		// Текст бейджа
		const dict = BADGE_FALLBACKS[currentLang] || BADGE_FALLBACKS['ru']
		const badgeText = dict[item.type] || item.type

		// Текст обновления
		const updateText =
			item.text[currentLang] ||
			item.text['ru'] ||
			Object.values(item.text)[0] ||
			''

		row.innerHTML = `
            <div class="badge ${item.type}" data-translate="${
			BADGE_KEYS[item.type]
		}">${badgeText}</div>
            <div class="change-text">${updateText}</div>
        `
		fragment.appendChild(row)
	})

	container.appendChild(fragment)
}

window.openAboutNew = function () {
	const panel = document.getElementById('aboutNewPanel')
	if (!panel) return

	initChangelog()
	document.documentElement.style.overflow = 'hidden'

	panel.style.display = 'flex'
	panel.style.animation =
		'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
}

window.closeAboutNew = function () {
	const panel = document.getElementById('aboutNewPanel')
	if (!panel) return

	panel.style.animation = 'fadeOut 0.3s forwards'
	setTimeout(() => {
		panel.style.display = 'none'
		panel.style.animation = ''
		document.documentElement.style.overflow = ''
		markVersionAsViewed()
	}, 300)
}

function checkAndShowUpdate() {
	const lastViewed = localStorage.getItem(STORAGE_KEY_VERSION)
	if (lastViewed !== UPDATE_CONFIG.version) {
		setTimeout(window.openAboutNew, 1000)
	}
}

function markVersionAsViewed() {
	localStorage.setItem(STORAGE_KEY_VERSION, UPDATE_CONFIG.version)
}
