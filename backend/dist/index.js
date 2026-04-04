"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env['PORT'] || 3001;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '100mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '100mb' }));
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Memorial Pages Service API is running',
        timestamp: new Date().toISOString()
    });
});
app.use('/api', routes_1.default);
app.use((err, _req, res, _next) => {
    console.error('Error:', err.message);
    const statusCode = err.statusCode || 500;
    const message = err.isOperational
        ? err.message
        : (process.env['NODE_ENV'] === 'development' ? err.message : 'Something went wrong');
    res.status(statusCode).json({
        error: statusCode === 500 ? 'Internal Server Error' : err.message,
        message: message
    });
});
app.use('*', (_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 API: http://localhost:${PORT}/api`);
});
//# sourceMappingURL=index.js.map