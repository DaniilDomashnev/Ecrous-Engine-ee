// Текущий открытый скрипт (ID ассета)
let activeScriptId = null

document.addEventListener('DOMContentLoaded', () => {
	// Убираем старую инициализацию projectData.scripts, теперь используем assets

	const btnCode = document.getElementById('btnModeCode')

	// --- КНОПКИ УПРАВЛЕНИЯ ---

	// 1. Создать скрипт (Вызывает функцию из assets.js)
	const btnCreate = document.getElementById('btnCreateScript')
	if (btnCreate) {
		btnCreate.onclick = () => {
			// Используем глобальную функцию создания ассета
			if (typeof createScriptAsset === 'function') {
				createScriptAsset()
			} else {
				alert('Функция createScriptAsset не найдена!')
			}
		}
	}

	// 2. Закрыть редактор (Крестик)
	document.getElementById('btnCloseEditor').onclick = () => {
		saveCurrentScript() // Обновляем память

		// --- ИСПРАВЛЕНИЕ: Сохраняем на диск ---
		if (typeof saveProjectToLocal === 'function') saveProjectToLocal()
		// -------------------------------------

		setEditorMode('nodes')
	}

	// 3. Сохранить (Кнопка дискеты)
	document.getElementById('btnSaveScript').onclick = () => {
		saveCurrentScript() // Обновляем память

		// --- ИСПРАВЛЕНИЕ: Сохраняем на диск ---
		if (typeof saveProjectToLocal === 'function') {
			saveProjectToLocal()
			if (typeof showNotification === 'function')
				showNotification('Скрипт сохранен на диск')
		} else {
			console.error('Функция saveProjectToLocal не найдена!')
		}
		// -------------------------------------
	}

	// 4. Открытие редактора (Кнопка в меню)
	if (btnCode) {
		btnCode.onclick = () => {
			setEditorMode('code')
			renderScriptListInternal()
			// Если скрипт был открыт, открываем его снова
			if (activeScriptId) openScript(activeScriptId)
		}
	}

	// --- РЕДАКТОР ---
	const inputArea = document.getElementById('nexlangInput')
	const linesArea = document.getElementById('codeLines')

	inputArea.addEventListener('input', () => {
		updateLineNumbers()
	})
	inputArea.addEventListener('scroll', () => {
		linesArea.scrollTop = inputArea.scrollTop
	})

	inputArea.addEventListener('keydown', function (e) {
		if (e.key == 'Tab') {
			e.preventDefault()
			const start = this.selectionStart
			const end = this.selectionEnd
			this.value =
				this.value.substring(0, start) + '\t' + this.value.substring(end)
			this.selectionStart = this.selectionEnd = start + 1
			updateLineNumbers()
		}
	})

	function updateLineNumbers() {
		const lines = inputArea.value.split('\n').length
		linesArea.innerHTML = Array(lines)
			.fill(0)
			.map((_, i) => i + 1)
			.join('<br>')
	}
})

// === ФУНКЦИИ ЛОГИКИ ===

// Рендерим список ТОЛЬКО скриптов внутри IDE (левая колонка в режиме кода)
function renderScriptListInternal() {
    const container = document.getElementById('script-list')
    if (!container) return;
    container.innerHTML = ''

    if (!projectData.assets) projectData.assets = []
    
    // Фильтруем только скрипты
    const scripts = projectData.assets.filter(a => a.type === 'script');

    scripts.forEach(script => {
        const el = document.createElement('div')
        el.className = `script-item ${activeScriptId === script.id ? 'active' : ''}`
        el.innerHTML = `
            <span><i class="ri-file-code-line"></i> ${script.name}</span>
            <i class="ri-delete-bin-line" style="color:#ff4444; opacity:0.6;" onclick="deleteScriptAssetInternal('${script.id}', event)"></i>
        `
        el.onclick = e => {
            if (e.target.classList.contains('ri-delete-bin-line')) return
            saveCurrentScript()
            openScript(script.id)
        }
        container.appendChild(el)
    })
}

// Теперь открываем по ID
function openScript(id) {
    const script = projectData.assets.find(s => s.id === id && s.type === 'script')
    if (!script) return

    activeScriptId = id
    const fileNameEl = document.getElementById('current-file-name');
    if (fileNameEl) fileNameEl.textContent = script.name + '.nx'

    const area = document.getElementById('nexlangInput')
    area.value = script.data || '' // Код хранится в data
    area.disabled = false

    // Обновляем UI списка, чтобы подсветить активный
    renderScriptListInternal()
    area.dispatchEvent(new Event('input'))
}

function saveCurrentScript() {
    if (!activeScriptId) return
    const script = projectData.assets.find(s => s.id === activeScriptId)
    const area = document.getElementById('nexlangInput')

    if (script && area) {
        script.data = area.value
    }
}

// Удаление изнутри редактора
window.deleteScriptAssetInternal = function (id, event) {
	event.stopPropagation()
	if (!confirm(`Удалить этот скрипт?`)) return

	// 1. Удаляем из памяти (assets)
	projectData.assets = projectData.assets.filter(s => s.id !== id)

	// 2. Сбрасываем UI если открыт этот скрипт
	if (activeScriptId === id) {
		activeScriptId = null
		document.getElementById('nexlangInput').value = ''
		const fnEl = document.getElementById('current-file-name')
		if (fnEl) fnEl.textContent = 'No file selected'
	}

	renderScriptListInternal()

	// --- ИСПРАВЛЕНИЕ: Сохраняем изменения на диск ---
	if (typeof saveProjectToLocal === 'function') saveProjectToLocal()
	// -----------------------------------------------

	// Обновляем общий список ассетов
	if (typeof renderAssetList === 'function') renderAssetList()
}
// Делаем глобальной для вызова при переключении режима
window.loadCodeToEditor = renderScriptListInternal;
window.openScript = openScript;
