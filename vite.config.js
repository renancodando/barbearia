// RNCWEB
import { defineConfig, loadEnv } from "vite";
import { empresa } from "./src/scripts/configuracao.js";

export default defineConfig(({ mode }) => {
  const variaveis = loadEnv(mode, process.cwd(), "");
  const URL_PUBLICA = variaveis.CAVALIER_URL || empresa.url;
  const url = URL_PUBLICA ? new URL("./", URL_PUBLICA).href : "";
  const imagem = url ? new URL("texturas/oficina.webp", url).href : "";
  const dados = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: empresa.nome,
    telephone: "+" + empresa.whatsapp,
    ...(url && { url, image: imagem }),
    ...(empresa.endereco && { address: { "@type": "PostalAddress", streetAddress: empresa.endereco } }),
    ...(empresa.mapas && { hasMap: empresa.mapas }),
  };
  return {
    base: "./",
    plugins: [{
      name: "metadados-cavalier",
      transformIndexHtml() {
        return [
          { tag: "script", attrs: { type: "application/ld+json" }, children: JSON.stringify(dados).replace(/</g, "\\u003c") },
          ...(url ? [
            { tag: "link", attrs: { rel: "canonical", href: url } },
            { tag: "meta", attrs: { property: "og:url", content: url } },
            { tag: "meta", attrs: { property: "og:image", content: imagem } },
          ] : []),
        ];
      },
      generateBundle() {
        if (!url) return;
        const seguro = url.replace(/&/g, "&amp;").replace(/</g, "&lt;");
        this.emitFile({
          type: "asset", fileName: "sitemap.xml",
          source: '<?xml version="1.0" encoding="UTF-8"?>\n<!-- RNCWEB -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>' + seguro + "</loc></url></urlset>\n",
        });
        this.emitFile({
          type: "asset", fileName: "robots.txt",
          source: "# RNCWEB\nUser-agent: *\nAllow: /\nSitemap: " + new URL("sitemap.xml", url).href + "\n",
        });
      },
    }],
  };
});
