// ===============================
// Панель "Мои проекты"
// ===============================

// Открыть панель
function openMyProjects() {
	const panel = document.getElementById('MyProjectsPanel')
	if (!panel) return

	try {
		const overlay = ensureModalOverlay()
		overlay.style.display = 'block'
		setTimeout(() => overlay.classList.add('visible'), 10)
		document.documentElement.style.overflow = 'hidden'
	} catch (e) {}

	panel.style.display = 'block'
}

// Закрыть панель
function closeMyProjects() {
	const panel = document.getElementById('MyProjectsPanel')
	if (panel) panel.style.display = 'none'

	try {
		const overlay = document.getElementById('modalOverlay')
		if (overlay) {
			overlay.classList.remove('visible')
			setTimeout(() => {
				overlay.style.display = 'none'
			}, 220)
		}
	} catch (e) {}

	document.documentElement.style.overflow = ''
}

// ===============================
// КАСТОМНЫЕ МОДАЛЬНЫЕ ОКНА
// ===============================

// 1. Показать Alert (Уведомление)
function showCustomAlert(title, message) {
	const modal = document.getElementById('customAlertModal')
	if (!modal) return

	document.getElementById('alertTitle').innerText = title
	document.getElementById('alertMessage').innerText = message

	modal.style.display = 'flex'
}

function closeCustomAlert() {
	const modal = document.getElementById('customAlertModal')
	if (modal) modal.style.display = 'none'
}

// 2. Показать Prompt (Ввод данных)
function showCustomPrompt(title, message, defaultValue, callback) {
	const modal = document.getElementById('customPromptModal')
	if (!modal) return

	document.getElementById('promptTitle').innerText = title
	document.getElementById('promptMessage').innerText = message

	const input = document.getElementById('promptInput')
	input.value = defaultValue || ''

	modal.style.display = 'flex'
	input.focus()

	const confirmBtn = document.getElementById('promptConfirmBtn')
	const newBtn = confirmBtn.cloneNode(true)
	confirmBtn.parentNode.replaceChild(newBtn, confirmBtn)

	newBtn.onclick = function () {
		const value = input.value.trim()
		if (value) {
			callback(value)
			closeCustomPrompt()
		} else {
			input.style.borderColor = '#ff4757'
			setTimeout(() => (input.style.borderColor = ''), 300)
		}
	}
}

function closeCustomPrompt() {
	const modal = document.getElementById('customPromptModal')
	if (modal) modal.style.display = 'none'
}

window.addEventListener('click', e => {
	if (e.target.id === 'customAlertModal') closeCustomAlert()
	if (e.target.id === 'customPromptModal') closeCustomPrompt()
})

// ===============================
// Работа со списком проектов
// ===============================

let projects = JSON.parse(localStorage.getItem('ecrous_projects')) || []

function updateCenterContainer() {
	// 1. Получаем проекты
	const projects = JSON.parse(localStorage.getItem('ecrous_projects') || '[]')

	// 2. Находим контейнер
	const container = document.querySelector('.center-container')
	if (!container) return

	// 3. Удаляем старый список (если есть)
	const oldList = container.querySelector('.center-projects-list')
	if (oldList) oldList.remove()

	// 4. Если проектов нет
	if (projects.length === 0) {
		container
			.querySelector('.center-image')
			?.style.setProperty('display', 'block', 'important')
		container
			.querySelector('.center-text')
			?.style.setProperty('display', 'block', 'important')
		return
	}

	// 5. Скрываем чашку и текст
	container
		.querySelector('.center-image')
		?.style.setProperty('display', 'none', 'important')
	container
		.querySelector('.center-text')
		?.style.setProperty('display', 'none', 'important')

	// 6. 🔥 ИЗМЕНЕНИЕ: Теперь массив отсортирован (0 - самый свежий), просто берем первые 4
	const top4 = projects.slice(0, 4)

	// 7. Создаём контейнер списка
	const list = document.createElement('div')
	list.className = 'center-projects-list'

	// 8. Создаём карточки
	top4.forEach((name, idx) => {
		// 🔥 ИЗМЕНЕНИЕ: Индекс теперь прямой, так как порядок совпадает
		const realIndex = idx

		const card = document.createElement('div')
		card.className = 'center-project-card'
		card.innerHTML = `
      <div class="project-card-icon">
				<img src="https://img.icons8.com/ios-filled/50/FFFFFF/folder-invoices.png">
			</div>
      <div class="project-card-name">${escapeHtml(name)}</div>
    `
		card.onclick = () => openProject(realIndex)
		list.appendChild(card)
	})

	// 9. Добавляем список в контейнер
	container.appendChild(list)
}

function escapeHtml(text) {
	const div = document.createElement('div')
	div.textContent = text
	return div.innerHTML
}

// 🔥 ИЗМЕНЕННАЯ ФУНКЦИЯ ОТКРЫТИЯ
function openProject(index) {
	let currentProjects =
		JSON.parse(localStorage.getItem('ecrous_projects')) || []
	const projectName = currentProjects[index]

	if (!projectName) return

	// 1. Удаляем его с текущей позиции
	currentProjects.splice(index, 1)

	// 2. 🔥 ВАЖНО: Добавляем в НАЧАЛО массива (unshift), чтобы он был первым
	currentProjects.unshift(projectName)

	// 3. Сохраняем обновленный порядок
	localStorage.setItem('ecrous_projects', JSON.stringify(currentProjects))

	projects = currentProjects

	// 4. Запускаем
	const encodedName = encodeURIComponent(projectName)
	window.location.href = `Editor/index.html?project=${encodedName}`
}

// Отобразить проекты
function renderProjects() {
	const list = document.getElementById('projectList')
	if (!list) return

	list.innerHTML = ''

	if (projects.length === 0) {
		list.innerHTML = `
            <div class="empty-projects no-select">
                <img src="https://img.icons8.com/?size=100&id=Rtc4TvgYD4oM&format=png&color=FFFFFF">
                <p>Похоже, у вас еще нет проектов.<br>Создайте новый или импортируйте!</p>
            </div>
        `
	} else {
		projects.forEach((name, index) => {
			const item = document.createElement('div')
			item.className = 'project-item'

			item.innerHTML = `
                <span class="project-name-text">${name}</span>

                <div class="project-controls-right">
                    <button class="quick-run-btn" onclick="openProject(${index})" title="Запустить проект">
                        <img src="https://img.icons8.com/ios-filled/50/FFFFFF/play--v1.png" alt="Run">
                    </button>

                    <div class="project-menu">
                        <button class="menu-dots" onclick="toggleMenu(event, ${index})">
                            <img src="https://img.icons8.com/ios-glyphs/30/FFFFFF/menu-2.png" alt="Menu">
                        </button>

                        <div class="menu-dropdown" id="menu-${index}">
                            <div onclick="openProject(${index})">Запустить</div>
                            <div onclick="renameProject(${index})">Переименовать</div>
                            <div onclick="deleteProject(${index})" class="danger">Удалить</div>
                        </div>
                    </div>
                </div>
            `

			list.appendChild(item)
		})
	}

	updateCenterContainer()
}

// Удаление проекта
let projectIndexToDelete = null

function deleteProject(index) {
	projectIndexToDelete = index
	const modal = document.getElementById('deleteConfirmModal')
	if (modal) {
		modal.style.display = 'flex'
		const confirmBtn = document.getElementById('confirmDeleteBtn')
		confirmBtn.onclick = executeDeletion
	}
}

function executeDeletion() {
	if (projectIndexToDelete === null) return
	projects.splice(projectIndexToDelete, 1)
	saveProjects()
	renderProjects()
	closeDeleteModal()
}

function closeDeleteModal() {
	const modal = document.getElementById('deleteConfirmModal')
	if (modal) modal.style.display = 'none'
	projectIndexToDelete = null
}

window.addEventListener('click', event => {
	const modal = document.getElementById('deleteConfirmModal')
	if (event.target === modal) {
		closeDeleteModal()
	}
})

function saveProjects() {
	localStorage.setItem('ecrous_projects', JSON.stringify(projects))
	console.log('💾 Проекты сохранены:', projects)
	if (typeof saveProjectsToFirestore === 'function') {
		saveProjectsToFirestore()
	}
	updateCenterContainer()
}

// ===============================
// Создание проекта
// ===============================

function openCreateProject() {
	const modal = document.getElementById('projectModal')
	if (!modal) return
	modal.style.display = 'flex'
	const input = document.getElementById('projectName')
	if (input) {
		input.value = ''
		input.focus()
	}
}

function closeCreateProject() {
	const modal = document.getElementById('projectModal')
	if (modal) modal.style.display = 'none'
}

// ===============================
// Импорт проекта
// ===============================

function importProject() {
	let input = document.getElementById('hidden-import-input')
	if (!input) {
		input = document.createElement('input')
		input.type = 'file'
		input.id = 'hidden-import-input'
		input.accept = '.ecr,.json'
		input.style.display = 'none'
		document.body.appendChild(input)
		input.onchange = e => handleImportFile(e)
	}
	input.click()
}

function handleImportFile(event) {
	const file = event.target.files[0]
	if (!file) return
	const reader = new FileReader()
	reader.onload = function (e) {
		try {
			const importedData = JSON.parse(e.target.result)
			if (!importedData.scenes || !Array.isArray(importedData.scenes)) {
				showCustomAlert('Ошибка', 'Некорректный формат файла проекта.')
				return
			}
			let newProjectName =
				importedData.meta && importedData.meta.name
					? importedData.meta.name
					: file.name.replace(/\.(ecr|json)$/i, '')

			if (projects.includes(newProjectName)) {
				showCustomPrompt(
					'Конфликт имен',
					`Проект "${newProjectName}" уже существует. Введите новое имя:`,
					newProjectName + '_copy',
					function (confirmedName) {
						finishImport(importedData, confirmedName)
					}
				)
			} else {
				finishImport(importedData, newProjectName)
			}
		} catch (err) {
			console.error(err)
			showCustomAlert('Ошибка', 'Ошибка при чтении файла!')
		}
		event.target.value = ''
	}
	reader.readAsText(file)
}

function finishImport(data, name) {
	if (!data.meta) data.meta = {}
	data.meta.name = name
	const storageKey = `ecrous_data_${name}`
	localStorage.setItem(storageKey, JSON.stringify(data))

	if (!projects.includes(name)) {
		// 🔥 ИЗМЕНЕНИЕ: Новый (импортированный) проект добавляем в начало
		projects.unshift(name)
		saveProjects()
		renderProjects()
	}
	showCustomAlert('Успешно!', `Проект "${name}" успешно импортирован!`)
}

// ===============================
// Меню и Переименование
// ===============================

function toggleMenu(event, index) {
	event.stopPropagation()
	closeAllMenus()
	const menu = document.getElementById(`menu-${index}`)
	if (menu) menu.classList.toggle('active')
}

function closeAllMenus() {
	document
		.querySelectorAll('.menu-dropdown')
		.forEach(m => m.classList.remove('active'))
}

function renameProject(index) {
	const oldName = projects[index]
	showCustomPrompt(
		'Переименовать проект',
		'Введите новое название для проекта:',
		oldName,
		function (newName) {
			if (newName === oldName) return
			projects[index] = newName
			saveProjects()
			renderProjects()
		}
	)
}

// Проверка изменений
function checkProjectsChanges() {
	const storedProjects =
		JSON.parse(localStorage.getItem('ecrous_projects')) || []
	const currentLength = projects.length
	const storedLength = storedProjects.length
	if (storedLength !== currentLength) {
		projects = storedProjects
		updateCenterContainer()
	}
}
setInterval(checkProjectsChanges, 1000)

// ===============================
// Инициализация
// ===============================

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initProjects)
} else {
	setTimeout(initProjects, 100)
}

function initProjects() {
	const plusButton = document.querySelector('.plus-button')
	if (plusButton) plusButton.onclick = openCreateProject

	const importButton = document.querySelector('.import-button')
	if (importButton) importButton.onclick = importProject

	const submitBtn = document.getElementById('submitProject')
	if (submitBtn) {
		submitBtn.onclick = function () {
			const input = document.getElementById('projectName')
			if (!input) return
			const name = input.value.trim()
			if (name.length === 0) {
				alert('Введите название проекта!')
				return
			}

			// 🔥 ИЗМЕНЕНИЕ: Новый проект добавляем в начало (unshift)
			projects.unshift(name)
			saveProjects()
			renderProjects()
			closeCreateProject()
		}
	}

	window.onclick = function (event) {
		const modal = document.getElementById('projectModal')
		if (modal && event.target === modal) {
			modal.style.display = 'none'
		}
	}
	window.addEventListener('click', () => {
		closeAllMenus()
	})

	renderProjects()
	updateCenterContainer()
}

window.openMyProjects = openMyProjects
window.closeMyProjects = closeMyProjects
window.deleteProject = deleteProject
window.renameProject = renameProject
window.toggleMenu = toggleMenu
window.updateCenterContainer = updateCenterContainer
