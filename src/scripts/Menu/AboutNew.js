/**
 * КОНФИГУРАЦИЯ ОБНОВЛЕНИЯ
 * Меняйте эту переменную при каждом обновлении движка.
 */
const UPDATE_CONFIG = {
	version: 'ECX 2025.01.01', // Должно совпадать с тем, что в HTML
	// new | fix | update
	changes: [
		{
			type: 'new',
			label: 'Новое',
			text: 'Добавлен новый блок обводки (Расшир.)',
		},
		{
			type: 'new',
			label: 'Новое',
			text: 'Новый раздело блоков "3д"',
		},
		{
			type: 'fix',
			label: 'Исправлено',
			text: 'Исправлен баг с отображением обводки',
		},
		{
			type: 'fix',
			label: 'Исправлено',
			text: 'Исправлен баг с центрированием игрового окна, изменение размера и перемещением',
		},
		{
			type: 'fix',
			label: 'Исправлено',
			text: 'Устранена ошибка вылета при импорте больших спрайтов',
		},
		{
			type: 'fix',
			label: 'Исправлено',
			text: 'Блоки на телефоне работают нормально',
		},
		{
			type: 'fix',
			label: 'Исправлено',
			text: 'Закрыты экспорты в IOS PWA (Техническое обслуживание)',
		},
		{
			type: 'fix',
			label: 'Исправлено',
			text: 'Анимация карточки билда .ecr была исправлена с 0.04s до 0.5s',
		},
		{
			type: 'fix',
			label: 'Исправлено',
			text: 'В Asset Store можно загрузить свой ассет',
		},
		{
			type: 'update',
			label: 'Улучшено',
			text: 'Ecrous Paint теперь Ecrous Art. Так же был улучшен в лучшую сторону',
		},
		{
			type: 'update',
			label: 'Улучшено',
			text: 'Улучшен дизайн Asset Store',
		},
		{
			type: 'update',
			label: 'Улучшено',
			text: 'Новый участники в пункте благодарности',
		},
	],
}

// Ключ для LocalStorage
const STORAGE_KEY_VERSION = 'EcrousEngine_LastViewedVersion'

document.addEventListener('DOMContentLoaded', () => {
	// 1. Инициализируем контент
	initChangelog()

	// 2. Проверяем, нужно ли показывать окно автоматически
	checkAndShowUpdate()
})

function initChangelog() {
	const container = document.getElementById('changelogContainer')
	const versionSpan = document.getElementById('newVersionNumber')

	if (versionSpan) versionSpan.innerText = UPDATE_CONFIG.version
	if (!container) return

	// Очищаем контейнер
	container.innerHTML = ''

	// Генерируем HTML на основе массива changes
	UPDATE_CONFIG.changes.forEach(item => {
		const row = document.createElement('div')
		row.className = 'changelog-item'

		// Определяем класс бейджа
		const badgeClass = `badge ${item.type}`

		row.innerHTML = `
            <div class="${badgeClass}">${item.label}</div>
            <div class="change-text">${item.text}</div>
        `

		container.appendChild(row)
	})
}

function openAboutNew() {
	const panel = document.getElementById('aboutNewPanel')
	if (!panel) return

	try {
		document.documentElement.style.overflow = 'hidden'
	} catch (e) {}

	panel.style.display = 'flex'
	// Используем анимацию из About.css
	panel.style.animation =
		'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
}

function closeAboutNew() {
	const panel = document.getElementById('aboutNewPanel')
	if (!panel) return

	panel.style.animation = 'fadeOut 0.3s forwards'

	setTimeout(() => {
		panel.style.display = 'none'
		panel.style.animation = ''
		document.documentElement.style.overflow = ''

		// Когда пользователь закрывает окно, мы считаем, что он ознакомился с версией
		markVersionAsViewed()
	}, 300)
}

/**
 * Проверяет LocalStorage.
 * Если сохраненная версия отличается от текущей UPDATE_CONFIG.version -> показывает окно.
 */
function checkAndShowUpdate() {
	const lastViewed = localStorage.getItem(STORAGE_KEY_VERSION)

	if (lastViewed !== UPDATE_CONFIG.version) {
		// Небольшая задержка, чтобы сайт успел прогрузиться визуально
		setTimeout(() => {
			openAboutNew()
		}, 1000)
	}
}

function markVersionAsViewed() {
	localStorage.setItem(STORAGE_KEY_VERSION, UPDATE_CONFIG.version)
}
