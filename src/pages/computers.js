function renderComputers(container) {
    if (currentUser.role !== 'ADMIN') {
        container.innerHTML = `<div class="alert alert-info">Admin only.</div>`;
        return;
    }
    let html = `
        <h3 class="section-title">Node management</h3>
        <div class="flex gap-2 mb-2">
            <input class="form-control" style="width:auto;min-width:200px;" placeholder="Search nodes..." id="compSearch" />
            <button class="btn btn-teal btn-sm" onclick="filterComputers()"><i class="fas fa-search"></i> Search</button>
        </div>
        <div class="table-wrap"><table><thead><tr><th>#</th><th>Lab</th><th>Hostname</th><th>IP</th><th>Status</th><th>OS</th></tr></thead><tbody id="compTableBody">`;
    const comps = computers.slice(0, 30);
    comps.forEach(c => {
        const lab = LABS.find(l => l.id === c.labId);
        html += `<tr><td>${c.number}</td><td>${lab?.name || ''}</td><td>${c.hostname}</td><td>${c.ip}</td><td>${getStatusBadge(c.status)}</td><td class="text-xs">${c.os}</td></tr>`;
    });
    html += `</tbody></table></div>`;
    container.innerHTML = html;

    window.filterComputers = function() {
        const search = document.getElementById('compSearch')?.value?.toLowerCase() || '';
        const tbody = document.getElementById('compTableBody');
        if (!tbody) return;
        const rows = tbody.querySelectorAll('tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(search) ? '' : 'none';
        });
    };
}
