function renderSidebar() {
    if (!currentUser) return;
    const items = [
        ['dashboard','Dashboard','fa-gauge-high'],
        ['monitoring','Cluster overview','fa-table-cells-large'],
        [isSupport()?'faults':'myreports',isSupport()?'Fault reports':'My fault reports','fa-clipboard-list'],
        ['report','Report a node fault','fa-circle-exclamation']
    ];
    const headNode = computers.find(c => c.role === 'HEAD') || computers[0];
    const nodeNotice = headNode ? `<div class="agent-notice" style="margin:28px 5px 0;font-size:11px"><strong>${htmlEscape(headNode.hostname)}</strong><br>Head node<br>Compute cluster controller</div>` : '<div class="agent-notice" style="margin:28px 5px 0;font-size:11px">Workspace setup required<br>No nodes connected</div>';
    document.getElementById('sidebarNav').innerHTML = '<div class="nav-label">WORKSPACE</div>' + items.map(([id,label,icon]) => `<a href="#${id}" data-page="${id}" class="${currentPage===id?'active':''}" ${currentPage===id?'aria-current="page"':''}><i class="fas ${icon}" aria-hidden="true"></i>${label}</a>`).join('') + nodeNotice;
    document.querySelectorAll('#sidebarNav a').forEach(a => a.onclick = e => { e.preventDefault(); selectedComputerId=a.dataset.page==='report'?localComputerId:null; navigateTo(a.dataset.page); document.getElementById('sidebar').classList.remove('open'); });
    document.getElementById('sidebarUser').textContent = currentUser.name;
}
function renderSignedInChrome() {
    document.querySelector('.sidebar-brand .tagline').textContent = 'Private workspace';
    document.querySelector('.topbar-right').innerHTML = `<span class="role-badge">${currentUser.role}</span><div class="user-menu"><span>${htmlEscape(currentUser.name)}</span><div class="avatar">${htmlEscape(currentUser.initials)}</div></div><button class="btn btn-outline btn-sm" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</button>`;
    document.getElementById('logoutBtn').onclick = () => { currentUser = null; clearSession(); renderSidebar(); showLogin(); };
    renderSidebar();
}
