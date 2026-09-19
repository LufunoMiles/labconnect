function reportFaultForComputer(compId) {
    selectedComputerId = compId;
    navigateTo('report');
}


function renderReportForm(container) {
    const comp = selectedComputerId ? computers.find(c => c.id === selectedComputerId) : null;
    const labOptions = LABS.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
    const typeOptions = FAULT_TYPES.map(t => `<option value="${t}">${t}</option>`).join('');

    let html = `
        <h3 class="section-title">Report a node fault</h3>
        <div class="card" style="max-width:600px;">
            <p class="text-sm text-muted mb-2">Tell cluster support what happened. Demo reports are saved in this browser only.</p>
            <form id="reportForm">
                <div class="form-group">
                    <label for="reportLab">Cluster group *</label>
                    <select class="form-control" id="reportLab" ${comp ? `disabled` : ''}>
                        ${labOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label for="reportComputer">Compute node *</label>
                    <select class="form-control" id="reportComputer" required>
                        <option value="">Select a node</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="reportType">Problem Category *</label>
                    <select class="form-control" id="reportType">
                        ${typeOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label for="reportDesc">Description *</label>
                    <textarea class="form-control" id="reportDesc" rows="4" maxlength="1500" minlength="10" required placeholder="Describe the issue in detail..."></textarea>
                </div>
                <div class="form-group">
                    <label for="reportNotes">Additional Notes <span class="hint">(optional)</span></label>
                    <input class="form-control" id="reportNotes" placeholder="Any extra information" />
                </div>
                <button type="submit" class="btn btn-teal"><i class="fas fa-paper-plane"></i> Submit Report</button>
                <button type="button" class="btn btn-outline" onclick="selectedComputerId=null;navigateTo('dashboard')">Cancel</button>
                <div id="reportResult" class="mt-2"></div>
            </form>
        </div>
    `;

    container.innerHTML = html;

    const labSelect = document.getElementById('reportLab');
    const compSelect = document.getElementById('reportComputer');

    function populateComputers(labId) {
        const list = computers.filter(c => c.labId === parseInt(labId));
        compSelect.innerHTML = '<option value="">Select a computer</option>' +
            list.map(c => `<option value="${c.id}">${c.number} (${c.hostname}) — ${getStatusInfo(c.status).label}</option>`).join('');
        if (comp) {
            compSelect.value = comp.id;
        }
    }

    if (comp) {
        labSelect.value = comp.labId;
        populateComputers(comp.labId);
        labSelect.disabled = true;
    } else {
        labSelect.addEventListener('change', () => populateComputers(labSelect.value));
        populateComputers(labSelect.value);
    }

    document.getElementById('reportForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const labId = parseInt(labSelect.value);
        const computerId = parseInt(compSelect.value);
        const type = document.getElementById('reportType').value;
        const desc = document.getElementById('reportDesc').value.trim();
        const notes = document.getElementById('reportNotes').value.trim();

        if (!labId || !computerId || !type || desc.length < 10) {
                    document.getElementById('reportResult').innerHTML = `<div class="alert alert-danger">Please select a node and enter at least 10 characters of detail.</div>`;
            return;
        }

        const existing = faults.find(f => f.computerId === computerId && f.faultType === type && f.reportedBy === currentUser.id && f.status !== 'RESOLVED' && f.status !== 'CLOSED');
        if (existing) {
            document.getElementById('reportResult').innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-triangle-exclamation"></i> This problem may already have been reported.
                    <br><a href="#" onclick="navigateTo('myreports');return false;">View existing report #${existing.id}</a>
                </div>
            `;
            return;
        }

        const report = createFault(computerId, type, desc, 'MANUAL', currentUser.id);
        if (report && notes) report.notes.push(notes);
        if (report) saveFaults();
        if (report) {
            document.getElementById('reportResult').innerHTML = `
                <div class="alert alert-success">
                    <strong>✓ Report saved ${reportsPersisted ? 'in this browser' : 'for this session only'}</strong><br>
                    Report #${report.id} &middot; ${report.computerNumber} &middot; ${report.faultType}<br>
                    Status: ${getFaultStatusBadge(report.status)}
                    <br><a href="#" onclick="navigateTo('myreports');return false;" class="btn btn-sm btn-teal mt-1">View Report</a>
                </div>
            `;
            document.getElementById('reportDesc').value = '';
            document.getElementById('reportNotes').value = '';
            document.getElementById('reportResult').scrollIntoView({ behavior: 'smooth' });
        }
    });
}
