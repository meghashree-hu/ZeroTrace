import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";


import authRoutes from "./modules/auth/routes/auth.routes";
import documentRoutes from "./modules/document/routes/document.routes";
import shareRoutes from "./modules/share/routes/share.routes";
import sessionRoutes from "./modules/session/routes/session.routes";
import auditRoutes from "./modules/audit/routes/audit.routes";

const app = express();
app.set("trust proxy", true);
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 ZeroTrace Backend Running");
});
app.get("/ip-test", (req, res) => {
  res.json({
    reqIp: req.ip,
    forwarded: req.headers["x-forwarded-for"],
    realIp: req.headers["x-real-ip"],
    remoteAddress: req.socket.remoteAddress,
    headers: req.headers,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/audit", auditRoutes);


export default app;