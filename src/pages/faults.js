function renderFaults(container) {
    const isTech = currentUser && ['TECHNICIAN','ADMIN'].includes(currentUser.role);
    const isAdmin = currentUser && currentUser.role === 'ADMIN';
    if (!isTech && !isAdmin) {
        container.innerHTML = `<div class="alert alert-info">Fault management is available to Technicians and Administrators.</div>`;
        return;
    }

    let html = `
        <h3 class="section-title">${isTech ? 'Active node faults' : 'All node faults'}</h3>
        <div class="flex gap-2 mb-2" style="flex-wrap:wrap;">
            <select class="form-control" style="width:auto;min-width:140px;" id="faultFilterStatus">
                <option value="ALL">All status</option>
                ${FAULT_STATUSES.map(s => `<option value="${s}">${s.replace('_',' ')}</option>`).join('')}
            </select>
            <select class="form-control" style="width:auto;min-width:140px;" id="faultFilterSource">
                <option value="ALL">All sources</option>
                ${FAULT_SOURCES.map(s => `<option value="${s}">${s === 'AUTO' ? 'Automatic' : s === 'MANUAL' ? 'User report' : s}</option>`).join('')}
            </select>
            <input class="form-control" style="width:auto;min-width:160px;" placeholder="Search node..." id="faultSearch" />
            <button class="btn btn-teal btn-sm" onclick="applyFaultFilters()"><i class="fas fa-search"></i> Filter</button>
        </div>
        <div class="table-wrap">
            <table>
                <thead><tr><th>#</th><th>Computer</th><th>Lab</th><th>Fault</th><th>Source</th><th>Status</th><th>Priority</th><th>Actions</th></tr></thead>
                <tbody id="faultTableBody">
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = html;

    function renderFaultTable() {
        const statusFilter = document.getElementById('faultFilterStatus')?.value || 'ALL';
        const sourceFilter = document.getElementById('faultFilterSource')?.value || 'ALL';
        const search = document.getElementById('faultSearch')?.value?.toLowerCase() || '';

        let list = faults;
        if (statusFilter !== 'ALL') list = list.filter(f => f.status === statusFilter);
        if (sourceFilter !== 'ALL') list = list.filter(f => f.source === sourceFilter);
        if (search) list = list.filter(f => f.computerNumber.toLowerCase().includes(search) || f.faultType.toLowerCase().includes(search));

        const tbody = document.getElementById('faultTableBody');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-muted text-center">No faults found.</td></tr>`;
            return;
        }

        tbody.innerHTML = list.slice().reverse().map(f => `
            <tr>
                <td>#${f.id}</td>
                <td>${f.computerNumber}</td>
                <td>${f.labName}</td>
                <td>${htmlEscape(f.faultType)}</td>
                <td><span class="text-xs">${f.source === 'AUTO' ? 'Automatic' : 'User report'}</span></td>
                <td>${getFaultStatusBadge(f.status)}</td>
                <td><span class="status-badge ${f.priority === 'CRITICAL' ? 'critical' : f.priority === 'HIGH' ? 'warning' : 'healthy'}"><span class="dot"></span> ${f.priority}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" aria-label="View report" title="View report" onclick="viewFault(${f.id})"><i class="fas fa-eye"></i></button>
                    ${isTech ? `
                        <button class="btn btn-sm btn-success" aria-label="Acknowledge report" title="Acknowledge report" onclick="updateFaultStatus(${f.id},'ACKNOWLEDGED')"><i class="fas fa-check"></i></button>
                        <button class="btn btn-sm btn-warning" aria-label="Start work" title="Start work" onclick="updateFaultStatus(${f.id},'IN_PROGRESS')"><i class="fas fa-play"></i></button>
                        <button class="btn btn-sm btn-teal" aria-label="Resolve report" title="Resolve report" onclick="updateFaultStatus(${f.id},'RESOLVED')"><i class="fas fa-check-double"></i></button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    }

    window.applyFaultFilters = renderFaultTable;
    window.viewFault = function(id) {
        const f = faults.find(f => f.id === id);
        if (!f) return;
        alert(`Report #${f.id}\nComputer: ${f.computerNumber}\nProblem: ${f.faultType}\nStatus: ${f.status}\nDescription: ${f.description}\nReported: ${new Date(f.reportedAt).toLocaleString()}`);
    };
    window.updateFaultStatus = function(id, newStatus) {
        const f = faults.find(f => f.id === id);
        if (!f) return;
        if (!isSupport() || !FAULT_STATUSES.includes(newStatus) || f.status === newStatus) return;
        f.status = newStatus;
        f.resolvedAt = newStatus === 'RESOLVED' ? new Date().toISOString() : null;
        f.history.push({ status: newStatus, at: new Date().toISOString(), by: currentUser.id });
        saveFaults();
        renderFaultTable();
    };

    renderFaultTable();
}
