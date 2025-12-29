// ===============================
// TabbyAI Logic v10.2 (Gemini API Integration)
// ===============================

// --- 1. DOM ELEMENTS ---

// Chat & Layout
const chatList = document.getElementById('messages-list')
const userInput = document.getElementById('user-input')
const sendBtn = document.getElementById('send-btn')
const chatWindow = document.getElementById('chat-window')
const themeToggle = document.getElementById('theme-toggle')
const modelSelect = document.getElementById('model-select')

// Sidebar
const menuBtn = document.getElementById('menu-btn')
const sidebar = document.getElementById('sidebar')
const sidebarOverlay = document.getElementById('sidebar-overlay')
const closeSidebarBtn = document.getElementById('close-sidebar')
const newChatBtn = document.getElementById('new-chat-btn')
const sessionsListEl = document.getElementById('sessions-list')
const clearAllBtn = document.getElementById('clear-all-btn')

// Version Selector
const versionMenuBtn = document.getElementById('version-menu-btn')
const currentVersionText = document.getElementById('current-version-text')
const versionModal = document.getElementById('version-modal-overlay')
const versionListContainer = document.getElementById('versions-list-container')
const closeVersionModalBtn = document.getElementById('close-version-modal-btn')

// Delete All Modal
const clearAllOverlay = document.getElementById('clear-all-overlay')
const confirmClearAllBtn = document.getElementById('confirm-clear-all-btn')
const cancelClearBtn = document.getElementById('cancel-clear-btn')

// Delete Single Modal
const deleteOverlay = document.getElementById('delete-modal-overlay')
const confirmDeleteBtn = document.getElementById('confirm-delete-chat-btn')
const cancelDeleteBtn = document.getElementById('cancel-delete-btn')

// PRO Modal Elements (Old & New)
const openModalBtn = document.getElementById('open-pro-modal')
const cancelProBtn = document.getElementById('cancel-pro-btn')
const planBadge = document.getElementById('plan-badge')
const alreadyProOverlay = document.getElementById('already-pro-modal-overlay')

// Activation Modal
const modalActivateOverlay = document.getElementById('modal-overlay')
const closeModalBtn = document.getElementById('close-modal')
const activateBtn = document.getElementById('activate-btn')
const licenseInput = document.getElementById('license-key')
const errorMsg = document.getElementById('key-error')

// Cancel Modal
const modalCancelOverlay = document.getElementById('cancel-overlay')
const confirmCancelBtn = document.getElementById('confirm-cancel-btn')
const keepSubBtn = document.getElementById('keep-sub-btn')

// Upgrade Modal (New)
const upgradeModalOverlay = document.getElementById('upgrade-modal-overlay')
const closeUpgradeBtn = document.getElementById('close-upgrade-btn')
const menuUpgradeBtn = document.getElementById('menu-upgrade')
const confirmUpgradeBtn = document.getElementById('confirm-upgrade-btn')

// API Key Elements (New)
const apiKeyInput = document.getElementById('setting-api-key')
const saveKeyBtn = document.getElementById('save-key-btn')

// --- 2. STATE & CONFIG ---

const AVAILABLE_VERSIONS = [
	{
		id: '3.1',
		name: 'TabbyAI v3.1',
		desc: 'Powered by Gemini 1.5',
		tag: 'new',
	},
	{
		id: '2.0-alfa',
		name: 'TabbyAI v2.0',
		desc: 'Next Gen Architecture',
		tag: 'new',
	},
	{
		id: '1.5',
		name: 'TabbyAI v1.5',
		desc: 'Latest Intelligence & Context',
		tag: 'stable',
	},
	{
		id: '1.4.4',
		name: 'TabbyAI v1.4.4',
		desc: 'Improved Stability',
		tag: 'old',
	},
	{ id: '1.4', name: 'TabbyAI v1.4', desc: 'Standard Model', tag: 'old' },
	{ id: '1.3', name: 'TabbyAI v1.3', desc: 'Legacy Core', tag: 'old' },
]

let activeDB = {}
let proDB = {}
let currentModel = 'standard'
let currentVersion = '1.3'
let isPro = false
const PRO_KEY = 'TABBY-PRO'

let sessions = []
let currentSessionId = null
let isGenerating = false
let chatToDeleteId = null

// --- 3. INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
	// A. Theme Init
	const savedTheme = localStorage.getItem('tabby-theme') || 'light'
	document.documentElement.setAttribute('data-theme', savedTheme)

	// B. PRO Status Init
	const savedStatus = localStorage.getItem('tabby-pro-status')
	if (savedStatus === 'true') {
		isPro = true
		document.body.classList.add('is-pro')
		if (planBadge) {
			planBadge.textContent = 'PRO'
			planBadge.classList.replace('badge-free', 'badge-pro')
		}
		if (openModalBtn) openModalBtn.classList.add('hidden')
		if (cancelProBtn) cancelProBtn.classList.remove('hidden')

		if (modelSelect) {
			const options = modelSelect.querySelectorAll('option')
			options.forEach(opt => (opt.disabled = false))
		}
	}

	// C. Version Init
	const savedVersion = localStorage.getItem('tabby-version')
	if (savedVersion) currentVersion = savedVersion
	initVersionUI()

	// D. Load Data
	loadSessions()
	loadKnowledgeBase()

	// E. API Key Init
	const savedKey = localStorage.getItem('tabby-api-key')
	if (savedKey && apiKeyInput) {
		apiKeyInput.value = savedKey
	}

	// F. Listeners for API Key
	if (saveKeyBtn && apiKeyInput) {
		saveKeyBtn.addEventListener('click', () => {
			const val = apiKeyInput.value.trim()
			if (val) {
				localStorage.setItem('tabby-api-key', val)
				alert('Ключ сохранен! Теперь можно выбрать модель Gemini Real.')
			} else {
				alert('Введите ключ перед сохранением.')
			}
		})
	}
})

// --- 4. VERSION SYSTEM LOGIC ---

function initVersionUI() {
	if (!currentVersionText) return
	const found =
		AVAILABLE_VERSIONS.find(v => v.id === currentVersion) ||
		AVAILABLE_VERSIONS[0]
	currentVersionText.textContent = found.name
}

if (versionMenuBtn) {
	versionMenuBtn.addEventListener('click', () => {
		renderVersionList()
		if (versionModal) versionModal.classList.remove('hidden')
	})
}

if (closeVersionModalBtn) {
	closeVersionModalBtn.addEventListener('click', () => {
		if (versionModal) versionModal.classList.add('hidden')
	})
}
if (versionModal) {
	versionModal.addEventListener('click', e => {
		if (e.target === versionModal) versionModal.classList.add('hidden')
	})
}

function renderVersionList() {
	if (!versionListContainer) return
	versionListContainer.innerHTML = ''

	const groups = {}
	AVAILABLE_VERSIONS.forEach(ver => {
		const generation = ver.id.split('.')[0]
		const groupName = `Generation ${generation}.x`
		if (!groups[groupName]) groups[groupName] = []
		groups[groupName].push(ver)
	})

	Object.keys(groups)
		.sort()
		.reverse()
		.forEach(groupName => {
			const titleEl = document.createElement('div')
			titleEl.className = 'version-category-title'
			titleEl.textContent = groupName
			versionListContainer.appendChild(titleEl)

			groups[groupName].forEach(ver => {
				const item = document.createElement('div')
				const isActive = ver.id === currentVersion
				item.className = `version-item ${isActive ? 'active' : ''}`

				let tagHtml = ''
				if (ver.tag === 'new')
					tagHtml = '<span class="v-tag tag-new">NEW</span>'
				else if (ver.tag === 'stable')
					tagHtml = '<span class="v-tag tag-stable">STABLE</span>'
				else tagHtml = '<span class="v-tag tag-old">OLD</span>'

				item.innerHTML = `
                <div class="v-info">
                    <span class="v-title">${ver.name} ${tagHtml}</span>
                    <span class="v-desc">${ver.desc}</span>
                </div>
                <div class="v-check">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
            `
				item.onclick = () => switchVersion(ver)
				versionListContainer.appendChild(item)
			})
		})
}

function switchVersion(verObj) {
	if (currentVersion === verObj.id) {
		versionModal.classList.add('hidden')
		return
	}
	currentVersion = verObj.id
	localStorage.setItem('tabby-version', currentVersion)
	if (currentVersionText) currentVersionText.textContent = verObj.name
	versionModal.classList.add('hidden')
	loadKnowledgeBase(true)
}

function loadKnowledgeBase(isSwitching = false) {
	let fileToFetch = 'free.json'

	// Если версия 3.1 - грузим Gemini базу
	if (currentVersion === '3.1') {
		fileToFetch = 'gemini.json'
	}

	Promise.all([
		fetch(fileToFetch).then(r => (r.ok ? r.json() : {})),
		fetch('pro.json').then(r => (r.ok ? r.json() : {})),
	])
		.then(([activeData, proData]) => {
			activeDB = activeData
			proDB = proData

			if (isSwitching) {
				let sysMsg = `System: База знаний переключена на версию <b>${currentVersion}</b>`
				if (currentVersion === '3.1') {
					sysMsg += `<br><span style="color:var(--accent)">✨ Gemini Module Activated</span>`
				}
				addSystemNote(sysMsg)
			} else {
				checkChatState()
			}
		})
		.catch(err => {
			console.warn('DB Load Error:', err)
			checkChatState()
		})
}

// --- 5. SIDEBAR & SESSIONS ---

function toggleSidebar(show) {
	if (!sidebar || !sidebarOverlay) return
	if (show) {
		sidebar.classList.add('open')
		sidebarOverlay.classList.remove('hidden')
	} else {
		sidebar.classList.remove('open')
		sidebarOverlay.classList.add('hidden')
	}
}

if (menuBtn)
	menuBtn.addEventListener('click', () => {
		renderSessionsList()
		toggleSidebar(true)
	})
if (closeSidebarBtn)
	closeSidebarBtn.addEventListener('click', () => toggleSidebar(false))
if (sidebarOverlay)
	sidebarOverlay.addEventListener('click', () => toggleSidebar(false))

if (newChatBtn)
	newChatBtn.addEventListener('click', () => {
		createNewSession()
		toggleSidebar(false)
		if (window.innerWidth <= 600 && userInput) userInput.focus()
	})

if (clearAllBtn) {
	clearAllBtn.addEventListener('click', () => {
		toggleSidebar(false)
		if (clearAllOverlay) clearAllOverlay.classList.remove('hidden')
		else if (confirm('Удалить всё?')) performClearAll()
	})
}

if (cancelClearBtn) {
	cancelClearBtn.addEventListener('click', () => {
		if (clearAllOverlay) clearAllOverlay.classList.add('hidden')
	})
}
if (clearAllOverlay) {
	clearAllOverlay.addEventListener('click', e => {
		if (e.target === clearAllOverlay) clearAllOverlay.classList.add('hidden')
	})
}
if (confirmClearAllBtn) {
	confirmClearAllBtn.addEventListener('click', () => {
		performClearAll()
		if (clearAllOverlay) clearAllOverlay.classList.add('hidden')
		addMessage('System: Вся история была удалена.', 'bot')
	})
}

function performClearAll() {
	sessions = []
	localStorage.removeItem('tabby-sessions')
	createNewSession()
	renderSessionsList()
}

function requestDeleteSession(id, event) {
	event.stopPropagation()
	chatToDeleteId = id
	if (deleteOverlay) deleteOverlay.classList.remove('hidden')
	else {
		if (confirm('Удалить этот чат?')) performDelete(id)
	}
}

if (cancelDeleteBtn) {
	cancelDeleteBtn.addEventListener('click', () => {
		if (deleteOverlay) deleteOverlay.classList.add('hidden')
		chatToDeleteId = null
	})
}

if (deleteOverlay) {
	deleteOverlay.addEventListener('click', e => {
		if (e.target === deleteOverlay) {
			deleteOverlay.classList.add('hidden')
			chatToDeleteId = null
		}
	})
}

if (confirmDeleteBtn) {
	confirmDeleteBtn.addEventListener('click', () => {
		if (chatToDeleteId) {
			performDelete(chatToDeleteId)
		}
		if (deleteOverlay) deleteOverlay.classList.add('hidden')
		chatToDeleteId = null
	})
}

function performDelete(id) {
	sessions = sessions.filter(s => s.id !== id)
	if (id === currentSessionId) {
		if (sessions.length > 0) loadSession(sessions[0].id)
		else createNewSession()
	}
	saveSessions()
	renderSessionsList()
}

function loadSessions() {
	const stored = localStorage.getItem('tabby-sessions')
	if (stored) {
		try {
			sessions = JSON.parse(stored)
		} catch (e) {
			sessions = []
		}
	}
	if (!Array.isArray(sessions) || sessions.length === 0) {
		createNewSession(false)
	} else {
		const savedId = localStorage.getItem('tabby-current-id')
		const exists = sessions.find(s => s.id == savedId)
		if (exists) loadSession(exists.id)
		else loadSession(sessions[0].id)
	}
}

function saveSessions() {
	localStorage.setItem('tabby-sessions', JSON.stringify(sessions))
	localStorage.setItem('tabby-current-id', currentSessionId)
}

function createNewSession(render = true) {
	const newId = Date.now().toString()
	const newSession = {
		id: newId,
		title: 'Новый чат',
		messages: [],
		timestamp: Date.now(),
	}
	sessions.unshift(newSession)
	loadSession(newId)
	if (render) renderSessionsList()
}

function loadSession(id) {
	currentSessionId = id
	const session = sessions.find(s => s.id === id)
	if (chatList) chatList.innerHTML = ''
	if (session) {
		session.messages.forEach(msg => renderMessage(msg.text, msg.role))
	}
	saveSessions()
	checkChatState()
}

function updateSessionTitle(text) {
	const session = sessions.find(s => s.id === currentSessionId)
	if (session && session.title === 'Новый чат') {
		session.title = text.substring(0, 30) + (text.length > 30 ? '...' : '')
		saveSessions()
	}
}

function renderSessionsList() {
	if (!sessionsListEl) return
	sessionsListEl.innerHTML = ''
	sessions.forEach(session => {
		const div = document.createElement('div')
		div.className = `chat-item ${
			session.id === currentSessionId ? 'active' : ''
		}`
		div.onclick = () => {
			loadSession(session.id)
			toggleSidebar(false)
		}
		div.innerHTML = `
            <div class="chat-title">${session.title}</div>
            <button class="delete-chat-btn" title="Удалить чат">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        `
		const btn = div.querySelector('.delete-chat-btn')
		btn.onclick = e => requestDeleteSession(session.id, e)
		sessionsListEl.appendChild(div)
	})
}

// --- 6. PRO & UPGRADE LOGIC ---

function openUpgradeModal() {
	if (localStorage.getItem('tabby-pro-status') === 'true') {
		if (alreadyProOverlay) {
			alreadyProOverlay.classList.remove('hidden')
		} else {
			alert('У вас уже активирован план TabbyAI Plus!')
		}
		return
	}
	if (upgradeModalOverlay) upgradeModalOverlay.classList.remove('hidden')
}

if (openModalBtn) openModalBtn.addEventListener('click', openUpgradeModal)
if (menuUpgradeBtn) menuUpgradeBtn.addEventListener('click', openUpgradeModal)

if (closeUpgradeBtn) {
	closeUpgradeBtn.addEventListener('click', () => {
		if (upgradeModalOverlay) upgradeModalOverlay.classList.add('hidden')
	})
}
if (upgradeModalOverlay) {
	upgradeModalOverlay.addEventListener('click', e => {
		if (e.target === upgradeModalOverlay)
			upgradeModalOverlay.classList.add('hidden')
	})
}

if (confirmUpgradeBtn) {
	confirmUpgradeBtn.addEventListener('click', () => {
		confirmUpgradeBtn.textContent = 'Обработка...'
		confirmUpgradeBtn.disabled = true

		setTimeout(() => {
			enableProMode(true)

			if (upgradeModalOverlay) upgradeModalOverlay.classList.add('hidden')
			confirmUpgradeBtn.textContent = 'Активировать TabbyAI Plus'
			confirmUpgradeBtn.disabled = false

			if (typeof loadUserProfile === 'function') loadUserProfile()
		}, 1500)
	})
}

// Fallback Key Activation
if (activateBtn) activateBtn.addEventListener('click', validateKey)
if (licenseInput) {
	licenseInput.addEventListener('keydown', e => {
		if (e.key === 'Enter') validateKey()
	})
}
if (closeModalBtn) {
	closeModalBtn.addEventListener('click', () => {
		if (modalActivateOverlay) modalActivateOverlay.classList.add('hidden')
		if (errorMsg) errorMsg.classList.add('hidden')
	})
}

function validateKey() {
	if (!licenseInput) return
	const val = licenseInput.value.trim().toUpperCase()
	if (val === PRO_KEY) {
		enableProMode(true)
		if (modalActivateOverlay) modalActivateOverlay.classList.add('hidden')
	} else {
		if (errorMsg) errorMsg.classList.remove('hidden')
		licenseInput.style.borderColor = '#ef4444'
		setTimeout(() => (licenseInput.style.borderColor = ''), 2000)
	}
}

function enableProMode(animate) {
	isPro = true
	localStorage.setItem('tabby-pro-status', 'true')
	document.body.classList.add('is-pro')

	if (planBadge) {
		planBadge.textContent = 'PRO'
		planBadge.classList.replace('badge-free', 'badge-pro')
	}

	if (openModalBtn) openModalBtn.classList.add('hidden')
	if (cancelProBtn) cancelProBtn.classList.remove('hidden')

	if (modelSelect) {
		const options = modelSelect.querySelectorAll('option')
		options.forEach(opt => (opt.disabled = false))
		modelSelect.value = 'genius'
	}
	currentModel = 'genius'

	if (animate)
		addMessage('🚀 PRO-доступ подтвержден. Все модули разблокированы.', 'bot')
}

// --- PRO CANCEL ---
if (cancelProBtn) {
	cancelProBtn.addEventListener('click', () => {
		if (modalCancelOverlay) modalCancelOverlay.classList.remove('hidden')
	})
}
if (keepSubBtn) {
	keepSubBtn.addEventListener('click', () => {
		if (modalCancelOverlay) modalCancelOverlay.classList.add('hidden')
	})
}
if (confirmCancelBtn) {
	confirmCancelBtn.addEventListener('click', () => {
		disableProMode()
		if (modalCancelOverlay) modalCancelOverlay.classList.add('hidden')
	})
}
if (modalCancelOverlay) {
	modalCancelOverlay.addEventListener('click', e => {
		if (e.target === modalCancelOverlay)
			modalCancelOverlay.classList.add('hidden')
	})
}

function disableProMode() {
	isPro = false
	localStorage.removeItem('tabby-pro-status')
	document.body.classList.remove('is-pro')
	if (planBadge) {
		planBadge.textContent = 'FREE'
		planBadge.classList.replace('badge-pro', 'badge-free')
	}
	if (openModalBtn) openModalBtn.classList.remove('hidden')
	if (cancelProBtn) cancelProBtn.classList.add('hidden')

	if (modelSelect) {
		const options = modelSelect.querySelectorAll('option')
		options.forEach(opt => {
			if (opt.value !== 'standard') opt.disabled = true
		})
		modelSelect.value = 'standard'
	}
	currentModel = 'standard'
	addMessage('📉 Переход на базовый тариф выполнен.', 'bot')
}

// --- 7. GEMINI REAL API FUNCTION (MODIFIED) ---

// 1. Вставьте ваш ключ сюда (между кавычек)
const AUTO_API_KEY = "ВСТАВЬ_СЮДА_СВОЙ_КЛЮЧ_AIza..."; 

// 2. Настройка характера (Системный промпт)
const SYSTEM_INSTRUCTION = `
Ты TabbyAI, умный, эмпатичный и профессиональный помощник программиста.
Твои цели: помогать с кодом, объяснять сложные вещи простым языком и поддерживать беседу.
Ты работаешь на движке Ecrous Engine.
Отвечай кратко и по делу, если не просят подробностей.
Используй Markdown для оформления кода.
Если пользователь грустит — поддержи его.
`;

async function fetchGeminiReal(userText) {
    // Логика: Сначала ищем ключ в настройках, если нет — берем вшитый
    const storedKey = localStorage.getItem('tabby-api-key');
    const apiKey = storedKey || AUTO_API_KEY;

    if (!apiKey || apiKey.includes("ВСТАВЬ_СЮДА")) {
        return 'Ошибка: API Key не найден. Впишите его в код (AUTO_API_KEY) или в настройках.';
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // 3. Формируем историю чата для отправки (чтобы ИИ помнил контекст)
    // Берем текущую сессию
    const currentSession = sessions.find(s => s.id === currentSessionId);
    let history = [];

    if (currentSession && currentSession.messages) {
        // Берем последние 10 сообщений, чтобы не перегрузить контекст
        const lastMessages = currentSession.messages.slice(-10);
        
        history = lastMessages.map(msg => {
            // Gemini API требует роли 'user' или 'model' (не 'bot')
            return {
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            };
        });
    }

    // Добавляем текущее сообщение пользователя (которое еще не попало в сессию в момент вызова)
    // Примечание: в вашей логике addMessage вызывается ДО fetch, поэтому, возможно, оно уже там.
    // Но чтобы не дублировать, проверим:
    // Если мы используем историю из сессии, то userText уже должен быть последним элементом там.
    // Если логика сохранения запаздывает, можно принудительно добавить:
    
    // Формируем тело запроса
    const payload = {
        system_instruction: {
            parts: { text: SYSTEM_INSTRUCTION }
        },
        contents: history.length > 0 ? history : [{ role: "user", parts: [{ text: userText }] }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error(errData);
            return `Ошибка API (${response.status}): ${errData.error?.message || 'Проверьте ключ API'}`;
        }

        const data = await response.json();

        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return 'Ответ от API пуст или заблокирован.';
        }
    } catch (error) {
        console.error('Network Error:', error);
        return 'Ошибка сети. Проверьте интернет.';
    }
}

// --- 8. CHAT UI ---

function checkChatState() {
	if (!chatList) return
	if (chatList.children.length === 0) {
		document.body.classList.add('new-chat')
	} else {
		document.body.classList.remove('new-chat')
	}
}

if (modelSelect) {
	modelSelect.addEventListener('change', e => {
		currentModel = e.target.value
		addSystemNote(
			`Смена модели: <b>${e.target.options[e.target.selectedIndex].text}</b>`
		)
	})
}

if (themeToggle) {
	themeToggle.addEventListener('click', () => {
		const currentTheme = document.documentElement.getAttribute('data-theme')
		const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
		document.documentElement.setAttribute('data-theme', newTheme)
		localStorage.setItem('tabby-theme', newTheme)
	})
}

if (userInput) {
	userInput.addEventListener('input', function () {
		this.style.height = 'auto'
		this.style.height = this.scrollHeight + 'px'
	})

	userInput.addEventListener('keydown', e => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSend()
		}
	})
}
if (sendBtn) sendBtn.addEventListener('click', handleSend)

function setInputState(enabled) {
	if (!userInput || !sendBtn) return
	if (enabled) {
		userInput.disabled = false
		sendBtn.disabled = false
		userInput.parentElement.style.opacity = '1'
		userInput.focus()
		isGenerating = false
	} else {
		userInput.disabled = true
		sendBtn.disabled = true
		userInput.parentElement.style.opacity = '0.6'
		isGenerating = true
	}
}

// === MAIN SEND FUNCTION (UPDATED FOR ASYNC API) ===
async function handleSend() {
	if (isGenerating) return
	if (!userInput) return
	const text = userInput.value.trim()
	if (!text) return

	updateSessionTitle(text)
	addMessage(text, 'user')
	document.body.classList.remove('new-chat')

	// Clear input
	userInput.value = ''
	userInput.style.height = 'auto'
	setInputState(false) // Lock input

	const loadingId = showTypingIndicator()

	// --- CHECK MODEL TYPE ---
	if (currentModel === 'gemini-real') {
		// --- REAL API CALL ---
		try {
			const realResponse = await fetchGeminiReal(text)
			removeTypingIndicator(loadingId)
			addMessage(realResponse, 'bot', 'gemini-api')
		} catch (e) {
			removeTypingIndicator(loadingId)
			addMessage('Критическая ошибка при запросе.', 'bot')
		} finally {
			setInputState(true) // Unlock
		}
	} else {
		// --- LOCAL LOGIC (OLD WAY) ---
		let delay = 1000
		if (isPro) {
			if (currentModel === 'fast') delay = 500
			if (currentModel === 'genius') delay = 1800
		}

		setTimeout(() => {
			removeTypingIndicator(loadingId)
			const responseObj = getSmartResponse(text)
			addMessage(responseObj.text, 'bot', responseObj.topic)
			setInputState(true) // Unlock
		}, Math.random() * 500 + delay)
	}
}

// --- 9. SMART RESPONSE (LOCAL FALLBACK) ---

function getSmartResponse(input) {
	const clean = input
		.toLowerCase()
		.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
		.trim()

	let prefix = ''
	if (isPro) {
		if (currentModel === 'genius') prefix = '✨ '
		if (currentModel === 'fast') prefix = '⚡ '
	}

	const categories = {
		nexlang: ['nexlang', 'нексланг', 'nex lang', 'документаци'],
		help: ['помощь', 'help', 'команды'],
		jokes: ['шутк', 'анекдот', 'пошути'],
		motivation: ['грустн', 'мотивац', 'сдаюсь'],
		ideas: ['идею', 'проект', 'что написать'],
		status: ['как дела', 'статус'],
		about: ['кто ты', 'ты кто', 'бот'],
		tech: ['js', 'javascript', 'css', 'код'],
		greetings: ['привет', 'хай', 'ку'],
		farewell: ['пока', 'удачи'],
		love: ['люблю', 'спасибо', 'благодарю'],
		rude: ['дурак', 'тупой'],
	}

	let foundCategory = null
	for (const [cat, keywords] of Object.entries(categories)) {
		if (keywords.some(k => clean.includes(k))) {
			foundCategory = cat
			break
		}
	}

	if (foundCategory) {
		if (activeDB[foundCategory])
			return {
				text: prefix + getRandom(activeDB[foundCategory]),
				topic: foundCategory,
			}
		if (isPro && proDB[foundCategory])
			return {
				text: prefix + getRandom(proDB[foundCategory]) + ' (Pro)',
				topic: foundCategory,
			}
		if (foundCategory === 'status')
			return { text: prefix + 'Системы в норме.', topic: 'default' }
	}

	if (activeDB.unknown)
		return { text: prefix + getRandom(activeDB.unknown), topic: 'unknown' }
	return { text: prefix + 'Я не понял запрос.', topic: 'unknown' }
}

function getRandom(arr) {
	if (!arr || arr.length === 0) return '...'
	return arr[Math.floor(Math.random() * arr.length)]
}

function addMessage(text, sender, topic = null) {
	const session = sessions.find(s => s.id === currentSessionId)
	if (session) {
		session.messages.push({ role: sender, text: text, topic: topic })
		if (session.messages.length > 50) session.messages.shift()
		saveSessions()
	}
	renderMessage(text, sender)
}

function renderMessage(text, sender) {
	if (!chatList) return
	const msgDiv = document.createElement('div')
	msgDiv.className = `message ${sender}`

	// Simple protection against basic XSS, but allowing <br>
	let formatted = text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/\n/g, '<br>')

	// Allow bold for markdown-like usage if needed (simple)
	formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')

	const botIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 0 1 10 10v0a10 10 0 0 1-10 10v0a10 10 0 0 1-10-10v0a10 10 0 0 1 10-10z"></path><path d="M8 11h.01"/><path d="M16 11h.01"/><path d="M9 16s1.5 1.5 3 1.5 3-1.5 3-1.5"/></svg>`
	const userIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`

	msgDiv.innerHTML = `<div class="avatar">${
		sender === 'bot' ? botIcon : userIcon
	}</div><div class="bubble">${formatted}</div>`

	chatList.appendChild(msgDiv)
	if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight
}

function addSystemNote(text) {
	if (!chatList) return
	const div = document.createElement('div')
	div.style.textAlign = 'center'
	div.style.fontSize = '12px'
	div.style.color = 'var(--text-muted)'
	div.style.margin = '10px 0'
	div.innerHTML = text
	chatList.appendChild(div)
	if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight
}

function showTypingIndicator() {
	if (!chatList) return
	const id = 't-' + Date.now()
	const div = document.createElement('div')
	div.className = 'message bot'
	div.id = id
	div.innerHTML = `<div class="avatar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 0 1 10 10v0a10 10 0 0 1-10 10v0a10 10 0 0 1-10-10z"></path></svg></div><div class="bubble"><div class="typing-dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div>`
	chatList.appendChild(div)
	if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight
	return id
}

function removeTypingIndicator(id) {
	const el = document.getElementById(id)
	if (el) el.remove()
}
