import { defineConfig } from "vite";
import fs from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Check if server/admin folder exists for admin panel
const adminPath = join(__dirname, "server/admin");

export default defineConfig({
  base: "/curs/",
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false
      },
      "/upload": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [
    {
      name: "admin-panel",
      configureServer(server) {
        // Serve admin panel from server/admin if it exists
        if (fs.existsSync(adminPath)) {
          server.middlewares.use("/admin", (req, res, next) => {
            let filePath = req.url === "/" 
              ? join(adminPath, "index.html")
              : join(adminPath, req.url);
            
            if (fs.existsSync(filePath)) {
              const content = fs.readFileSync(filePath);
              const contentType = req.url.endsWith(".js") ? "application/javascript" : 
                                 req.url.endsWith(".css") ? "text/css" : "text/html";
              res.setHeader("Content-Type", contentType);
              res.end(content);
              return;
            }
            // Pass through if file not found (let it hit the API proxy)
            next();
          });
        }
      }
    }
  ]
});
