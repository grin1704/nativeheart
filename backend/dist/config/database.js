"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = globalThis.prisma || new client_1.PrismaClient({
    log: process.env['NODE_ENV'] === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    errorFormat: 'pretty',
});
if (process.env['NODE_ENV'] === 'development') {
    globalThis.prisma = prisma;
}
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
exports.default = prisma;
//# sourceMappingURL=database.js.map