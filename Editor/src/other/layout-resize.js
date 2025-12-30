//==========================================
// // --- ИЗМЕНЕНИЕ РАЗМЕРА ИНТЕРФЕЙСА ---
// ==========================================

function initResizableLayout() {
    // --- 1. ЛЕВЫЙ САЙДБАР (Sidebar) ---
    initPanelResize({
        panelId: 'mainSidebar',
        resizerId: 'sidebarResizer',
        storageKey: 'ecrous_layout_sidebar_width',
        direction: 'right', // Тянем вправо -> увеличивается
        min: 200,
        max: 600
    });

    // --- 2. ПРАВЫЙ ТУЛБОКС (Toolbox) ---
    initPanelResize({
        panelId: null, // Ищем по классу, так как ID у тулбокса нет в HTML, или добавьте id="mainToolbox" в HTML
        panelSelector: '.toolbox', 
        resizerId: 'toolboxResizer',
        storageKey: 'ecrous_layout_toolbox_width',
        direction: 'left', // Тянем влево -> увеличивается
        min: 200,
        max: 500
    });

    // --- 3. СБРОС (Reset) ---
    const resetBtn = document.getElementById('winResetLayout');
    if (resetBtn) {
        // Удаляем старые, чтобы не дублировать
        const newBtn = resetBtn.cloneNode(true);
        resetBtn.parentNode.replaceChild(newBtn, resetBtn);

        newBtn.addEventListener('click', () => {
            localStorage.removeItem('ecrous_layout_sidebar_width');
            localStorage.removeItem('ecrous_layout_toolbox_width');
            localStorage.removeItem('ecrous_ui_toolbox_closed');

            // Сброс стилей
            const sb = document.getElementById('mainSidebar');
            if(sb) sb.style.width = '';
            
            const tb = document.querySelector('.toolbox');
            if(tb) {
                tb.style.width = '';
                tb.classList.remove('closed');
            }

            if (typeof showNotification === 'function') {
                showNotification('Интерфейс сброшен');
            }
        });
    }
}

// Универсальная функция для ресайза
function initPanelResize({ panelId, panelSelector, resizerId, storageKey, direction, min, max }) {
    const panel = panelId ? document.getElementById(panelId) : document.querySelector(panelSelector);
    const resizer = document.getElementById(resizerId);

    if (!panel || !resizer) return;

    // 1. Загрузка
    const savedWidth = localStorage.getItem(storageKey);
    if (savedWidth) {
        panel.style.width = savedWidth + 'px';
    }

    // 2. Логика
    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        resizer.classList.add('active');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        let newWidth;

        if (direction === 'right') {
            // Для левой панели: ширина = X мыши
            newWidth = e.clientX; 
        } else {
            // Для правой панели: ширина = ШиринаОкна - X мыши
            newWidth = window.innerWidth - e.clientX;
        }

        if (newWidth < min) newWidth = min;
        if (newWidth > max) newWidth = max;

        panel.style.width = newWidth + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            resizer.classList.remove('active');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            
            // Сохраняем
            localStorage.setItem(storageKey, parseInt(panel.style.width));
        }
    });
}

