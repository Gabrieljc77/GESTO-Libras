"use strict";

const opcoesMenu = [
    { href: "Jogar.html", icone: "▶️", texto: "Jogar" },
    { href: "Tutor.html", icone: "▢", texto: "Tutorial" }
];

const integrantes = [
    { nome: "Pedro Schumacker", ra: "10771366" },
    { nome: "Rafael Jardim", ra: "10771392" },
    { nome: "Gabriel Jardim", ra: "10771388" },
    { nome: "Guilherme Tavora", ra: "10771396" }
];

function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
}

function montarMenu() {
    const mount = document.querySelector("#menuMount");
    if (!mount) return;

    const nav = criarElemento("nav", "menu-opcoes");

    opcoesMenu.forEach((opcao, indice) => {
        const link = criarElemento("a", "menu-link menu-entrada");
        link.href = opcao.href;
        link.style.setProperty("--delay", `${indice * 90}ms`);

        const icone = criarElemento("span", "icone", opcao.icone);
        icone.setAttribute("aria-hidden", "true");
        link.append(icone, criarElemento("span", "", opcao.texto));
        nav.appendChild(link);
    });

    const linha = criarElemento("hr", "linha");
    const secaoIntegrantes = criarElemento("section", "integrantes");
    secaoIntegrantes.appendChild(criarElemento("h2", "", "♧ Integrantes do grupo:"));

    const quadro = criarElemento("section", "quadro-integrantes");
    const cabecalho = criarElemento("header", "linha-integrante cabecalho-integrantes");
    cabecalho.append(
        criarElemento("span", "nome-integrante", "Nome"),
        criarElemento("span", "ra-integrante", "RA")
    );
    quadro.appendChild(cabecalho);

    integrantes.forEach((integrante, indice) => {
        const linhaIntegrante = criarElemento("article", "linha-integrante integrante-entrada");
        linhaIntegrante.style.setProperty("--delay", `${180 + indice * 70}ms`);
        linhaIntegrante.append(
            criarElemento("span", "nome-integrante", integrante.nome),
            criarElemento("span", "ra-integrante", integrante.ra)
        );
        quadro.appendChild(linhaIntegrante);
    });

    secaoIntegrantes.appendChild(quadro);
    mount.append(nav, linha, secaoIntegrantes);
}

montarMenu();
