function userInput(args = process.argv.slice(2)) {
    const [command, value, description] = args;

    if (command === "add") {
        if (args.length !== 2 || value.trim() === "") {
            throw new Error('Usage: node task-tracker.js add "Task description"');
        }

        return addTask(value.trim());
    }

    if (command === "update") {
        if (
            args.length !== 3 ||
            !/^[1-9]\d*$/.test(value) ||
            !Number.isSafeInteger(Number(value)) ||
            description.trim() === ""
        ) {
            throw new Error('Usage: node task-tracker.js update <positive integer ID> "New description"');
        }

        return updateTask(Number(value), description.trim());
    }

    if (command === "delete") {
        if (
            args.length !== 2 ||
            !/^[1-9]\d*$/.test(value) ||
            !Number.isSafeInteger(Number(value))
        ) {
            throw new Error("Usage: node task-tracker.js delete <positive integer ID>");
        }

        return deleteTask(Number(value));
    }

    throw new Error('Please use one of these commands: "add", "update", or "delete".');
}

function addTask(description) {
    const fs = require("node:fs");
    const filePath = "tasks.json";
    const tasks = fs.existsSync(filePath)
        ? JSON.parse(fs.readFileSync(filePath, "utf8"))
        : [];
    const id = tasks.reduce((highestId, task) => Math.max(highestId, task.id), 0) + 1;
    const now = new Date().toISOString();
    const task = {
        id,
        description,
        status: "todo",
        createdAt: now,
        updatedAt: now,
    };

    tasks.push(task);
    fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2), "utf8");

    return `Task added successfully (ID: ${id})`;
}

function updateTask(id, description) {
    const fs = require("node:fs");
    const filePath = "tasks.json";
    const tasks = fs.existsSync(filePath)
        ? JSON.parse(fs.readFileSync(filePath, "utf8"))
        : [];
    const task = tasks.find(task => task.id === id);

    if (!task) {
        throw new Error(`404: Task not found (ID: ${id})`);
    }

    task.description = description;
    task.updatedAt = new Date().toISOString();
    fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2), "utf8");

    return `Task updated successfully (ID: ${id})`;
}

function deleteTask(id) {
    const fs = require("node:fs");
    const filePath = "tasks.json";
    const tasks = fs.existsSync(filePath)
        ? JSON.parse(fs.readFileSync(filePath, "utf8"))
        : [];
    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
        throw new Error(`404: Task not found (ID: ${id})`);
    }

    tasks.splice(taskIndex, 1);
    fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2), "utf8");

    return `Task ${id} deleted successfully`;
}

try {
    const input = userInput();
    console.log(input);
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
}

