const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();


// ======================================================
// PORTA
// ======================================================

const PORT = process.env.PORT || 3000;


// ======================================================
// CONFIGURAÇÕES
// ======================================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// ======================================================
// FRONTEND
// ======================================================

const FRONTEND_PATH = path.join(
    __dirname,
    "../frontend"
);

app.use(express.static(FRONTEND_PATH));


// ======================================================
// BANCO DE DADOS
// ======================================================

const DB_FILE = path.join(
    __dirname,
    "db.json"
);


// ======================================================
// CRIAR BANCO INICIAL
// ======================================================

function criarBancoInicial() {

    const banco = {

        usuarios: [

            {
                usuario: "medico",
                senha: "123",
                tipo: "medico"
            },

            {
                usuario: "triagem",
                senha: "123",
                tipo: "triagem"
            },

            {
                usuario: "atendimento",
                senha: "123",
                tipo: "atendimento"
            }

        ],

        pacientes: [],

        triagens: [],

        consultas: [],

        altas: []

    };


    fs.writeFileSync(
        DB_FILE,
        JSON.stringify(banco, null, 2),
        "utf8"
    );


    return banco;
}


// ======================================================
// LER BANCO
// ======================================================

function readDB() {

    try {

        if (!fs.existsSync(DB_FILE)) {

            console.log(
                "db.json não encontrado. Criando banco..."
            );

            return criarBancoInicial();

        }


        const conteudo =
            fs.readFileSync(
                DB_FILE,
                "utf8"
            );


        if (!conteudo.trim()) {

            console.log(
                "db.json vazio. Criando banco..."
            );

            return criarBancoInicial();

        }


        const db =
            JSON.parse(conteudo);


        // Garante que todas as listas existam

        if (!Array.isArray(db.usuarios)) {
            db.usuarios = [];
        }

        if (!Array.isArray(db.pacientes)) {
            db.pacientes = [];
        }

        if (!Array.isArray(db.triagens)) {
            db.triagens = [];
        }

        if (!Array.isArray(db.consultas)) {
            db.consultas = [];
        }

        if (!Array.isArray(db.altas)) {
            db.altas = [];
        }


        // Garante os usuários principais

        const usuariosPadrao = [

            {
                usuario: "medico",
                senha: "123",
                tipo: "medico"
            },

            {
                usuario: "triagem",
                senha: "123",
                tipo: "triagem"
            },

            {
                usuario: "atendimento",
                senha: "123",
                tipo: "atendimento"
            }

        ];


        usuariosPadrao.forEach(
            usuarioPadrao => {

                const existe =
                    db.usuarios.some(
                        usuario =>
                            String(
                                usuario.usuario || ""
                            )
                            .trim()
                            .toLowerCase()
                            ===
                            usuarioPadrao.usuario
                    );


                if (!existe) {

                    db.usuarios.push(
                        usuarioPadrao
                    );

                }

            }
        );


        return db;


    } catch (erro) {

        console.error(
            "ERRO AO LER db.json:"
        );

        console.error(
            erro.message
        );


        throw erro;

    }

}


// ======================================================
// SALVAR BANCO
// ======================================================

function writeDB(data) {

    fs.writeFileSync(

        DB_FILE,

        JSON.stringify(
            data,
            null,
            2
        ),

        "utf8"

    );

}


// ======================================================
// TESTE DO SERVIDOR
// ======================================================

app.get("/health", (req, res) => {

    res.json({

        sucesso: true,

        mensagem:
            "Servidor do Hospital Bom Cuidado funcionando!",

        porta: PORT

    });

});


// ======================================================
// LOGIN
// ======================================================

app.post("/login", (req, res) => {

    try {

        const db = readDB();


        const usuario =
            String(
                req.body.usuario || ""
            )
            .trim()
            .toLowerCase();


        const senha =
            String(
                req.body.senha || ""
            )
            .trim();


        console.log(
            "Tentativa de login:",
            usuario
        );


        if (!usuario || !senha) {

            return res.status(400).json({

                sucesso: false,

                erro:
                    "Informe usuário e senha."

            });

        }


        const user =
            db.usuarios.find(
                u =>

                    String(
                        u.usuario || ""
                    )
                    .trim()
                    .toLowerCase()
                    === usuario

                    &&

                    String(
                        u.senha || ""
                    )
                    .trim()
                    === senha
            );


        if (!user) {

            console.log(
                "Login recusado:",
                usuario
            );


            return res.status(401).json({

                sucesso: false,

                erro:
                    "Usuário ou senha inválidos."

            });

        }


        console.log(
            "Login aceito:",
            user.usuario
        );


        return res.json({

            sucesso: true,

            usuario:
                user.usuario,

            tipo:
                user.tipo

        });


    } catch (erro) {

        console.error(
            "Erro no login:",
            erro
        );


        return res.status(500).json({

            sucesso: false,

            erro:
                "Erro interno no servidor."

        });

    }

});


// ======================================================
// ATENDIMENTO
// ======================================================

app.post("/atendimento", (req, res) => {

    try {

        const db = readDB();


        const paciente = {

            id: Date.now(),

            nome:
                req.body.nome || "",

            documento:
                req.body.documento ||
                req.body.cpf ||
                "",

            dataNascimento:
                req.body.dataNascimento ||
                "",

            sexo:
                req.body.sexo ||
                "",

            nomeMae:
                req.body.nomeMae ||
                "",

            estadoCivil:
                req.body.estadoCivil ||
                "",

            endereco:
                req.body.endereco ||
                "",

            telefone:
                req.body.telefone ||
                "",

            email:
                req.body.email ||
                "",

            contatoEmergencia:
                req.body.contatoEmergencia ||
                "",

            tipo:
                req.body.tipo ||
                "",

            status:
                "aguardando_triagem",

            createdAt:
                new Date().toISOString()

        };


        if (!paciente.nome.trim()) {

            return res.status(400).json({

                sucesso: false,

                erro:
                    "O nome do paciente é obrigatório."

            });

        }


        db.pacientes.push(
            paciente
        );


        writeDB(db);


        return res.status(201).json({

            sucesso: true,

            mensagem:
                "Paciente cadastrado com sucesso.",

            paciente

        });


    } catch (erro) {

        console.error(
            "Erro no atendimento:",
            erro
        );


        return res.status(500).json({

            sucesso: false,

            erro:
                "Erro ao cadastrar paciente."

        });

    }

});


// ======================================================
// LISTAR PACIENTES
// ======================================================

app.get("/pacientes", (req, res) => {

    try {

        const db = readDB();

        res.json(
            db.pacientes
        );

    } catch (erro) {

        console.error(erro);

        res.status(500).json({

            erro:
                "Erro ao buscar pacientes."

        });

    }

});


// ======================================================
// TRIAGEM
// ======================================================

app.post("/triagem", (req, res) => {

    try {

        const db = readDB();


        let risco =
            req.body.risco;


        const temperatura =
            Number(
                req.body.temperatura
            );


        if (temperatura >= 39) {

            risco = "vermelho";

        }

        else if (temperatura >= 38) {

            risco = "amarelo";

        }

        else if (!risco) {

            risco = "verde";

        }


        const triagem = {

            id: Date.now(),

            nome:
                req.body.nome || "",

            sintoma:
                req.body.sintoma ||
                req.body.sintomas ||
                "",

            temperatura:
                Number.isNaN(
                    temperatura
                )
                ? 0
                : temperatura,

            alergia:
                req.body.alergia ||
                "",

            observacao:
                req.body.observacao ||
                "",

            risco:

                risco || "verde",

            status:
                "aguardando_medico",

            createdAt:
                new Date().toISOString()

        };


        if (!triagem.nome.trim()) {

            return res.status(400).json({

                sucesso: false,

                erro:
                    "Informe o nome do paciente."

            });

        }


        db.triagens.push(
            triagem
        );


        // Atualiza paciente

        const paciente =
            db.pacientes.find(
                p =>
                    p.nome
                    .trim()
                    .toLowerCase()
                    ===
                    triagem.nome
                    .trim()
                    .toLowerCase()
            );


        if (paciente) {

            paciente.status =
                "aguardando_medico";

        }


        writeDB(db);


        return res.status(201).json({

            sucesso: true,

            mensagem:
                "Triagem registrada com sucesso.",

            triagem

        });


    } catch (erro) {

        console.error(
            "Erro na triagem:",
            erro
        );


        return res.status(500).json({

            sucesso: false,

            erro:
                "Erro ao registrar triagem."

        });

    }

});


// ======================================================
// LISTAR TRIAGENS
// ======================================================

app.get("/triagens", (req, res) => {

    try {

        const db = readDB();

        res.json(
            db.triagens
        );

    } catch (erro) {

        console.error(erro);

        res.status(500).json({

            erro:
                "Erro ao buscar triagens."

        });

    }

});


// ======================================================
// CONSULTA MÉDICA
// ======================================================

app.post("/consulta", (req, res) => {

    try {

        const db = readDB();


        const consulta = {

            id: Date.now(),

            paciente:
                req.body.paciente ||
                "",

            diagnostico:
                req.body.diagnostico ||
                "",

            medicacao:
                req.body.medicacao ||
                "",

            obs:
                req.body.obs ||
                "",

            createdAt:
                new Date().toISOString()

        };


        if (!consulta.paciente.trim()) {

            return res.status(400).json({

                sucesso: false,

                erro:
                    "Informe o paciente."

            });

        }


        db.consultas.push(
            consulta
        );


        const paciente =
            db.pacientes.find(
                p =>
                    p.nome
                    .trim()
                    .toLowerCase()
                    ===
                    consulta.paciente
                    .trim()
                    .toLowerCase()
            );


        if (paciente) {

            paciente.status =
                "em_acompanhamento";

        }


        writeDB(db);


        return res.status(201).json({

            sucesso: true,

            mensagem:
                "Consulta registrada com sucesso.",

            consulta

        });


    } catch (erro) {

        console.error(
            "Erro na consulta:",
            erro
        );


        return res.status(500).json({

            sucesso: false,

            erro:
                "Erro ao registrar consulta."

        });

    }

});


// ======================================================
// LISTAR CONSULTAS
// ======================================================

app.get("/consultas", (req, res) => {

    try {

        const db = readDB();

        res.json(
            db.consultas
        );

    } catch (erro) {

        console.error(erro);

        res.status(500).json({

            erro:
                "Erro ao buscar consultas."

        });

    }

});


// ======================================================
// MEDICAÇÕES
// ======================================================

app.get("/medicacoes", (req, res) => {

    try {

        const db = readDB();

        res.json(
            db.consultas
        );

    } catch (erro) {

        console.error(erro);

        res.status(500).json({

            erro:
                "Erro ao buscar medicações."

        });

    }

});


// ======================================================
// LISTA DE MEDICAMENTOS
// ======================================================

app.get(
    "/lista-medicacoes",
    (req, res) => {

        res.json([

            "Dipirona",

            "Paracetamol",

            "Ibuprofeno",

            "Amoxicilina",

            "Azitromicina",

            "Loratadina",

            "Omeprazol",

            "Buscopan",

            "Dramin",

            "Soro fisiológico"

        ]);

    }
);


// ======================================================
// ALTA HOSPITALAR
// ======================================================

app.post("/alta", (req, res) => {

    try {

        const db = readDB();


        const alta = {

            id: Date.now(),

            paciente:
                req.body.paciente ||
                "",

            nascimento:
                req.body.nascimento ||
                "",

            cpf:
                req.body.cpf ||
                "",

            telefone:
                req.body.telefone ||
                "",

            dataEntrada:
                req.body.dataEntrada ||
                "",

            dataAlta:
                req.body.dataAlta ||
                "",

            setor:
                req.body.setor ||
                "",

            leito:
                req.body.leito ||
                "",

            diagnosticoEntrada:
                req.body.diagnosticoEntrada ||
                "",

            diagnosticoFinal:
                req.body.diagnosticoFinal ||
                "",

            tratamento:
                req.body.tratamento ||
                "",

            estado:
                req.body.estado ||
                "",

            tipoAlta:
                req.body.tipoAlta ||
                "",

            semFebre:
                req.body.semFebre ||
                false,

            alimentacao:
                req.body.alimentacao ||
                false,

            clinicamenteEstavel:
                req.body.clinicamenteEstavel ||
                false,

            medicamentos:
                req.body.medicamentos ||
                "",

            cuidadosMedicamentos:
                req.body.cuidadosMedicamentos ||
                "",

            orientacoes:
                req.body.orientacoes ||
                "",

            retorno:
                req.body.retorno ||
                "",

            especialidade:
                req.body.especialidade ||
                "",

            sinaisAlerta:
                req.body.sinaisAlerta ||
                "",

            medico:
                req.body.medico ||
                "",

            crm:
                req.body.crm ||
                "",

            observacoes:
                req.body.observacoes ||
                "",

            createdAt:
                new Date().toISOString()

        };


        if (!alta.paciente.trim()) {

            return res.status(400).json({

                sucesso: false,

                erro:
                    "Informe o paciente."

            });

        }


        db.altas.push(
            alta
        );


        const paciente =
            db.pacientes.find(
                p =>
                    p.nome
                    .trim()
                    .toLowerCase()
                    ===
                    alta.paciente
                    .trim()
                    .toLowerCase()
            );


        if (paciente) {

            paciente.status =
                "alta";

        }


        writeDB(db);


        return res.status(201).json({

            sucesso: true,

            mensagem:
                "Alta hospitalar registrada.",

            alta

        });


    } catch (erro) {

        console.error(
            "Erro na alta:",
            erro
        );


        return res.status(500).json({

            sucesso: false,

            erro:
                "Erro ao registrar alta."

        });

    }

});


// ======================================================
// LISTAR ALTAS
// ======================================================

app.get("/altas", (req, res) => {

    try {

        const db = readDB();

        res.json(
            db.altas
        );

    } catch (erro) {

        console.error(erro);

        res.status(500).json({

            erro:
                "Erro ao buscar altas."

        });

    }

});


// ======================================================
// PÁGINA PRINCIPAL
// ======================================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            FRONTEND_PATH,
            "index.html"
        )
    );

});


// ======================================================
// INICIAR SERVIDOR
// ======================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            "===================================="
        );

        console.log(
            "🏥 HOSPITAL BOM CUIDADO"
        );

        console.log(
            `Servidor rodando na porta ${PORT}`
        );

        console.log(
            "===================================="
        );

    }
);
