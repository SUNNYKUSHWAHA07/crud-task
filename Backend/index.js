import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/mongoose-config.js";
import orderRoutes from "./Router/orderRoute.js";

// Correctly define __filename and __dirname in ES Modules:
const _dirname = path.resolve();

const app = express();
connectDB();

app.use(cors(
   origin: "https://crud-task-15do.onrender.com",
    credentials: true,
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// All order-related API routes
app.use("/orders", orderRoutes);

// Serve static files - make sure this is after your API routes
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(_dirname, "/frontend/dist")));
    app.get("*", (req, res) => {
		res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
	});
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
