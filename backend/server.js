/* =========================================================
   SISTEMA HOSPITALAR - HOSPITAL BOM CUIDADO
   SCRIPT PRINCIPAL
========================================================= */


/* =========================================================
   CONFIGURAÇÃO DA API
========================================================= */

// IMPORTANTE:
// Não coloque http://localhost:3000 aqui.
// Como o frontend e backend estão no mesmo Render,
// usamos apenas as rotas.

const API = "";


/* =========================================================
   FUNÇÃO AUXILIAR PARA REQUISIÇÕES
========================================================= */

async function requisicao(url, opcoes = {}) {

    try {

        const resposta = await fetch(API + url, {

            ...opcoes,

            headers: {

                "Content-Type": "application/json",

                ...(opcoes.headers || {})

            }

        });


        let dados;

        try {

            dados = await resposta.json();

        } catch {

            dados = {};

        }


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                dados.mensagem ||
                "Erro na comunicação com o servidor."
            );

        }


        return dados;

    } catch (erro) {

        console.error("Erro:", erro);

        throw erro;

    }

}


/* =========================================================
   LOGIN
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const formularioLogin =
        document.getElementById("loginForm");


    if (!formularioLogin) {
        return;
    }


    formularioLogin.addEventListener("submit", async (event) => {

        event.preventDefault();


        const campoUsuario =
            document.getElementById("usuario");

        const campoSenha =
            document.getElementById("senha");


        if (!campoUsuario || !campoSenha) {

            alert(
                "Não foi possível encontrar os campos de login."
            );

            return;

        }


        const usuario =
            campoUsuario.value.trim();

        const senha =
            campoSenha.value.trim();


        if (!usuario || !senha) {

            alert(
                "Digite o usuário e a senha."
            );

            return;

        }


        const botao =
            formularioLogin.querySelector("button");


        if (botao) {

            botao.disabled = true;

            botao.textContent =
                "Entrando...";

        }


        try {

            const dados =
                await requisicao("/login", {

                    method: "POST",

                    body: JSON.stringify({

                        usuario: usuario,

                        senha: senha

                    })

                });


            console.log(
                "Login realizado:",
                dados
            );


            // Salva informações da sessão
            localStorage.setItem(
                "usuario",
                dados.usuario
            );

            localStorage.setItem(
                "tipo",
                dados.tipo
            );


            localStorage.setItem(
                "logado",
                "true"
            );


            /*
               REDIRECIONAMENTO POR TIPO DE USUÁRIO
            */

            if (dados.tipo === "medico") {

                window.location.href =
                    "medico.html";

            }

            else if (dados.tipo === "triagem") {

                window.location.href =
                    "triagem.html";

            }

            else if (dados.tipo === "atendimento") {

                window.location.href =
                    "atendimento.html";

            }

            else {

                window.location.href =
                    "dashboard.html";

            }


        } catch (erro) {

            alert(
                erro.message ||
                "Usuário ou senha inválidos."
            );

        } finally {

            if (botao) {

                botao.disabled = false;

                botao.textContent =
                    "Entrar";

            }

        }

    });

});


/* =========================================================
   VERIFICAR LOGIN
========================================================= */

function verificarLogin() {

    const logado =
        localStorage.getItem("logado");

    const usuario =
        localStorage.getItem("usuario");

    const tipo =
        localStorage.getItem("tipo");


    if (
        logado !== "true" ||
        !usuario ||
        !tipo
    ) {

        window.location.href =
            "index.html";

        return false;

    }


    return true;

}


/* =========================================================
   SAIR DO SISTEMA
========================================================= */

function sair() {

    localStorage.removeItem("usuario");

    localStorage.removeItem("tipo");

    localStorage.removeItem("logado");


    window.location.href =
        "index.html";

}


/* =========================================================
   PEGAR USUÁRIO LOGADO
========================================================= */

function usuarioLogado() {

    return {

        usuario:
            localStorage.getItem("usuario"),

        tipo:
            localStorage.getItem("tipo")

    };

}


/* =========================================================
   CADASTRAR PACIENTE
========================================================= */

async function cadastrarPaciente(dadosPaciente) {

    try {

        const resultado =
            await requisicao(
                "/atendimento",
                {

                    method: "POST",

                    body: JSON.stringify(
                        dadosPaciente
                    )

                }
            );


        alert(
            resultado.mensagem ||
            "Paciente cadastrado com sucesso."
        );


        return resultado;


    } catch (erro) {

        alert(
            erro.message ||
            "Erro ao cadastrar paciente."
        );


        return null;

    }

}


/* =========================================================
   BUSCAR PACIENTES
========================================================= */

async function buscarPacientes() {

    try {

        const pacientes =
            await requisicao(
                "/pacientes"
            );


        return pacientes;


    } catch (erro) {

        console.error(
            "Erro ao buscar pacientes:",
            erro
        );


        alert(
            "Não foi possível carregar os pacientes."
        );


        return [];

    }

}


/* =========================================================
   CADASTRAR TRIAGEM
========================================================= */

async function cadastrarTriagem(dadosTriagem) {

    try {

        const resultado =
            await requisicao(
                "/triagem",
                {

                    method: "POST",

                    body: JSON.stringify(
                        dadosTriagem
                    )

                }
            );


        alert(
            resultado.mensagem ||
            "Triagem registrada com sucesso."
        );


        return resultado;


    } catch (erro) {

        alert(
            erro.message ||
            "Erro ao registrar triagem."
        );


        return null;

    }

}


/* =========================================================
   BUSCAR TRIAGENS
========================================================= */

async function buscarTriagens() {

    try {

        const triagens =
            await requisicao(
                "/triagens"
            );


        return triagens;


    } catch (erro) {

        console.error(
            "Erro ao buscar triagens:",
            erro
        );


        alert(
            "Não foi possível carregar as triagens."
        );


        return [];

    }

}


/* =========================================================
   CADASTRAR CONSULTA
========================================================= */

async function cadastrarConsulta(dadosConsulta) {

    try {

        const resultado =
            await requisicao(
                "/consulta",
                {

                    method: "POST",

                    body: JSON.stringify(
                        dadosConsulta
                    )

                }
            );


        alert(
            resultado.mensagem ||
            "Consulta registrada com sucesso."
        );


        return resultado;


    } catch (erro) {

        alert(
            erro.message ||
            "Erro ao registrar consulta."
        );


        return null;

    }

}


/* =========================================================
   BUSCAR CONSULTAS
========================================================= */

async function buscarConsultas() {

    try {

        const consultas =
            await requisicao(
                "/consultas"
            );


        return consultas;


    } catch (erro) {

        console.error(
            "Erro ao buscar consultas:",
            erro
        );


        alert(
            "Não foi possível carregar as consultas."
        );


        return [];

    }

}


/* =========================================================
   BUSCAR MEDICAMENTOS
========================================================= */

async function buscarMedicamentos() {

    try {

        const medicamentos =
            await requisicao(
                "/lista-medicacoes"
            );


        return medicamentos;


    } catch (erro) {

        console.error(
            "Erro ao buscar medicamentos:",
            erro
        );


        return [];

    }

}


/* =========================================================
   REGISTRAR ALTA
========================================================= */

async function registrarAlta(dadosAlta) {

    try {

        const resultado =
            await requisicao(
                "/alta",
                {

                    method: "POST",

                    body: JSON.stringify(
                        dadosAlta
                    )

                }
            );


        alert(
            resultado.mensagem ||
            "Alta hospitalar registrada."
        );


        return resultado;


    } catch (erro) {

        alert(
            erro.message ||
            "Erro ao registrar alta."
        );


        return null;

    }

}


/* =========================================================
   BUSCAR ALTAS
========================================================= */

async function buscarAltas() {

    try {

        const altas =
            await requisicao(
                "/altas"
            );


        return altas;


    } catch (erro) {

        console.error(
            "Erro ao buscar altas:",
            erro
        );


        alert(
            "Não foi possível carregar as altas."
        );


        return [];

    }

}


/* =========================================================
   TESTAR SERVIDOR
========================================================= */

async function testarServidor() {

    try {

        const resposta =
            await requisicao(
                "/health"
            );


        console.log(
            "Servidor funcionando:",
            resposta
        );


        return true;


    } catch (erro) {

        console.error(
            "Servidor indisponível:",
            erro
        );


        return false;

    }

}


/* =========================================================
   MOSTRAR USUÁRIO NA INTERFACE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const elementoUsuario =
            document.getElementById(
                "usuarioLogado"
            );


        if (elementoUsuario) {

            elementoUsuario.textContent =
                localStorage.getItem(
                    "usuario"
                ) || "";

        }


        const elementoTipo =
            document.getElementById(
                "tipoUsuario"
            );


        if (elementoTipo) {

            elementoTipo.textContent =
                localStorage.getItem(
                    "tipo"
                ) || "";

        }

    }
);


/* =========================================================
   EXPOR FUNÇÕES
   Permite que outros arquivos HTML/JS utilizem as funções.
========================================================= */

window.cadastrarPaciente =
    cadastrarPaciente;

window.buscarPacientes =
    buscarPacientes;

window.cadastrarTriagem =
    cadastrarTriagem;

window.buscarTriagens =
    buscarTriagens;

window.cadastrarConsulta =
    cadastrarConsulta;

window.buscarConsultas =
    buscarConsultas;

window.buscarMedicamentos =
    buscarMedicamentos;

window.registrarAlta =
    registrarAlta;

window.buscarAltas =
    buscarAltas;

window.verificarLogin =
    verificarLogin;

window.usuarioLogado =
    usuarioLogado;

window.sair =
    sair;

window.testarServidor =
    testarServidor;
