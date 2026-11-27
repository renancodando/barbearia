# RNCWEB Barbearia

Site comercial da **RNCWEB**, com direção editorial em preto e bronze, navegação por seção, seleção de serviços, galeria e agendamento pelo WhatsApp.

## Executar e publicar

Use Node.js 20.19+ ou 22.12+. Execute `npm ci`, `npm run dev` e `npm run build`. Publique a pasta `dist` como site estático na Vercel ou no Cloudflare Pages. O site usa HTML, CSS e JavaScript com Vite para empacotamento.

## Personalizar

- Configure o WhatsApp, nome, serviços, preços, endereço e expediente em `src/scripts/configuracao.js`. Os valores iniciais são demonstrativos. Endereço e expediente vazios direcionam à consulta pelo WhatsApp.
- Ajuste a assinatura visual e os textos em `index.html` e as imagens em `public/texturas`. A ilustração da abertura retoma a composição da referência com uma versão para celular. Cada serviço usa a imagem no caminho `public/texturas/servico-<chave>.webp`.
- Preencha `empresa.url` ou defina `RNCWEB_URL` com a URL definitiva na compilação para gerar os metadados de compartilhamento, a URL canônica e o sitemap.
- O formulário pede data e horário de preferência. A barbearia confirma a disponibilidade pelo WhatsApp.

## Verificar

`npm test` confere a mensagem de agendamento e a formatação local da data. Os fluxos de navegação, seleção de serviço, galeria e agendamento foram exercitados no Chromium, com capturas de desktop e celular.

As licenças das fontes estão em `public/fontes`.
