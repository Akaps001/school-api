const ClassroomManager = require('./managers/entities/classroom/Classroom.manager');

// Mock dependencies
const mockParams = {
    config: {},
    cortex: {},
    validators: {},
    mongomodels: {},
    utils: {},
    cache: {},
    managers: {}
};

const classroomManager = new ClassroomManager(mockParams);
const managers = { classroom: classroomManager };
const prop = 'httpExposed';

console.log('--- Debugging ApiHandler Logic ---');

const methodMatrix = {};

Object.keys(managers).forEach(mk => {
    if (managers[mk][prop]) {
        console.log(`Found ${prop} in ${mk}`);
        methodMatrix[mk] = {};

        managers[mk][prop].forEach(i => {
            let method = 'post';
            let fnName = i;
            if (i.includes("=")) {
                let frags = i.split('=');
                method = frags[0];
                fnName = frags[1];
            }

            console.log(`Processing: ${i} -> Method: ${method}, Fn: ${fnName}`);

            if (!methodMatrix[mk][method]) {
                methodMatrix[mk][method] = [];
            }
            methodMatrix[mk][method].push(fnName);
        });
    }
});

console.log('--- Resulting Matrix ---');
console.log(JSON.stringify(methodMatrix, null, 2));

// Simulate the check
const moduleName = 'classroom';
const method = 'post'; // req.method.toLowerCase()
const fnName = 'createClassroom';

console.log(`--- Checking access for ${moduleName}.${fnName} [${method}] ---`);

if (!methodMatrix[moduleName]) {
    console.log(`FAIL: Module ${moduleName} not found`);
} else if (!methodMatrix[moduleName][method]) {
    console.log(`FAIL: Method ${method} not supported`);
} else if (!methodMatrix[moduleName][method].includes(fnName)) {
    console.log(`FAIL: Function ${fnName} not found in method ${method}`);
    console.log('Available:', methodMatrix[moduleName][method]);

    // Check for whitespace/hidden chars
    const available = methodMatrix[moduleName][method];
    available.forEach(avail => {
        console.log(`Comparing '${avail}' vs '${fnName}'`);
        console.log(`'${avail}' codes:`, avail.split('').map(c => c.charCodeAt(0)));
        console.log(`'${fnName}' codes:`, fnName.split('').map(c => c.charCodeAt(0)));
        console.log('Equal?', avail === fnName);
    });

} else {
    console.log('SUCCESS: Function found!');
}
