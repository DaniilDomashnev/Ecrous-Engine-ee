// profile.js - Управление профилем и настройками (Updated with Modals)

document.addEventListener('DOMContentLoaded', () => {
	// --- Elements ---
	const profileBtn = document.getElementById('user-profile-trigger')
	const dropdown = document.getElementById('profile-dropdown')

	// Sidebar elements
	const avatarEl = document.getElementById('sidebar-avatar')
	const nameEl = document.getElementById('sidebar-username')
	const planEl = document.getElementById('sidebar-plan')

	// Menu items
	const logoutBtn = document.getElementById('menu-logout')
	const settingsBtn = document.getElementById('menu-settings')
	const upgradeBtn = document.getElementById('menu-upgrade')

	// Settings Modal
	const settingsOverlay = document.getElementById('settings-overlay')
	const closeSettingsBtn = document.getElementById('close-settings-btn')
	const settingsTabs = document.querySelectorAll('.settings-tab')
	const settingsPanels = document.querySelectorAll('.settings-panel')

	// Settings Controls
	const themeSelect = document.getElementById('setting-theme')
	const clearAllBtn = document.getElementById('setting-clear-all')
	const resetAccountBtn = document.getElementById('setting-reset-account')

	// --- NEW MODALS ELEMENTS ---
	// Logout Modal
	const logoutModalOverlay = document.getElementById('logout-modal-overlay')
	const confirmLogoutBtn = document.getElementById('confirm-logout-btn')
	const cancelLogoutBtn = document.getElementById('cancel-logout-btn')

	// Already Pro Modal
	const alreadyProOverlay = document.getElementById('already-pro-modal-overlay')
	const closeAlreadyProBtn = document.getElementById('close-already-pro-btn')
	const okAlreadyProBtn = document.getElementById('ok-already-pro-btn')

	// --- 1. Load User Info ---
	function loadUserProfile() {
		const userName = localStorage.getItem('tabby-user-name') || 'User'
		const isPro = localStorage.getItem('tabby-pro-status') === 'true'

		// Initials
		const initials = userName.slice(0, 2).toUpperCase()

		if (avatarEl) avatarEl.textContent = initials
		if (nameEl) nameEl.textContent = userName
		if (planEl) {
			planEl.textContent = isPro ? 'TabbyAI Plus' : 'Free Plan'
			if (isPro) planEl.style.color = '#f59e0b' // Gold color
		}
	}

	loadUserProfile()

	// --- 2. Dropdown Logic ---
	if (profileBtn) {
		profileBtn.addEventListener('click', e => {
			e.stopPropagation()
			dropdown.classList.toggle('hidden')
			profileBtn.classList.toggle('active')
		})
	}

	document.addEventListener('click', e => {
		if (
			!dropdown.classList.contains('hidden') &&
			!dropdown.contains(e.target) &&
			!profileBtn.contains(e.target)
		) {
			dropdown.classList.add('hidden')
			profileBtn.classList.remove('active')
		}
	})

	// --- 3. Settings Modal Logic ---
	if (settingsBtn) {
		settingsBtn.addEventListener('click', () => {
			settingsOverlay.classList.remove('hidden')
			dropdown.classList.add('hidden')
		})
	}

	if (closeSettingsBtn) {
		closeSettingsBtn.addEventListener('click', () => {
			settingsOverlay.classList.add('hidden')
		})
	}

	settingsOverlay.addEventListener('click', e => {
		if (e.target === settingsOverlay) settingsOverlay.classList.add('hidden')
	})

	settingsTabs.forEach(tab => {
		tab.addEventListener('click', () => {
			settingsTabs.forEach(t => t.classList.remove('active'))
			settingsPanels.forEach(p => p.classList.remove('active'))
			tab.classList.add('active')
			const targetId = 'panel-' + tab.dataset.tab
			document.getElementById(targetId).classList.add('active')
		})
	})

	// --- 4. Settings Actions ---

	// Theme Switcher
	if (themeSelect) {
		const savedTheme = localStorage.getItem('tabby-theme') || 'system'
		themeSelect.value =
			savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'system'

		themeSelect.addEventListener('change', e => {
			const val = e.target.value
			let themeToApply = val

			if (val === 'system') {
				if (
					window.matchMedia &&
					window.matchMedia('(prefers-color-scheme: dark)').matches
				) {
					themeToApply = 'dark'
				} else {
					themeToApply = 'light'
				}
			}
			document.documentElement.setAttribute('data-theme', themeToApply)
			localStorage.setItem('tabby-theme', themeToApply)
		})
	}

	// --- LOGOUT LOGIC (NEW) ---
	if (logoutBtn) {
		logoutBtn.addEventListener('click', () => {
			dropdown.classList.add('hidden') // Close menu
			logoutModalOverlay.classList.remove('hidden') // Open custom modal
		})
	}

	// Handle Confirm Logout
	if (confirmLogoutBtn) {
		confirmLogoutBtn.addEventListener('click', () => {
			localStorage.removeItem('tabby-user-name')
			location.reload()
		})
	}

	// Handle Cancel Logout
	if (cancelLogoutBtn) {
		cancelLogoutBtn.addEventListener('click', () => {
			logoutModalOverlay.classList.add('hidden')
		})
	}

	// Close on click outside
	if (logoutModalOverlay) {
		logoutModalOverlay.addEventListener('click', e => {
			if (e.target === logoutModalOverlay)
				logoutModalOverlay.classList.add('hidden')
		})
	}

	// --- UPGRADE BUTTON LOGIC (Already PRO Check) ---
	if (upgradeBtn) {
		upgradeBtn.addEventListener('click', () => {
			dropdown.classList.add('hidden')

			const isPro = localStorage.getItem('tabby-pro-status') === 'true'

			if (isPro) {
				// Show "Already Pro" Modal
				alreadyProOverlay.classList.remove('hidden')
			} else {
				// Trigger existing PRO modal
				const proBtn = document.getElementById('open-pro-modal')
				if (proBtn) proBtn.click()
			}
		})
	}

	// Close "Already Pro" Modal
	const closeProModal = () => alreadyProOverlay.classList.add('hidden')
	if (closeAlreadyProBtn)
		closeAlreadyProBtn.addEventListener('click', closeProModal)
	if (okAlreadyProBtn) okAlreadyProBtn.addEventListener('click', closeProModal)
	if (alreadyProOverlay) {
		alreadyProOverlay.addEventListener('click', e => {
			if (e.target === alreadyProOverlay) closeProModal()
		})
	}

	// --- OTHER SETTINGS ACTIONS ---

	if (resetAccountBtn) {
		resetAccountBtn.addEventListener('click', () => {
			if (
				confirm('Это действие удалит ВСЕ данные (имя, чаты, PRO). Продолжить?')
			) {
				localStorage.clear()
				location.reload()
			}
		})
	}

	if (clearAllBtn) {
		clearAllBtn.addEventListener('click', () => {
			if (confirm('Удалить всю историю чатов?')) {
				localStorage.removeItem('tabby-sessions')
				localStorage.removeItem('tabby-current-id')
				location.reload()
			}
		})
	}
})
