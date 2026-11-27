# RNCWEB Barbearia

Site comercial da **RNCWEB**, com a abertura preta e dourada da referência fornecida, navegação por seção, serviços selecionáveis, galeria e agendamento pelo WhatsApp.

## Executar e publicar

Use Node.js 20.19+ ou 22.12+. Execute `npm ci`, `npm run dev` e `npm run build`. Publique a pasta `dist` como site estático na Vercel ou no Cloudflare Pages. O site usa HTML, CSS e JavaScript com Vite para empacotamento.

## Personalizar

- Configure o WhatsApp, nome, serviços, preços, endereço e expediente em `src/scripts/configuracao.js`. Os valores iniciais são demonstrativos. Endereço e expediente vazios direcionam à consulta pelo WhatsApp.
- Ajuste a assinatura visual e os textos em `index.html` e as imagens em `public/texturas`. A ilustração da abertura foi recortada da referência fornecida. Os textos, controles e demais elementos da interface são nativos da página.
- Preencha `empresa.url` ou defina `RNCWEB_URL` com a URL definitiva na compilação para gerar os metadados de compartilhamento, a URL canônica e o sitemap.
- O formulário pede data e horário de preferência. A barbearia confirma a disponibilidade pelo WhatsApp.

## Verificar

`npm test` confere a mensagem de agendamento e a formatação local da data. O build foi exercitado em Chromium em 17 proporções de 320 a 3840 px, com verificação de navegação, seleção de serviços, teclado, galeria e destino do WhatsApp.

As licenças das fontes estão em `public/fontes`.
