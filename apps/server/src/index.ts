import { env } from "@my-better-t-app/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import path from "path"
import { writeFile, mkdir } from "fs/promises"

const app = new Hono();
const UPLOAD_DIR = path.join(process.cwd(), "uploads")
async function ensureUploadDir() { await mkdir(UPLOAD_DIR, { recursive: true }) }
const sessions = new Map< string, { chunks: Set<string> } >()
app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);

app.get("/", (c) => {
  return c.text("OK");
});
app.post("/api/upload", async (c) => {
   await ensureUploadDir() 
   const body = await c.req.parseBody() 
   console.log(body)
   const file = body.file as File 
   const chunkId = body.chunkId as string 
   const chunkNumber=body.chunkNumber as string
     if (!file || !(file instanceof File)) { return c.json({ error: "Invalid file" }, 400) }
     
       
      
        
           const buffer = Buffer.from(await file.arrayBuffer())
            const filename = `${chunkNumber}-${chunkId}.wav` 
            const filePath = path.join(UPLOAD_DIR, filename) 
            await writeFile(filePath, buffer)
           
            console.log("Saved chunk:", filename) 
            return c.json({ success: true, file: filename, }) })

export default app;
