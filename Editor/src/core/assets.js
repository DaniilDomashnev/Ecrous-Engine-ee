// src/core/assets.js

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('assetFileInput')
    if (fileInput) {
        fileInput.removeEventListener('change', handleAssetUpload)
        fileInput.addEventListener('change', handleAssetUpload)
    }
    // Рендер с задержкой
    setTimeout(renderAssetList, 200)
})

// === СОЗДАНИЕ СКРИПТА (НОВОЕ) ===
async function createScriptAsset() {
    // Убедимся, что массив существует
    if (!projectData.assets) projectData.assets = [];

    const name = await showCustomPrompt('Новый скрипт', 'Введите имя скрипта (без пробелов):', 'NewScript');
    if (!name) return;

    // Проверка на дубликаты (ищем только среди скриптов)
    const exists = projectData.assets.find(a => a.name === name && a.type === 'script');
    if (exists) {
        alert('Скрипт с таким именем уже существует!');
        return;
    }

    const script = {
        id: 'asset_' + Date.now() + Math.random().toString(36).substr(2, 4),
        name: name,
        type: 'script', // Тип ассета - скрипт
        data: '// NexLang Script\n// Доступ к объекту: this\n\nprint("Hello " + this.name);', // Код
        parentId: currentAssetFolderId, // Создаем в текущей папке
    }

    projectData.assets.push(script);

    // Сохраняем и обновляем UI
    if (typeof saveProjectToLocal === 'function') saveProjectToLocal();
    renderAssetList();

    // Сразу открываем редактор кода
    if (typeof setEditorMode === 'function') setEditorMode('code');
    
    // Небольшая задержка, чтобы редактор успел инициализироваться
    setTimeout(() => {
        if (typeof openScript === 'function') openScript(script.id);
    }, 100);
}

// === СОЗДАНИЕ ПАПКИ ===
async function createAssetFolder() {
    if (!projectData.folders) projectData.folders = []

    const name = await showCustomPrompt('Новая папка', 'Введите имя папки:')
    if (!name) return

    const folder = {
        id: 'folder_' + Date.now(),
        name: name,
        parentId: currentAssetFolderId,
    }

    projectData.folders.push(folder)

    if (typeof saveProjectToLocal === 'function') saveProjectToLocal()
    renderAssetList()
}

// === ПЕРЕИМЕНОВАНИЕ ПАПКИ ===
async function renameAssetFolder(folderId) {
    const folder = projectData.folders.find(f => f.id === folderId)
    if (!folder) return

    const newName = await showCustomPrompt(
        'Переименование',
        'Новое имя папки:',
        folder.name
    )

    if (newName && newName.trim() !== '') {
        folder.name = newName

        if (typeof saveProjectToLocal === 'function') saveProjectToLocal()
        renderAssetList()
    }
}

// === ПЕРЕИМЕНОВАНИЕ АССЕТА ===
async function renameAsset(assetId) {
    const asset = projectData.assets.find(a => a.id === assetId)
    if (!asset) return

    const newName = await showCustomPrompt(
        'Переименование файла',
        'Новое имя:',
        asset.name
    )

    if (newName && newName.trim() !== '') {
        asset.name = newName

        if (typeof saveProjectToLocal === 'function') saveProjectToLocal()
        renderAssetList()
    }
}

// === ЗАГРУЗКА ФАЙЛОВ ===
function handleAssetUpload(e) {
    const files = e.target.files
    if (!files.length) return

    if (!projectData.assets) projectData.assets = []

    Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onload = evt => {
            const base64 = evt.target.result

            let type = 'unknown'
            if (file.type.startsWith('image')) type = 'image'
            else if (file.type.startsWith('audio')) type = 'audio'
            else if (
                file.name.endsWith('.ttf') ||
                file.name.endsWith('.otf') ||
                file.name.endsWith('.woff')
            )
                type = 'font'

            const asset = {
                id: 'asset_' + Date.now() + Math.random().toString(36).substr(2, 4),
                name: file.name,
                type: type,
                data: base64,
                parentId: currentAssetFolderId,
            }

            projectData.assets.push(asset)

            renderAssetList()
            if (typeof saveProjectToLocal === 'function') saveProjectToLocal()
        }
        reader.readAsDataURL(file)
    })

    e.target.value = ''
}

// === НАВИГАЦИЯ ===
function openAssetFolder(folderId) {
    currentAssetFolderId = folderId
    renderAssetList()
}

function goUpAssetFolder() {
    const currentFolder = projectData.folders.find(
        f => f.id === currentAssetFolderId
    )
    if (currentFolder) {
        currentAssetFolderId = currentFolder.parentId
    } else {
        currentAssetFolderId = null
    }
    renderAssetList()
}

// === РЕНДЕРИНГ (ОБНОВЛЕННЫЙ) ===
function renderAssetList() {
    const container = document.getElementById('assetList')
    if (!container) return

    container.innerHTML = ''

    if (!projectData.assets) projectData.assets = []
    if (!projectData.folders) projectData.folders = []

    // 1. КНОПКА "НАЗАД"
    if (currentAssetFolderId !== null) {
        const backBtn = document.createElement('div')
        backBtn.className = 'list-item folder-back'
        backBtn.style.background = 'rgba(255,255,255,0.05)'
        backBtn.innerHTML = `<i class="ri-arrow-go-back-line"></i> <span style="font-weight:bold">...</span>`
        backBtn.onclick = goUpAssetFolder
        enableDropZone(backBtn, null, true)
        container.appendChild(backBtn)
    }

    // 2. ФИЛЬТРАЦИЯ
    const foldersToShow = projectData.folders.filter(
        f => f.parentId === currentAssetFolderId
    )
    const filesToShow = projectData.assets.filter(
        a => a.parentId == currentAssetFolderId
    )

    if (foldersToShow.length === 0 && filesToShow.length === 0) {
        const emptyMsg = document.createElement('div')
        emptyMsg.style.padding = '10px'
        emptyMsg.style.color = '#666'
        emptyMsg.style.fontSize = '11px'
        emptyMsg.style.textAlign = 'center'
        emptyMsg.innerText = 'Пусто'
        container.appendChild(emptyMsg)
    }

    // 3. РЕНДЕР ПАПОК
    foldersToShow.forEach(folder => {
			const item = document.createElement('div')
			item.className = 'list-item folder-item'
			item.draggable = true
			item.dataset.id = folder.id
			item.dataset.type = 'folder'

			item.innerHTML = `
            <i class="ri-folder-3-fill" style="color: #ffffff;"></i>
            <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; font-weight:600;">${folder.name}</span>
            
            <div style="display:flex; gap:8px; align-items:center;">
                <i class="ri-edit-line action-icon edit-btn" title="Переименовать"></i>
                <i class="ri-delete-bin-line action-icon delete-btn" style="color:var(--danger)" title="Удалить"></i>
            </div>
        `

			item.onclick = e => {
				if (!e.target.classList.contains('action-icon')) {
					openAssetFolder(folder.id)
				}
			}

			item.querySelector('.edit-btn').onclick = e => {
				e.stopPropagation()
				renameAssetFolder(folder.id)
			}

			item.querySelector('.delete-btn').onclick = e => {
				e.stopPropagation()
				deleteFolderRecursive(folder.id)
			}

			enableDropZone(item, folder.id, false)
			container.appendChild(item)
		})

    // 4. РЕНДЕР ФАЙЛОВ
    filesToShow.forEach(asset => {
			const item = document.createElement('div')
			item.className = 'list-item asset-item'
			item.draggable = true
			item.style.cursor = 'grab'
			item.dataset.id = asset.id
			item.dataset.type = 'asset'

			let icon = 'ri-file-line'
			let color = 'inherit'
			let editIconClass = 'ri-edit-line'
			let editTitle = 'Переименовать'

			// Определяем тип и иконку
			if (asset.type === 'image') icon = 'ri-image-line'
			else if (asset.type === 'audio') icon = 'ri-music-line'
			else if (asset.type === 'font') icon = 'ri-font-size'
			else if (asset.type === 'script') {
				// ОСОБЫЙ ВИД ДЛЯ СКРИПТОВ
				icon = 'ri-file-code-line'
				color = '#FFD700' // Золотой цвет
				editIconClass = 'ri-code-s-slash-line' // Иконка кода
				editTitle = 'Редактировать код'
			}

			item.innerHTML = `
            <i class="${icon}" style="color:${color}"></i>
            <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px;">${asset.name}</span>
            <div style="display:flex; gap:8px; align-items:center;">
                <i class="${editIconClass} action-icon edit-asset-btn" title="${editTitle}"></i>
                <i class="ri-delete-bin-line action-icon delete-asset-btn" title="Удалить" style="color:var(--danger)"></i>
            </div>
        `

			// DRAG & DROP
			item.ondragstart = e => {
				e.dataTransfer.setData('id', asset.id)
				e.dataTransfer.setData('text/plain', asset.id) // Для папок

				// Если это скрипт - особый тип для прикрепления к объектам
				if (asset.type === 'script') {
					e.dataTransfer.setData('type', 'script_attach')
				} else {
					e.dataTransfer.setData('type', 'asset_move')
				}
				e.dataTransfer.effectAllowed = 'all'
			}

			// КЛИК
			item.onclick = e => {
				if (!e.target.classList.contains('action-icon')) {
					// Если скрипт - открываем код, иначе копируем ID
					if (asset.type === 'script') {
						if (typeof setEditorMode === 'function') setEditorMode('code')
						if (typeof openScript === 'function') openScript(asset.id)
					} else {
						navigator.clipboard.writeText(asset.id)
						if (typeof showNotification === 'function')
							showNotification('ID скопирован')
					}
				}
			}

			// КНОПКА РЕДАКТИРОВАНИЯ
			item.querySelector('.edit-asset-btn').onclick = e => {
				e.stopPropagation()
				if (asset.type === 'script') {
					// Открываем редактор кода
					if (typeof setEditorMode === 'function') setEditorMode('code')
					if (typeof openScript === 'function') openScript(asset.id)
				} else {
					// Обычное переименование
					renameAsset(asset.id)
				}
			}

			// КНОПКА УДАЛЕНИЯ
			item.querySelector('.delete-asset-btn').onclick = e => {
				e.stopPropagation()
				if (confirm('Удалить файл?')) {
					projectData.assets = projectData.assets.filter(a => a.id !== asset.id)
					renderAssetList()
					if (typeof saveProjectToLocal === 'function') saveProjectToLocal()
				}
			}

			container.appendChild(item)
		})

    initMobileAssetDrag()
}

// === DRAG & DROP & DELETE ===

function enableDropZone(element, targetFolderId, isBackBtn) {
    element.ondragover = e => {
        e.preventDefault()
        // Подсвечиваем только если тащим файл в папку, а не скрипт на объект
        const type = e.dataTransfer.getData('type')
        if (type === 'asset_move' || type === 'script_attach') { 
             // Скрипты тоже можно класть в папки, так что разрешаем
             element.style.background = 'rgba(255, 255, 255, 0.1)'
        }
    }

    element.ondragleave = e => {
        element.style.background = ''
    }

    element.ondrop = e => {
        e.preventDefault()
        element.style.background = ''

        // Получаем ID (он в text/plain для совместимости)
        const id = e.dataTransfer.getData('text/plain')
        // const type = e.dataTransfer.getData('type') // Можно проверить тип, если нужно

        const asset = projectData.assets.find(a => a.id === id)
        
        if (asset) {
            if (isBackBtn) {
                const currentFolder = projectData.folders.find(
                    f => f.id === currentAssetFolderId
                )
                asset.parentId = currentFolder ? currentFolder.parentId : null
            } else {
                // Нельзя положить папку или файл в самого себя (простая проверка)
                if (asset.id !== targetFolderId) {
                    asset.parentId = targetFolderId
                }
            }

            renderAssetList()
            if (typeof saveProjectToLocal === 'function') saveProjectToLocal()
        }
    }
}

async function deleteFolderRecursive(folderId) {
    if (!confirm('Удалить папку и ВСЕ файлы внутри неё?')) return

    const foldersToDelete = [folderId]

    const findChildren = parentId => {
        const children = projectData.folders.filter(f => f.parentId === parentId)
        children.forEach(child => {
            foldersToDelete.push(child.id)
            findChildren(child.id)
        })
    }
    findChildren(folderId)

    projectData.assets = projectData.assets.filter(
        a => !foldersToDelete.includes(a.parentId)
    )
    projectData.folders = projectData.folders.filter(
        f => !foldersToDelete.includes(f.id)
    )

    if (foldersToDelete.includes(currentAssetFolderId)) {
        currentAssetFolderId = null
    }

    renderAssetList()
    if (typeof saveProjectToLocal === 'function') saveProjectToLocal()
}

// Функция для мобильного перетаскивания (Touch API)
function initMobileAssetDrag() {
    const items = document.querySelectorAll('.asset-item, .folder-item');
    let draggedClone = null;
    let draggedOrigin = null;
    let touchOffsetX = 0;
    let touchOffsetY = 0;

    items.forEach(item => {
        // Защита от повторного навешивания
        if(item.dataset.touchEnabled) return;
        item.dataset.touchEnabled = "true";

        item.addEventListener('touchstart', (e) => {
            // Не тащим, если нажали на кнопку редактирования/удаления
            if (e.target.closest('.action-icon')) return;

            const touch = e.touches[0];
            draggedOrigin = item;
            
            // Создаем визуальный клон
            draggedClone = item.cloneNode(true);
            draggedClone.style.position = 'fixed';
            draggedClone.style.opacity = '0.8';
            draggedClone.style.zIndex = '9999';
            draggedClone.style.pointerEvents = 'none'; // Чтобы клон не перекрывал поиск элемента под ним
            draggedClone.style.width = item.offsetWidth + 'px';
            
            // Вычисляем смещение пальца относительно угла элемента
            const rect = item.getBoundingClientRect();
            touchOffsetX = touch.clientX - rect.left;
            touchOffsetY = touch.clientY - rect.top;

            // Ставим клон под палец
            draggedClone.style.left = (touch.clientX - touchOffsetX) + 'px';
            draggedClone.style.top = (touch.clientY - touchOffsetY) + 'px';
            
            document.body.appendChild(draggedClone);
        }, {passive: false});

        item.addEventListener('touchmove', (e) => {
            if (!draggedClone) return;
            e.preventDefault(); // Блокируем скролл страницы пока тащим
            
            const touch = e.touches[0];
            draggedClone.style.left = (touch.clientX - touchOffsetX) + 'px';
            draggedClone.style.top = (touch.clientY - touchOffsetY) + 'px';
        }, {passive: false});

        item.addEventListener('touchend', (e) => {
            if (!draggedClone) return;

            // Убираем клон
            document.body.removeChild(draggedClone);
            draggedClone = null;

            // Определяем, над чем отпустили палец
            const touch = e.changedTouches[0];
            // Ищем элемент под пальцем. Скрываем оригинал на мгновение, если нужно, но pointer-events: none у клона решает проблему
            let target = document.elementFromPoint(touch.clientX, touch.clientY);
            
            // Ищем ближайшую папку или кнопку "назад"
            const folderTarget = target.closest('.folder-item') || target.closest('.folder-back');

            if (folderTarget && draggedOrigin) {
                // Эмулируем событие DROP
                // Нам нужно достать ID из оригинального элемента, но у нас нет DataTransfer.
                // Придется вручную вызвать логику перемещения.
                
                // 1. Получаем ID перетаскиваемого
                // В renderAssetList мы не храним ID в data-атрибутах, но можем достать его из события click или переделать рендер.
                // ХАК: Давай найдем ID в массиве projectData по имени, так как в твоем коде item.onclick использует замыкание.
                // ЛУЧШЕ: В renderAssetList добавь item.dataset.id = asset.id;
                
                // ДЛЯ РАБОТЫ ЭТОГО КОДА НУЖНО НЕМНОГО ПОПРАВИТЬ renderAssetList (см. ниже)
                const sourceId = draggedOrigin.dataset.id;
                const sourceType = draggedOrigin.dataset.type; // 'asset' или 'folder'
                
                // Получаем ID цели (папки)
                const targetId = folderTarget.dataset.id; // null для кнопки назад

                if (sourceId && sourceId !== targetId) {
                    // Вызываем логику перемещения напрямую
                    handleMobileDrop(sourceId, targetId);
                }
            }

            draggedOrigin = null;
        });
    });
}

// Логика обработки броска (копия логики из enableDropZone)
function handleMobileDrop(assetId, targetFolderId) {
    let item = projectData.assets.find(a => a.id === assetId);
    if (!item) {
        // Если не нашли в ассетах, ищем в папках (если перетаскиваем папку)
        item = projectData.folders.find(f => f.id === assetId);
    }

    if (item) {
        // Если бросили на кнопку "Назад" (...), targetFolderId будет undefined/null
        if (!targetFolderId) {
            const currentFolder = projectData.folders.find(f => f.id === currentAssetFolderId);
            item.parentId = currentFolder ? currentFolder.parentId : null;
        } else {
            item.parentId = targetFolderId;
        }

        saveProjectToLocal();
        renderAssetList();
    }
}
