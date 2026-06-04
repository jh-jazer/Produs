// Mocking mongoose behavior for benchmarking N+1 vs $in array or Map lookup.
const mockUsersCount = 2000;

class MockUser {
    constructor(id) {
        this._id = id;
        this.username = `test_user_${id}`;
        // Give 50% of users a dangling partner
        this.partner = Math.random() > 0.5 ? `dangling_id_${id}` : null;
        this.outgoingPartnerRequest = Math.random() > 0.5 ? `dangling_id_out_${id}` : null;
        this.incomingPartnerRequest = Math.random() > 0.5 ? `dangling_id_in_${id}` : null;
    }
}

const mockDb = [];
for (let i = 0; i < mockUsersCount; i++) {
    mockDb.push(new MockUser(i));
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Simulate DB find
async function mockFindById(id) {
    // Simulated 1ms database latency per query
    await delay(1);
    return mockDb.find(u => u._id === id); // Will be null since IDs are 'dangling'
}

async function runOriginal() {
    const startTime = Date.now();
    for (const u of mockDb) {
        if (u.partner) {
            const p = await mockFindById(u.partner);
        }
        if (u.outgoingPartnerRequest) {
            const p = await mockFindById(u.outgoingPartnerRequest);
        }
        if (u.incomingPartnerRequest) {
            const p = await mockFindById(u.incomingPartnerRequest);
        }
    }
    return Date.now() - startTime;
}

// Simulated User.find({ _id: { $in: [...] } })
async function mockFindInArray(ids) {
    // Simulated DB lookup with single query latency
    await delay(5);
    const idSet = new Set(ids);
    return mockDb.filter(u => idSet.has(u._id));
}

async function runOptimized() {
    const startTime = Date.now();

    // Instead of doing individual await mockFindById, we can collect all IDs and do a single $in query
    const idsToFetch = new Set();
    for (const u of mockDb) {
        if (u.partner) idsToFetch.add(u.partner);
        if (u.outgoingPartnerRequest) idsToFetch.add(u.outgoingPartnerRequest);
        if (u.incomingPartnerRequest) idsToFetch.add(u.incomingPartnerRequest);
    }

    const idsArray = Array.from(idsToFetch);
    const foundUsersList = await mockFindInArray(idsArray);

    const userMap = new Map();
    for (const u of foundUsersList) {
        userMap.set(u._id, u);
    }

    for (const u of mockDb) {
        if (u.partner) {
            const p = userMap.get(u.partner);
        }
        if (u.outgoingPartnerRequest) {
            const p = userMap.get(u.outgoingPartnerRequest);
        }
        if (u.incomingPartnerRequest) {
            const p = userMap.get(u.incomingPartnerRequest);
        }
    }

    return Date.now() - startTime;
}

async function run() {
    console.log("Running original benchmark...");
    const origTime = await runOriginal();
    console.log(`Original Time: ${origTime}ms`);

    console.log("Running optimized benchmark...");
    const optTime = await runOptimized();
    console.log(`Optimized Time: ${optTime}ms`);
}

run();
