// RNCWEB
import "../estilos/global.css";
import "../estilos/responsividade.css";
import { empresa } from "./configuracao.js";
import { iniciarAgendamento } from "./agendamento.js";
import { iniciarNavegacao } from "./navegacao.js";
import { atualizarContatos, iniciarJanelas, iniciarServicos, revelarSecoes } from "./interface.js";
import { iniciarGaleria } from "./galeria.js";

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

iniciarServicos(empresa, (preco) => moeda.format(preco));
iniciarAgendamento(empresa, (preco) => moeda.format(preco));
atualizarContatos(empresa);
iniciarGaleria();
iniciarJanelas();
iniciarNavegacao();
revelarSecoes();
