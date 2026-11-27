// RNCWEB
export function diaLocal(data) {
  return [data.getFullYear(), data.getMonth() + 1, data.getDate()]
    .map((n, i) => String(n).padStart(i ? 2 : 4, "0"))
    .join("-");
}
export function linkAgendamento(empresa, servico, data, hora) {
  const dia = data.split("-").reverse().join("/");
  const mensagem = `Olá, ${empresa.operadora}! Gostaria de solicitar ${servico} na ${empresa.nome}. Minha preferência é ${dia} às ${hora}. Podem confirmar a disponibilidade?`;
  return "https://wa.me/" + empresa.whatsapp + "?text=" + encodeURIComponent(mensagem);
}
export function iniciarAgendamento(empresa) {
  const janela = document.querySelector("#agendar");
  const formulario = janela.querySelector("form");
  const { servico, data, hora } = formulario.elements;
  const lista = document.querySelector("#lista-servicos");
  const saudar = "Olá, " + empresa.operadora + "! Gostaria de informações sobre a " + empresa.nome + ".";
  const contato = "https://wa.me/" + empresa.whatsapp + "?text=" + encodeURIComponent(saudar);
  document.querySelector("#whatsapp").href = contato;
  const moeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
  for (const item of empresa.servicos) {
    servico.add(new Option(item.nome, item.nome));
    const linha = document.createElement("li");
    const titulo = document.createElement("strong");
    titulo.textContent = item.nome;
    const valor = document.createElement("span");
    valor.className = "valor";
    valor.textContent = moeda.format(item.preco);
    const descricao = document.createElement("p");
    descricao.textContent = item.duracao + " · " + item.descricao;
    const botao = document.createElement("button");
    botao.type = "button";
    botao.dataset.agendar = item.nome;
    botao.textContent = "Solicitar ↗";
    botao.setAttribute("aria-label", "Solicitar " + item.nome.toLowerCase());
    linha.append(titulo, valor, descricao, botao);
    lista.append(linha);
  }
  const informacoes = document.querySelector("#informacoes");
  for (const [nome, valor, endereco] of [
    ["Horários", empresa.horario || "Consulte pelo WhatsApp", empresa.horario ? "" : contato],
    [
      "Localização",
      empresa.endereco || "Solicite o endereço pelo WhatsApp",
      empresa.mapas || (!empresa.endereco ? contato : ""),
    ],
  ]) {
    const dt = document.createElement("dt"),
      dd = document.createElement("dd");
    dt.textContent = nome;
    if (endereco) {
      const a = document.createElement("a");
      a.href = endereco;
      a.textContent = valor;
      dd.append(a);
    } else dd.textContent = valor;
    informacoes.append(dt, dd);
  }
  data.min = diaLocal(new Date());
  document.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-agendar]");
    if (!botao) return;
    evento.preventDefault();
    data.min = diaLocal(new Date());
    if (botao.dataset.agendar) servico.value = botao.dataset.agendar;
    janela.showModal();
  });
  janela.querySelector(".fechar").addEventListener("click", () => janela.close());
  janela.addEventListener("click", (evento) => {
    if (evento.target === janela) janela.close();
  });
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const agora = new Date();
    if (new Date(data.value + "T" + hora.value) <= agora) {
      hora.setCustomValidity("Escolha um horário futuro.");
      hora.reportValidity();
      return;
    }
    location.assign(linkAgendamento(empresa, servico.value, data.value, hora.value));
  });
  formulario.addEventListener("input", () => hora.setCustomValidity(""));
}
