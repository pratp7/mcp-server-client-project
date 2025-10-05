import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fs from "node:fs/promises";
import { z } from "zod";

const server = new McpServer({
    name: "test-server",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
        prompts: {},
    }
})

server.tool("create-user", "Create a new user in the database ", {
    name: z.string(),
    email: z.string(),
    address: z.string(),
    phone: z.string(),
}, {
    title: "Create user",
    readOnlyHint: false, // It will change the data
    destructiveHint: false, // it will just create something
    idempotentHint: false, // yes it will create multiple users not pure a function or idempotent
    openWorldHint: true
}, async (params) => {
    try {
        const id = createUser(params)
        return {
            content: [
                {type: "text", text: `User ${id} created successfully`}
            ]
        }
        
    } catch {
        return {
            content: [
                {type: "text", text: "Failed to create user"}
            ]
        }
    }
})

async function createUser(user: { name: string, email: string, address: string, phone: string }) {
    const users = await import("./data/users.json", {
        with: {type: "json"}
    }).then(m => m.default);

    const id = users.length + 1;
    users.push({ id, ...user });
    fs.writeFile("./src/data/users.json", JSON.stringify(user, null, 2))
    return id;
}
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
 }

main();