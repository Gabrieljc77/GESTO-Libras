"use strict";

const palavras = [
    "GESTO", "LIBRA", "SINAL", "AMIGO", "ALUNO", "FALAR",
    "LIVRO", "VIDEO", "TEXTO", "APOIO", "LUGAR", "AULAS"
];

const TOTAL_TENTATIVAS = 6;
const TAMANHO_PALAVRA = 5;
const TOTAL_DICAS = 3;
const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

let palavraSecreta = "";
let palavraAnterior = "";
let tentativaAtual = 0;
let letrasDigitadas = [];
let pontos = 0;
let rodadaEncerrada = false;
let dicasRestantes = TOTAL_DICAS;
let posicoesDicaUsadas = new Set();
let temporizadorProximaRodada = null;
let mostrarLetrasNasCaixas = false;
let ordemTecladoAnterior = [];

let linhas = [];
let botoes = [];
let enviar;
let apagar;
let contador;
let restantes;
let pontuacao;
let dicas;
let mensagem;
let board;
let keyboardPanel;
let hintButton;
let teclado;
let tituloTeclado;
let seletorModo;

function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
}

function imagemDaLetra(letra) {
    const codigo = letra.charCodeAt(0) - 64;
    return `sinais/sinal_${String(codigo).padStart(2, "0")}.png`;
}

function embaralhar(lista) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

function novaOrdemTeclado() {
    let nova = embaralhar(ALFABETO);
    if (ordemTecladoAnterior.length === nova.length && nova.every((letra, i) => letra === ordemTecladoAnterior[i])) {
        [nova[0], nova[1]] = [nova[1], nova[0]];
    }
    ordemTecladoAnterior = [...nova];
    return nova;
}

function renderizarConteudoDoBotao(botao) {
    const letra = botao.dataset.letter;
    botao.innerHTML = "";

    const imagem = document.createElement("img");
    imagem.src = imagemDaLetra(letra);
    imagem.alt = "";
    imagem.setAttribute("aria-hidden", "true");
    botao.appendChild(imagem);
    botao.setAttribute("aria-label", `Sinal da letra ${letra}`);
}

function renderizarCasa(casa, letra) {
    casa.innerHTML = "";
    casa.classList.remove("modo-letras");

    if (!letra) {
        delete casa.dataset.letter;
        return;
    }

    casa.dataset.letter = letra;

    if (mostrarLetrasNasCaixas) {
        casa.textContent = letra;
        casa.classList.add("modo-letras");
        return;
    }

    const imagem = document.createElement("img");
    imagem.src = imagemDaLetra(letra);
    imagem.alt = `Sinal da letra ${letra}`;
    casa.appendChild(imagem);
}

function atualizarModoVisual() {
    document.querySelectorAll(".letter[data-letter]").forEach(casa => {
        renderizarCasa(casa, casa.dataset.letter);
    });
}

function embaralharTeclado() {
    if (!teclado) return;
    novaOrdemTeclado().forEach(letra => {
        const botao = botoes.find(item => item.dataset.letter === letra);
        if (botao) teclado.appendChild(botao);
    });
}

function montarInterface() {
    const mount = document.querySelector("#gameMount");
    if (!mount) return;

    const main = mount.closest("main");
    seletorModo = criarElemento("label", "seletor-modo");
    const textoSinais = criarElemento("span", "modo-label ativo", "Caixas com sinais");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "modoVisual";
    checkbox.setAttribute("aria-label", "Alternar visual das caixas entre sinais e letras normais");
    const caixaVisual = criarElemento("span", "checkbox-visual");
    const textoLetras = criarElemento("span", "modo-label", "Caixas com letras");
    seletorModo.append(textoSinais, checkbox, caixaVisual, textoLetras);

    if (main) {
        const tituloPagina = main.querySelector(".titulo");
        main.insertBefore(seletorModo, tituloPagina);
    }

    checkbox.addEventListener("change", () => {
        mostrarLetrasNasCaixas = checkbox.checked;
        textoSinais.classList.toggle("ativo", !mostrarLetrasNasCaixas);
        textoLetras.classList.toggle("ativo", mostrarLetrasNasCaixas);
        seletorModo.classList.toggle("letras-ativas", mostrarLetrasNasCaixas);
        atualizarModoVisual();
    });

    const gameTop = criarElemento("section", "game-top");
    gameTop.setAttribute("aria-label", "Área principal do jogo");

    const comoJogar = criarElemento("aside", "como-jogar");
    comoJogar.appendChild(criarElemento("h2", "", "Como jogar"));

    const lista = criarElemento("ol");
    [
        "Descubra a palavra usando os sinais.",
        "Monte sua tentativa usando os sinais abaixo.",
        "Após enviar, cada casa indica se o gesto está correto, em outra posição ou ausente.",
        "Você tem 6 tentativas para acertar a palavra."
    ].forEach(item => lista.appendChild(criarElemento("li", "", item)));
    comoJogar.appendChild(lista);

    const nota = criarElemento("p", "nota-teclado");
    const forte = criarElemento("strong", "", "Importante: ");
    nota.append(forte, document.createTextNode("use somente o teclado de sinais do próprio jogo. Não utilize o teclado do dispositivo."));
    comoJogar.appendChild(nota);

    const boardArea = criarElemento("section", "board-area");
    board = criarElemento("section", "board");
    board.setAttribute("aria-label", "Tabuleiro do jogo");
    const attempts = criarElemento("section", "attempts");

    for (let i = 0; i < TOTAL_TENTATIVAS; i += 1) {
        const linha = criarElemento("section", "attempt");
        for (let j = 0; j < TAMANHO_PALAVRA; j += 1) {
            linha.appendChild(criarElemento("span", "letter"));
        }
        attempts.appendChild(linha);
    }

    board.appendChild(attempts);
    boardArea.appendChild(board);
    gameTop.append(comoJogar, boardArea, criarElemento("span", "game-spacer"));

    keyboardPanel = criarElemento("section", "keyboard-panel");
    tituloTeclado = criarElemento("h2", "", "Selecione os sinais (gestos) para formar sua tentativa");
    keyboardPanel.appendChild(tituloTeclado);

    teclado = criarElemento("section", "keyboard");
    teclado.setAttribute("aria-label", "Sinais de Libras");

    novaOrdemTeclado().forEach(letra => {
        const botao = criarElemento("button");
        botao.type = "button";
        botao.dataset.letter = letra;
        renderizarConteudoDoBotao(botao);
        teclado.appendChild(botao);
    });

    const controls = criarElemento("section", "controls");
    apagar = criarElemento("button", "btn-apagar", "Apagar");
    apagar.type = "button";

    const tentativasRestantes = criarElemento("span", "tentativas-restantes");
    tentativasRestantes.append(document.createTextNode("Tentativas: "));
    restantes = criarElemento("strong", "", String(TOTAL_TENTATIVAS));
    restantes.id = "restantes";
    tentativasRestantes.appendChild(restantes);

    enviar = criarElemento("button", "btn-enviar", "Enviar");
    enviar.type = "button";
    controls.append(apagar, tentativasRestantes, enviar);

    mensagem = criarElemento("p");
    mensagem.id = "mensagem";
    mensagem.setAttribute("aria-live", "polite");

    keyboardPanel.append(teclado, controls, mensagem);

    const status = criarElemento("section", "status");
    status.setAttribute("aria-label", "Informações da partida");

    const cardPontos = criarElemento("article");
    cardPontos.append(criarElemento("strong", "", "Pontuação"));
    pontuacao = criarElemento("span", "", "0");
    pontuacao.id = "pontuacao";
    cardPontos.appendChild(pontuacao);

    const cardTentativas = criarElemento("article");
    cardTentativas.append(criarElemento("strong", "", "Tentativas"));
    contador = criarElemento("span", "", `0/${TOTAL_TENTATIVAS}`);
    contador.id = "contador";
    cardTentativas.appendChild(contador);

    hintButton = criarElemento("button", "status-hint");
    hintButton.type = "button";
    hintButton.setAttribute("aria-label", "Usar uma dica");
    hintButton.append(criarElemento("strong", "", "Dica"));
    dicas = criarElemento("span", "", String(TOTAL_DICAS));
    dicas.id = "dicas";
    hintButton.appendChild(dicas);

    status.append(cardPontos, cardTentativas, hintButton);
    mount.append(gameTop, keyboardPanel, status);

    linhas = Array.from(document.querySelectorAll(".attempt"));
    botoes = Array.from(document.querySelectorAll(".keyboard button"));
}

function sortearPalavra() {
    let novaPalavra = palavras[Math.floor(Math.random() * palavras.length)];
    if (palavras.length > 1) {
        while (novaPalavra === palavraAnterior) {
            novaPalavra = palavras[Math.floor(Math.random() * palavras.length)];
        }
    }
    palavraAnterior = novaPalavra;
    return novaPalavra;
}

function animar(elemento, classe, duracao = 650) {
    if (!elemento) return;
    elemento.classList.remove(classe);
    void elemento.offsetWidth;
    elemento.classList.add(classe);
    window.setTimeout(() => elemento.classList.remove(classe), duracao);
}

function definirMensagem(texto, tipo = "normal") {
    mensagem.textContent = texto;
    mensagem.classList.remove("mensagem-erro", "mensagem-sucesso", "mensagem-dica");
    if (tipo === "erro") mensagem.classList.add("mensagem-erro");
    if (tipo === "sucesso") mensagem.classList.add("mensagem-sucesso");
    if (tipo === "dica") mensagem.classList.add("mensagem-dica");
}

function casasAtuais() {
    return Array.from(linhas[tentativaAtual]?.querySelectorAll(".letter") || []);
}

function limparTabuleiro() {
    linhas.forEach(linha => {
        linha.querySelectorAll(".letter").forEach(casa => {
            casa.innerHTML = "";
            casa.className = "letter";
            delete casa.dataset.letter;
        });
    });
}

function limparTeclado() {
    botoes.forEach(botao => {
        botao.classList.remove("correct", "present", "wrong", "hinted");
        botao.disabled = false;
    });
}

function atualizarContadores() {
    contador.textContent = `${tentativaAtual}/${TOTAL_TENTATIVAS}`;
    restantes.textContent = TOTAL_TENTATIVAS - tentativaAtual;
    dicas.textContent = dicasRestantes;
    hintButton.disabled = dicasRestantes <= 0 || rodadaEncerrada;
}

function iniciarNovaRodada() {
    if (temporizadorProximaRodada) {
        clearTimeout(temporizadorProximaRodada);
        temporizadorProximaRodada = null;
    }

    palavraSecreta = sortearPalavra();
    tentativaAtual = 0;
    letrasDigitadas = [];
    rodadaEncerrada = false;
    dicasRestantes = TOTAL_DICAS;
    posicoesDicaUsadas = new Set();

    limparTabuleiro();
    limparTeclado();
    embaralharTeclado();
    atualizarModoVisual();
    enviar.disabled = false;
    apagar.disabled = false;
    atualizarContadores();
    definirMensagem("Nova palavra sorteada. Boa sorte!");
    animar(board, "round-enter", 520);
}

function atualizarTabuleiro() {
    const casas = casasAtuais();
    casas.forEach((casa, indice) => {
        const letra = letrasDigitadas[indice];
        casa.classList.toggle("filled", Boolean(letra));
        renderizarCasa(casa, letra);
    });
}

function adicionarLetra(letra) {
    if (rodadaEncerrada || tentativaAtual >= TOTAL_TENTATIVAS || letrasDigitadas.length >= TAMANHO_PALAVRA) return;
    letrasDigitadas.push(letra);
    atualizarTabuleiro();
    definirMensagem("");
}

function apagarLetra() {
    if (rodadaEncerrada || letrasDigitadas.length === 0) return;
    letrasDigitadas.pop();
    atualizarTabuleiro();
}

function avaliarTentativa(tentativa, palavra) {
    const resultado = Array(TAMANHO_PALAVRA).fill("wrong");
    const letrasRestantes = palavra.split("");

    tentativa.forEach((letra, indice) => {
        if (letra === palavra[indice]) {
            resultado[indice] = "correct";
            letrasRestantes[indice] = null;
        }
    });

    tentativa.forEach((letra, indice) => {
        if (resultado[indice] === "correct") return;
        const posicao = letrasRestantes.indexOf(letra);
        if (posicao !== -1) {
            resultado[indice] = "present";
            letrasRestantes[posicao] = null;
        }
    });

    return resultado;
}

function atualizarTeclado(tentativa, resultado) {
    tentativa.forEach((letra, indice) => {
        const botao = botoes.find(item => item.dataset.letter === letra);
        if (!botao) return;

        const classe = resultado[indice];
        if (classe === "correct") {
            botao.classList.remove("present", "wrong");
            botao.classList.add("correct");
        } else if (classe === "present" && !botao.classList.contains("correct")) {
            botao.classList.remove("wrong");
            botao.classList.add("present");
        } else if (!botao.classList.contains("correct") && !botao.classList.contains("present")) {
            botao.classList.add("wrong");
        }
    });
}

function usarDica() {
    if (rodadaEncerrada || dicasRestantes <= 0) return;

    const candidatas = [];
    for (let i = 0; i < palavraSecreta.length; i += 1) {
        if (!posicoesDicaUsadas.has(i)) candidatas.push(i);
    }

    if (!candidatas.length) return;

    const posicao = candidatas[Math.floor(Math.random() * candidatas.length)];
    posicoesDicaUsadas.add(posicao);
    dicasRestantes -= 1;

    const letra = palavraSecreta[posicao];
    const botao = botoes.find(item => item.dataset.letter === letra);
    if (botao) {
        animar(botao, "hinted", 1700);
        botao.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }

    definirMensagem(`Dica: o sinal correspondente à posição ${posicao + 1} foi destacado no teclado.`, "dica");
    atualizarContadores();
    animar(hintButton, "hint-card-pulse", 600);
}

function prepararProximaRodada(texto, sucesso = false) {
    rodadaEncerrada = true;
    botoes.forEach(botao => botao.disabled = true);
    enviar.disabled = true;
    apagar.disabled = true;
    hintButton.disabled = true;
    definirMensagem(texto, sucesso ? "sucesso" : "normal");

    if (sucesso) animar(board, "board-success", 850);

    temporizadorProximaRodada = setTimeout(iniciarNovaRodada, 1350);
}

function enviarTentativa() {
    if (rodadaEncerrada) return;

    if (letrasDigitadas.length < TAMANHO_PALAVRA) {
        definirMensagem("Selecione 5 sinais antes de enviar.", "erro");
        animar(keyboardPanel, "feedback-error", 520);
        return;
    }

    const tentativa = letrasDigitadas.join("");
    const resultado = avaliarTentativa(letrasDigitadas, palavraSecreta);
    const casas = casasAtuais();

    casas.forEach((casa, indice) => {
        window.setTimeout(() => {
            casa.classList.add(resultado[indice], "reveal");
        }, indice * 85);
    });

    atualizarTeclado(letrasDigitadas, resultado);

    if (tentativa === palavraSecreta) {
        pontos += 100;
        pontuacao.textContent = pontos;
        contador.textContent = `${tentativaAtual + 1}/${TOTAL_TENTATIVAS}`;
        restantes.textContent = TOTAL_TENTATIVAS - (tentativaAtual + 1);
        prepararProximaRodada("Muito bem! Palavra correta! Sorteando a próxima...", true);
        return;
    }

    tentativaAtual += 1;
    atualizarContadores();
    letrasDigitadas = [];

    if (tentativaAtual >= TOTAL_TENTATIVAS) {
        prepararProximaRodada(`Fim das tentativas! A palavra era ${palavraSecreta}. Sorteando outra...`);
        return;
    }

    definirMensagem("Continue tentando!");
    atualizarTabuleiro();
}

function registrarEventos() {
    botoes.forEach(botao => {
        botao.addEventListener("click", () => adicionarLetra(botao.dataset.letter));
    });

    apagar.addEventListener("click", apagarLetra);
    enviar.addEventListener("click", enviarTentativa);
    hintButton.addEventListener("click", usarDica);

    document.addEventListener("keydown", evento => {
        const teclasBloqueadas = /^[A-Za-z]$/.test(evento.key) || evento.key === "Enter" || evento.key === "Backspace";
        if (!teclasBloqueadas) return;

        evento.preventDefault();
        if (!rodadaEncerrada) {
            definirMensagem("Use o teclado de sinais do próprio jogo.", "erro");
            animar(keyboardPanel, "feedback-error", 520);
        }
    });
}

montarInterface();
registrarEventos();
iniciarNovaRodada();
