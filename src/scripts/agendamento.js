// RNCWEB
export function diaLocal(data) {
  return [data.getFullYear(), data.getMonth() + 1, data.getDate()]
    .map((numero, indice) => String(numero).padStart(indice ? 2 : 4, "0"))
    .join("-");
}

export function linkAgendamento(empresa, servico, data, hora) {
  const dia = data.split("-").reverse().join("/");
  const mensagem = `Olá, ${empresa.operadora}! Gostaria de solicitar ${servico} na ${empresa.nome}. Minha preferência é ${dia} às ${hora}. Podem confirmar a disponibilidade?`;
  return "https://wa.me/" + empresa.whatsapp + "?text=" + encodeURIComponent(mensagem);
}

export function iniciarAgendamento(empresa, formatarPreco) {
  const janela = document.querySelector("#agendar");
  const formulario = janela.querySelector("form");
  const { servico, data, hora } = formulario.elements;
  const resumo = janela.querySelector("#resumo-agenda");
  let origem = null;

  for (const item of empresa.servicos) servico.add(new Option(item.nome, item.nome));

  function mostrarResumo() {
    const item = empresa.servicos.find((opcao) => opcao.nome === servico.value);
    resumo.textContent = item ? formatarPreco(item.preco) + " · " + item.duracao : "";
  }

  document.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-agendar]");
    if (!botao || janela.open) return;
    evento.preventDefault();
    origem = botao;
    data.min = diaLocal(new Date());
    hora.setCustomValidity("");
    const selecionado = empresa.servicos.find((item) => item.chave === botao.dataset.agendar);
    if (selecionado) servico.value = selecionado.nome;
    mostrarResumo();
    janela.showModal();
  });

  janela.addEventListener("close", () => origem?.focus({ preventScroll: true }));
  servico.addEventListener("change", mostrarResumo);
  formulario.addEventListener("input", () => hora.setCustomValidity(""));
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const preferencia = new Date(data.value + "T" + hora.value);
    if (preferencia <= new Date()) {
      hora.setCustomValidity("Escolha uma data e um horário futuros.");
      hora.reportValidity();
      return;
    }
    location.assign(linkAgendamento(empresa, servico.value, data.value, hora.value));
  });
}
