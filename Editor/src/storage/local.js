// ==========================================
// --- STORAGE SYSTEM (LocalStorage + IndexedDB) ---
// ==========================================

const DB_NAME = 'EcrousAssetsDB'
const DB_VERSION = 1
const STORE_NAME = 'assets'

// --- Хелперы для IndexedDB ---
function openAssetsDB() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION)
		request.onupgradeneeded = e => {
			const db = e.target.result
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME)
			}
		}
		request.onsuccess = e => resolve(e.target.result)
		request.onerror = e => reject(e.target.error)
	})
}

async function saveAssetsToDB(projectName, assets) {
	const db = await openAssetsDB()
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite')
		const store = tx.objectStore(STORE_NAME)
		const request = store.put(assets, projectName) // Ключ - имя проекта

		request.onsuccess = () => resolve()
		request.onerror = e => reject(e.target.error)
	})
}

async function loadAssetsFromDB(projectName) {
	const db = await openAssetsDB()
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readonly')
		const store = tx.objectStore(STORE_NAME)
		const request = store.get(projectName)

		request.onsuccess = () => resolve(request.result || [])
		request.onerror = e => reject(e.target.error)
	})
}

// ==========================================
// --- ОСНОВНЫЕ ФУНКЦИИ СОХРАНЕНИЯ ---
// ==========================================

async function saveProjectToLocal() {
	// 1. Сначала обновляем данные из редактора
	if (typeof saveCurrentWorkspace === 'function') saveCurrentWorkspace()

	// 2. Подготовка данных
	// Мы ВРЕМЕННО извлекаем ассеты из объекта projectData, чтобы не пихать их в localStorage
	const assetsBackup = projectData.assets || []

	// Создаем легкую копию проекта БЕЗ ассетов для localStorage
	const lightProjectData = { ...projectData, assets: [] }

	try {
		// 3. Сохраняем ассеты в IndexedDB (безлимитное хранилище)
		await saveAssetsToDB(currentProjectName, assetsBackup)

		// 4. Сохраняем структуру проекта в LocalStorage (легкие данные)
		localStorage.setItem(STORAGE_KEY, JSON.stringify(lightProjectData))

		// 5. Восстанавливаем ассеты в памяти (чтобы редактор продолжал работать)
		projectData.assets = assetsBackup

		if (typeof showNotification === 'function') {
			const sizeMB = (
				new Blob([JSON.stringify(assetsBackup)]).size /
				1024 /
				1024
			).toFixed(2)
			showNotification(
				`Проект сохранен! (Ассеты: ${sizeMB} MB)`,
				'ri-save-3-line'
			)
		} else {
			console.log('Проект сохранен')
		}
	} catch (e) {
		console.error('Ошибка сохранения:', e)
		// Если ошибка, восстанавливаем ассеты в памяти, чтобы ничего не пропало
		projectData.assets = assetsBackup
		alert(
			'Ошибка сохранения! Возможно, закончилось место на диске.\n' + e.message
		)
	}
}

async function loadProjectFromLocal() {
	try {
		// 1. Загружаем структуру из LocalStorage
		const json = localStorage.getItem(STORAGE_KEY)

		if (json) {
			projectData = JSON.parse(json)

			// 2. Асинхронно подгружаем тяжелые ассеты из базы данных
			const assets = await loadAssetsFromDB(currentProjectName)
			projectData.assets = assets || []

			// Проверка целостности
			if (!projectData.scenes || projectData.scenes.length === 0) return

			// Восстанавливаем состояние редактора
			activeSceneId = projectData.scenes[0].id
			const firstObj = projectData.scenes[0].objects[0]
			activeObjectId = firstObj ? firstObj.id : null

			if (typeof renderSidebar === 'function') renderSidebar()
			if (typeof loadWorkspace === 'function') loadWorkspace()

			// Обновляем список ассетов в UI, если он уже отрисован
			if (typeof renderAssetList === 'function') renderAssetList()

			console.log(`Проект загружен. Ассетов: ${projectData.assets.length}`)
		} else {
			projectData = null // Маркер нового проекта
		}
	} catch (e) {
		console.error('Ошибка загрузки:', e)
		alert('Не удалось загрузить проект.')
		projectData = null
	}
}

function saveCurrentWorkspace() {
	// Эта функция остается без изменений, она собирает данные со сцены
	if (typeof getActiveObject !== 'function') return

	const currentObj = getActiveObject()
	if (!currentObj) return

	const data = []
	document.querySelectorAll('.node-block').forEach(el => {
		const inputs = Array.from(el.querySelectorAll('input')).map(i => i.value)
		data.push({
			id: el.id,
			type: el.dataset.type,
			x: parseFloat(el.style.left),
			y: parseFloat(el.style.top),
			disabled: el.classList.contains('disabled'),
			collapsed: el.classList.contains('collapsed'),
			values: inputs,
		})
	})

	currentObj.scripts = data
	// connections - глобальная переменная из main.js
	if (typeof connections !== 'undefined') {
		currentObj.connections = [...connections]
	}
}

// Эта функция нужна для inicialization.js, чтобы восстановить провода
function loadWorkspace() {
	if (typeof container === 'undefined' || !container) return

	container.innerHTML = ''
	const svgLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
	svgLayer.setAttribute('id', 'connections-layer')
	svgLayer.style.overflow = 'visible'
	container.appendChild(svgLayer)

	const currentObj = getActiveObject()
	if (!currentObj) return

	if (currentObj.scripts && typeof createBlock === 'function') {
		currentObj.scripts.forEach(b => createBlock(b.type, 0, 0, b))
	}

	connections = currentObj.connections || []

	if (typeof setEditorMode === 'function') setEditorMode(editorMode)
	if (editorMode === 'nodes' && typeof updateAllConnections === 'function') {
		setTimeout(updateAllConnections, 50)
	}
}
