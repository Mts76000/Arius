import fs from "fs";
import path from "path";
import { swaggerSpec } from "../config/swagger.js";

const outputPath = path.resolve(process.cwd(), "../shared/openapi.json");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(swaggerSpec, null, 2)}\n`);

console.log(`OpenAPI exporte: ${outputPath}`);
