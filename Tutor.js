"use strict";

const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const LINHAS_TECLADO = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ç"],
    ["Z", "X", "C", "V", "B", "N", "M"]
];

let ordemTutorial = embaralhar([...ALFABETO]);
let etapaAtual = 0;
let maiusculasAtivas = true;
let transicionando = false;

let container;
let imagemTutorial;
let respostaTutorial;
let mensagemTutorial;
let barraPreenchida;
let progressoContador;
let botaoDica;
let botaoVerificar;
let botaoApagar;
let shiftTutorial;
let botoesTeclado = [];

function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
}

function embaralhar(lista) {
    for (let i = lista.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [lista[i], lista[j]] = [lista[j], lista[i]];
    }
    return lista;
}

function numeroDaLetra(letra) {
    return letra.charCodeAt(0) - 64;
}

function imagemDaLetra(letra) {
    return `sinais/sinal_${String(numeroDaLetra(letra)).padStart(2, "0")}.png`;
}

function letraAtual() {
    return ordemTutorial[etapaAtual];
}

function animar(elemento, classe, duracao = 650) {
    if (!elemento) return;
    elemento.classList.remove(classe);
    void elemento.offsetWidth;
    elemento.classList.add(classe);
    window.setTimeout(() => elemento.classList.remove(classe), duracao);
}

function montarInterface() {
    container = document.querySelector("#tutorialContainer");
    const mount = document.querySelector("#tutorialMount");
    if (!mount) return;

    const progressoArea = criarElemento("section", "progresso-area");
    progressoArea.setAttribute("aria-label", "Progresso do tutorial");
    progressoArea.appendChild(criarElemento("span", "progresso-texto", "Progresso do tutorial"));

    const barra = criarElemento("div", "barra-progresso");
    barraPreenchida = criarElemento("div", "barra-preenchida");
    barra.appendChild(barraPreenchida);
    progressoArea.appendChild(barra);

    progressoContador = criarElemento("span", "progresso-contador", "1 / 26");
    progressoArea.appendChild(progressoContador);

    const conteudo = criarElemento("section", "conteudo-tutorial");
    const titulo = criarElemento("header", "titulo");
    titulo.append(
        criarElemento("h1", "", "Tutorial"),
        criarElemento("p", "", "Observe o sinal e digite a resposta.")
    );

    const sinal = criarElemento("figure", "sinal");
    imagemTutorial = document.createElement("img");
    imagemTutorial.alt = "Sinal em Libras do tutorial";
    sinal.appendChild(imagemTutorial);

    const form = criarElemento("form", "form-tutorial");
    form.autocomplete = "off";
    form.addEventListener("submit", evento => evento.preventDefault());

    const resposta = criarElemento("fieldset", "resposta");
    const legenda = criarElemento("legend", "sr-only", "Resposta do tutorial");
    respostaTutorial = document.createElement("input");
    respostaTutorial.id = "respostaTutorial";
    respostaTutorial.type = "text";
    respostaTutorial.maxLength = 1;
    respostaTutorial.readOnly = true;
    respostaTutorial.setAttribute("aria-label", "Digite a letra correspondente");
    resposta.append(legenda, respostaTutorial);

    const teclado = criarElemento("nav", "teclado");
    teclado.setAttribute("aria-label", "Teclado de letras");

    LINHAS_TECLADO.forEach((linhaLetras, indiceLinha) => {
        const linha = criarElemento("section", "linha-teclado");

        if (indiceLinha === 2) {
            shiftTutorial = criarElemento("button", "tecla-especial", "⇧");
            shiftTutorial.type = "button";
            shiftTutorial.id = "shiftTutorial";
            shiftTutorial.setAttribute("aria-label", "Maiúsculas");
            linha.appendChild(shiftTutorial);
        }

        linhaLetras.forEach(letra => {
            const botao = criarElemento("button", "", letra);
            botao.type = "button";
            botao.dataset.key = letra;
            linha.appendChild(botao);
        });

        if (indiceLinha === 2) {
            botaoApagar = criarElemento("button", "tecla-especial", "⌫");
            botaoApagar.type = "button";
            botaoApagar.id = "apagarTutorial";
            botaoApagar.setAttribute("aria-label", "Apagar resposta");
            linha.appendChild(botaoApagar);
        }

        teclado.appendChild(linha);
    });

    const acoes = criarElemento("section", "acoes");
    botaoDica = criarElemento("button", "botao-acao botao-dica", "💡 Dica");
    botaoDica.type = "button";
    botaoVerificar = criarElemento("button", "botao-acao botao-verificar", "✓ Verificar");
    botaoVerificar.type = "button";
    acoes.append(botaoDica, botaoVerificar);

    mensagemTutorial = criarElemento("p", "mensagem");
    mensagemTutorial.id = "mensagemTutorial";
    mensagemTutorial.setAttribute("aria-live", "polite");

    form.append(resposta, teclado, acoes);
    conteudo.append(titulo, sinal, form, mensagemTutorial);
    mount.append(progressoArea, conteudo);

    botoesTeclado = Array.from(document.querySelectorAll("[data-key]"));
}

function preencherResposta(letra) {
    if (transicionando) return;
    respostaTutorial.value = maiusculasAtivas ? letra.toUpperCase() : letra.toLowerCase();
    respostaTutorial.classList.remove("resposta-erro", "resposta-certa");
    mensagemTutorial.textContent = "";
}

function atualizarTutorial() {
    const letra = letraAtual();
    imagemTutorial.src = imagemDaLetra(letra);
    imagemTutorial.alt = `Sinal em Libras correspondente à letra ${letra}`;
    respostaTutorial.value = "";
    mensagemTutorial.textContent = "";
    respostaTutorial.classList.remove("resposta-erro", "resposta-certa");

    const progresso = ((etapaAtual + 1) / ordemTutorial.length) * 100;
    barraPreenchida.style.width = `${progresso}%`;
    progressoContador.textContent = `${etapaAtual + 1} / ${ordemTutorial.length}`;
    animar(imagemTutorial, "sinal-troca", 430);
}

function concluirTutorial() {
    mensagemTutorial.textContent = "Parabéns! Você concluiu as 26 etapas do tutorial.";
    barraPreenchida.style.width = "100%";
    progressoContador.textContent = "26 / 26";
    botaoVerificar.disabled = true;
    botaoDica.disabled = true;
    botoesTeclado.forEach(botao => { botao.disabled = true; });
    botaoApagar.disabled = true;
    shiftTutorial.disabled = true;
    animar(container, "tutorial-concluido", 950);
}

function feedbackErro(mensagem) {
    mensagemTutorial.textContent = mensagem;
    respostaTutorial.classList.add("resposta-erro");
    animar(container, "tutorial-erro", 620);
    animar(respostaTutorial, "input-shake", 520);
}

function verificarResposta() {
    if (transicionando || botaoVerificar.disabled) return;

    if (!respostaTutorial.value) {
        feedbackErro("Selecione uma letra antes de verificar.");
        return;
    }

    const resposta = respostaTutorial.value.toUpperCase();
    const correta = letraAtual();

    if (resposta !== correta) {
        feedbackErro("Resposta incorreta. Tente novamente.");
        return;
    }

    respostaTutorial.classList.remove("resposta-erro");
    respostaTutorial.classList.add("resposta-certa");
    mensagemTutorial.textContent = "Muito bem! Próximo sinal...";
    animar(container, "tutorial-acerto", 650);

    if (etapaAtual === ordemTutorial.length - 1) {
        transicionando = true;
        window.setTimeout(concluirTutorial, 450);
        return;
    }

    transicionando = true;
    etapaAtual += 1;
    window.setTimeout(() => {
        atualizarTutorial();
        transicionando = false;
    }, 600);
}

function registrarEventos() {
    botoesTeclado.forEach(botao => {
        botao.addEventListener("click", () => preencherResposta(botao.dataset.key));
    });

    shiftTutorial.addEventListener("click", () => {
        maiusculasAtivas = !maiusculasAtivas;
        mensagemTutorial.textContent = maiusculasAtivas ? "Modo maiúsculo ativado." : "Modo minúsculo ativado.";
        animar(shiftTutorial, "tecla-pulse", 350);
    });

    botaoApagar.addEventListener("click", () => {
        if (transicionando) return;
        respostaTutorial.value = "";
        respostaTutorial.classList.remove("resposta-erro", "resposta-certa");
    });

    botaoDica.addEventListener("click", () => {
        if (transicionando) return;
        mensagemTutorial.textContent = `Dica: a resposta é a letra ${letraAtual()}.`;
        animar(botaoDica, "tecla-pulse", 350);
    });

    botaoVerificar.addEventListener("click", verificarResposta);

    document.addEventListener("keydown", evento => {
        if (botaoVerificar.disabled || transicionando) return;

        const tecla = evento.key.toUpperCase();
        if (/^[A-Z]$/.test(tecla)) {
            preencherResposta(tecla);
        } else if (evento.key === "Backspace") {
            respostaTutorial.value = "";
        } else if (evento.key === "Enter") {
            evento.preventDefault();
            verificarResposta();
        }
    });
}

montarInterface();
registrarEventos();
atualizarTutorial();
