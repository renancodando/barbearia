# Cavalier Barbearia

Projeto comercial independente de **RNCWEB**. O site apresenta a barbearia e as etapas do corte com imagens editoriais, serviços e solicitação de horário pelo WhatsApp.

## Executar e publicar

Use Node.js 20.19+ ou 22.12+. Execute `npm ci`, `npm run dev` e `npm run build`. Publique a pasta `dist` como site estático na Vercel ou no Cloudflare Pages. O projeto usa Vite para desenvolver e empacotar HTML, CSS e JavaScript.

## Personalizar

- Atualize o WhatsApp, o nome da operadora, os serviços, os preços, o endereço e o expediente em `src/scripts/configuracao.js`. Os preços iniciais são demonstrativos. Endereço e expediente vazios direcionam a consulta ao WhatsApp.
- Ajuste a marca, os textos editoriais e as imagens em `index.html` e `public`.
- Preencha `empresa.url` ou defina `CAVALIER_URL` com a URL definitiva na compilação para gerar links absolutos de compartilhamento, URL canônica e sitemap.
- O formulário pede data e horário de preferência. A barbearia confirma disponibilidade pelo WhatsApp.

## Verificar

Execute `npm test` para conferir a composição da mensagem de agendamento e a formatação local da data.

As licenças das fontes estão em `public/fontes`.
