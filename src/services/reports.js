function createFault(computerId, type, description, source, reporterId, priority = 'MEDIUM') {
    const computer = computers.find(c => c.id === computerId);
    if (!computer) return null;
    const lab = LABS.find(l => l.id === computer.labId);
    const report = {
        id: faultId++,
        computerId,
        labId: computer.labId,
        computerNumber: computer.number,
        labName: lab ? lab.name : 'Unknown',
        faultType: type,
        description: description,
        source: source,
        priority: priority,
        status: 'OPEN',
        reportedBy: reporterId,
        assignedTechnician: null,
        reportedAt: new Date().toISOString(),
        resolvedAt: null,
        notes: [],
        history: [{ status: 'OPEN', at: new Date().toISOString(), by: reporterId }]
    };
    faults.push(report);
    // User reports and ticket resolution must not mutate telemetry.
    return report;
}
