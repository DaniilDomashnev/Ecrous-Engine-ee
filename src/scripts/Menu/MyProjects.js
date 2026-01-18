/* ===============================
   MyProjects.js
=============================== */

// Кэшируем DOM элементы
const els = {
	panel: null,
	list: null,
	centerContainer: null,
	alertModal: null,
	promptModal: null,
}

document.addEventListener('DOMContentLoaded', () => {
	els.panel = document.getElementById('MyProjectsPanel')
	els.list = document.getElementById('projectList')
	els.centerContainer = document.querySelector('.center-container')
	els.alertModal = document.getElementById('customAlertModal')
	els.promptModal = document.getElementById('customPromptModal')

	initProjects()
})

// Глобальные хелперы для оверлея
const toggleOverlay = visible => {
	let overlay = document.getElementById('modalOverlay')
	if (!overlay) {
		// Создаем лениво, если нет
		overlay = document.createElement('div')
		overlay.id = 'modalOverlay'
		overlay.classList.add('modal-overlay')
		document.body.appendChild(overlay)
	}

	if (visible) {
		overlay.style.display = 'block'
		requestAnimationFrame(() => overlay.classList.add('visible'))
		document.documentElement.style.overflow = 'hidden'
	} else {
		overlay.classList.remove('visible')
		setTimeout(() => (overlay.style.display = 'none'), 220)
		document.documentElement.style.overflow = ''
	}
}

// === ПАНЕЛЬ ПРОЕКТОВ ===
window.openMyProjects = function () {
	if (!els.panel) els.panel = document.getElementById('MyProjectsPanel')
	if (!els.panel) return
	toggleOverlay(true)
	els.panel.style.display = 'block'
	renderProjects() // Обновляем при открытии
}

window.closeMyProjects = function () {
	if (!els.panel) return
	els.panel.style.display = 'none'
	toggleOverlay(false)
}

// === ALERT / PROMPT ===
window.showCustomAlert = function (title, message) {
	const modal = document.getElementById('customAlertModal')
	if (!modal) return
	document.getElementById('alertTitle').innerText = title
	document.getElementById('alertMessage').innerText = message
	modal.style.display = 'flex'
}

window.closeCustomAlert = function () {
	const modal = document.getElementById('customAlertModal')
	if (modal) modal.style.display = 'none'
}

window.showCustomPrompt = function (title, message, defaultValue, callback) {
	const modal = document.getElementById('customPromptModal')
	if (!modal) return

	document.getElementById('promptTitle').innerText = title
	document.getElementById('promptMessage').innerText = message

	const input = document.getElementById('promptInput')
	input.value = defaultValue || ''
	modal.style.display = 'flex'
	input.focus()

	const confirmBtn = document.getElementById('promptConfirmBtn')
	// Удаляем старые листенеры через клонирование
	const newBtn = confirmBtn.cloneNode(true)
	confirmBtn.parentNode.replaceChild(newBtn, confirmBtn)

	newBtn.onclick = () => {
		const value = input.value.trim()
		if (value) {
			callback(value)
			window.closeCustomPrompt()
		} else {
			input.style.borderColor = '#ff4757'
			setTimeout(() => (input.style.borderColor = ''), 300)
		}
	}

	// Enter to submit
	input.onkeydown = e => {
		if (e.key === 'Enter') newBtn.click()
	}
}

window.closeCustomPrompt = function () {
	const modal = document.getElementById('customPromptModal')
	if (modal) modal.style.display = 'none'
}

// Закрытие по клику вне
window.addEventListener('click', e => {
	if (e.target.id === 'customAlertModal') window.closeCustomAlert()
	if (e.target.id === 'customPromptModal') window.closeCustomPrompt()
})

// === ЛОГИКА ПРОЕКТОВ ===
let projects = JSON.parse(localStorage.getItem('ecrous_projects')) || []

function saveProjects() {
	localStorage.setItem('ecrous_projects', JSON.stringify(projects))
	// Диспатчим событие для обновления в других частях приложения
	window.dispatchEvent(new Event('projectsUpdated'))
	if (typeof saveProjectsToFirestore === 'function') saveProjectsToFirestore()
}

function escapeHtml(text) {
	if (!text) return text
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;')
}

// Рендеринг центрального контейнера
window.updateCenterContainer = function () {
	// Получаем актуальные данные
	const currentProjects = JSON.parse(
		localStorage.getItem('ecrous_projects') || '[]'
	)
	const container = document.querySelector('.center-container')
	if (!container) return

	const oldList = container.querySelector('.center-projects-list')
	if (oldList) oldList.remove()

	const centerImg = container.querySelector('.center-image')
	const centerText = container.querySelector('.center-text')

	if (currentProjects.length === 0) {
		if (centerImg) centerImg.style.setProperty('display', 'block', 'important')
		if (centerText)
			centerText.style.setProperty('display', 'block', 'important')
		return
	}

	if (centerImg) centerImg.style.setProperty('display', 'none', 'important')
	if (centerText) centerText.style.setProperty('display', 'none', 'important')

	const list = document.createElement('div')
	list.className = 'center-projects-list'

	// Берем топ 4
	currentProjects.slice(0, 4).forEach((name, index) => {
		const card = document.createElement('div')
		card.className = 'center-project-card'
		card.innerHTML = `
            <div class="project-card-icon">
                <img src="https://img.icons8.com/ios-filled/50/FFFFFF/folder-invoices.png">
            </div>
            <div class="project-card-name">${escapeHtml(name)}</div>
        `
		card.onclick = () => window.openProject(index)
		list.appendChild(card)
	})

	container.appendChild(list)
}

window.openProject = function (index) {
	let current = JSON.parse(localStorage.getItem('ecrous_projects')) || []
	const name = current[index]
	if (!name) return

	// Перемещаем в начало (LRU)
	current.splice(index, 1)
	current.unshift(name)
	localStorage.setItem('ecrous_projects', JSON.stringify(current))

	window.location.href = `Editor/index.html?project=${encodeURIComponent(name)}`
}

function renderProjects() {
	const list = document.getElementById('projectList')
	if (!list) return

	list.innerHTML = ''

	if (projects.length === 0) {
		list.innerHTML = `
            <div class="empty-projects no-select">
                <img src="https://img.icons8.com/?size=100&id=Rtc4TvgYD4oM&format=png&color=FFFFFF">
                <p>Похоже, у вас еще нет проектов.<br>Создайте новый или импортируйте!</p>
            </div>`
		return
	}

	const fragment = document.createDocumentFragment()
	projects.forEach((name, index) => {
		const item = document.createElement('div')
		item.className = 'project-item'
		item.innerHTML = `
            <span class="project-name-text">${escapeHtml(name)}</span>
            <div class="project-controls-right">
                <button class="quick-run-btn" onclick="openProject(${index})" title="Запустить">
                    <img src="https://img.icons8.com/ios-filled/50/FFFFFF/play--v1.png">
                </button>
                <div class="project-menu">
                    <button class="menu-dots" onclick="toggleMenu(event, ${index})">
                        <img src="https://img.icons8.com/ios-glyphs/30/FFFFFF/menu-2.png">
                    </button>
                    <div class="menu-dropdown" id="menu-${index}">
                        <div onclick="openProject(${index})">Запустить</div>
                        <div onclick="renameProject(${index})">Переименовать</div>
                        <div onclick="deleteProject(${index})" class="danger">Удалить</div>
                    </div>
                </div>
            </div>`
		fragment.appendChild(item)
	})
	list.appendChild(fragment)
	window.updateCenterContainer()
}

// === УДАЛЕНИЕ, ПЕРЕИМЕНОВАНИЕ, ИМПОРТ ===

let projectIndexToDelete = null
window.deleteProject = function (index) {
	projectIndexToDelete = index
	const modal = document.getElementById('deleteConfirmModal')
	if (modal) {
		modal.style.display = 'flex'
		document.getElementById('confirmDeleteBtn').onclick = () => {
			if (projectIndexToDelete === null) return
			projects.splice(projectIndexToDelete, 1)
			saveProjects()
			renderProjects()
			modal.style.display = 'none'
		}
	}
}

// 🔥 ДОБАВЛЕННАЯ ФУНКЦИЯ 🔥
window.closeDeleteModal = function () {
	const modal = document.getElementById('deleteConfirmModal')
	if (modal) {
		modal.style.display = 'none'
	}
}

window.renameProject = function (index) {
	const oldName = projects[index]
	window.showCustomPrompt(
		'Переименовать',
		'Новое название:',
		oldName,
		newName => {
			if (newName === oldName) return
			projects[index] = newName
			saveProjects()
			renderProjects()
		}
	)
}

window.toggleMenu = function (event, index) {
	event.stopPropagation()
	document
		.querySelectorAll('.menu-dropdown')
		.forEach(m => m.classList.remove('active'))
	const menu = document.getElementById(`menu-${index}`)
	if (menu) menu.classList.toggle('active')
}

// Импорт
window.importProject = function () {
	let input = document.getElementById('hidden-import-input')
	if (!input) {
		input = document.createElement('input')
		input.type = 'file'
		input.id = 'hidden-import-input'
		input.accept = '.ecr,.json'
		input.style.display = 'none'
		document.body.appendChild(input)
		input.onchange = e => {
			const file = e.target.files[0]
			if (!file) return
			const reader = new FileReader()
			reader.onload = evt => {
				try {
					const data = JSON.parse(evt.target.result)
					if (!data.scenes) throw new Error('Invalid format')

					let name =
						data.meta && data.meta.name
							? data.meta.name
							: file.name.replace(/\.(ecr|json)$/i, '')
					const proceed = finalName => {
						if (!data.meta) data.meta = {}
						data.meta.name = finalName
						localStorage.setItem(
							`ecrous_data_${finalName}`,
							JSON.stringify(data)
						)
						if (!projects.includes(finalName)) {
							projects.unshift(finalName)
							saveProjects()
							renderProjects()
						}
						window.showCustomAlert(
							'Успешно!',
							`Проект "${finalName}" импортирован.`
						)
					}

					if (projects.includes(name)) {
						window.showCustomPrompt(
							'Конфликт',
							'Проект существует. Новое имя:',
							name + '_copy',
							proceed
						)
					} else {
						proceed(name)
					}
				} catch (err) {
					window.showCustomAlert('Ошибка', 'Некорректный файл проекта')
				}
				e.target.value = ''
			}
			reader.readAsText(file)
		}
	}
	input.click()
}

function initProjects() {
	const plusBtn = document.querySelector('.plus-button')
	if (plusBtn)
		plusBtn.onclick = () => {
			const modal = document.getElementById('projectModal')
			if (modal) {
				modal.style.display = 'flex'
				const inp = document.getElementById('projectName')
				if (inp) {
					inp.value = ''
					inp.focus()
				}
			}
		}

	const importBtn = document.querySelector('.import-button')
	if (importBtn) importBtn.onclick = window.importProject

	const submitBtn = document.getElementById('submitProject')
	if (submitBtn) {
		submitBtn.onclick = () => {
			const name = document.getElementById('projectName')?.value.trim()
			if (!name) return alert('Введите имя!')
			projects.unshift(name)
			saveProjects()
			renderProjects()
			document.getElementById('projectModal').style.display = 'none'
		}
	}

	window.addEventListener('click', () => {
		document
			.querySelectorAll('.menu-dropdown')
			.forEach(m => m.classList.remove('active'))
	})

	// Закрытие модалок по клику на фон
	window.onclick = e => {
		const pm = document.getElementById('projectModal')
		const dm = document.getElementById('deleteConfirmModal')
		if (e.target === pm) pm.style.display = 'none'
		if (e.target === dm) dm.style.display = 'none'
	}

	// Слушаем изменения localStorage (вместо setInterval)
	window.addEventListener('storage', e => {
		if (e.key === 'ecrous_projects') {
			projects = JSON.parse(e.newValue || '[]')
			renderProjects()
		}
	})
	// Слушаем внутреннее событие
	window.addEventListener('projectsUpdated', () => {
		updateCenterContainer()
	})

	renderProjects()
	updateCenterContainer()
}
