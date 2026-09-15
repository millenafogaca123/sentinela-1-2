const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

// IMPORTANTE PARA O RENDER
const PORT = process.env.PORT || 3000;


/* ==========================================
   CONFIGURAÇÕES
========================================== */

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Caminho da pasta frontend
app.use(express.static(
  path.join(__dirname, "../frontend")
));


/* ==========================================
   BANCO DE DADOS
========================================== */

const DB_FILE = path.join(__dirname, "db.json");


function criarBanco() {

  const bancoInicial = {
    usuarios: [
      {
        usuario: "atendimento",
        senha: "123456",
        tipo: "atendimento"
      },
      {
        usuario: "admin",
        senha: "123456",
        tipo: "admin"
      }
    ],

    pacientes: [],
    triagens: [],
    consultas: [],
    altas: []
  };

  fs.writeFileSync(
    DB_FILE,
    JSON.stringify(bancoInicial, null, 2)
  );

  return bancoInicial;
}


function readDB() {

  try {

    if (!fs.existsSync(DB_FILE)) {
      return criarBanco();
    }

    const conteudo = fs.readFileSync(
      DB_FILE,
      "utf8"
    );

    if (!conteudo.trim()) {
      return criarBanco();
    }

    return JSON.parse(conteudo);

  } catch (erro) {

    console.error("Erro ao ler banco:", erro);

    return criarBanco();

  }

}


function writeDB(data) {

  try {

    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(data, null, 2)
    );

  } catch (erro) {

    console.error("Erro ao salvar banco:", erro);

  }

}


/* ==========================================
   TESTE DO SERVIDOR
========================================== */

app.get("/health", (req, res) => {

  res.json({
    sucesso: true,
    mensagem: "Servidor do Hospital Bom Cuidado funcionando!",
    porta: PORT
  });

});


/* ==========================================
   LOGIN
========================================== */

app.post("/login", (req, res) => {

  try {

    const db = readDB();

    const usuario = req.body.usuario;
    const senha = req.body.senha;


    if (!usuario || !senha) {

      return res.status(400).json({
        sucesso: false,
        erro: "Informe usuário e senha."
      });

    }


    const user = db.usuarios.find(
      u =>
        u.usuario === usuario &&
        u.senha === senha
    );


    if (!user) {

      return res.status(401).json({
        sucesso: false,
        erro: "Usuário ou senha inválidos."
      });

    }


    return res.json({

      sucesso: true,

      usuario: user.usuario,

      tipo: user.tipo

    });

  } catch (erro) {

    console.error("Erro no login:", erro);

    return res.status(500).json({
      sucesso: false,
      erro: "Erro interno no servidor."
    });

  }

});


/* ==========================================
   ATENDIMENTO
========================================== */

app.post("/atendimento", (req, res) => {

  try {

    const db = readDB();


    const paciente = {

      id: Date.now(),

      nome:
        req.body.nome || "",

      documento:
        req.body.documento || req.body.cpf || "",

      dataNascimento:
        req.body.dataNascimento || "",

      sexo:
        req.body.sexo || "",

      nomeMae:
        req.body.nomeMae || "",

      estadoCivil:
        req.body.estadoCivil || "",

      endereco:
        req.body.endereco || "",

      telefone:
        req.body.telefone || "",

      email:
        req.body.email || "",

      contatoEmergencia:
        req.body.contatoEmergencia || "",

      tipo:
        req.body.tipo || "",

      status:
        "aguardando_triagem",

      createdAt:
        new Date().toISOString()

    };


    if (!paciente.nome) {

      return res.status(400).json({
        sucesso: false,
        erro: "O nome do paciente é obrigatório."
      });

    }


    db.pacientes.push(paciente);

    writeDB(db);


    return res.status(201).json({

      sucesso: true,

      mensagem:
        "Paciente cadastrado com sucesso.",

      paciente

    });

  } catch (erro) {

    console.error("Erro no atendimento:", erro);

    return res.status(500).json({
      sucesso: false,
      erro: "Erro ao cadastrar paciente."
    });

  }

});


/* ==========================================
   LISTAR PACIENTES
========================================== */

app.get("/pacientes", (req, res) => {

  try {

    const db = readDB();

    res.json(db.pacientes);

  } catch (erro) {

    console.error(erro);

    res.status(500).json({
      erro: "Erro ao buscar pacientes."
    });

  }

});


/* ==========================================
   TRIAGEM
========================================== */

app.post("/triagem", (req, res) => {

  try {

    const db = readDB();


    let risco = req.body.risco;


    const temperatura =
      Number(req.body.temperatura);


    // Classificação automática
    if (temperatura >= 39) {

      risco = "vermelho";

    } else if (temperatura >= 38) {

      risco = "amarelo";

    } else if (!risco) {

      risco = "verde";

    }


    const triagem = {

      id: Date.now(),

      nome:
        req.body.nome || "",

      sintoma:
        req.body.sintoma || "",

      temperatura:
        temperatura || 0,

      alergia:
        req.body.alergia || "",

      observacao:
        req.body.observacao || "",

      risco,

      status:
        "aguardando_medico",

      createdAt:
        new Date().toISOString()

    };


    if (!triagem.nome) {

      return res.status(400).json({
        sucesso: false,
        erro: "Informe o nome do paciente."
      });

    }


    db.triagens.push(triagem);


    // Atualiza o paciente
    const paciente =
      db.pacientes.find(
        p => p.nome === triagem.nome
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

    console.error("Erro na triagem:", erro);

    return res.status(500).json({
      sucesso: false,
      erro: "Erro ao registrar triagem."
    });

  }

});


/* ==========================================
   LISTAR TRIAGENS
========================================== */

app.get("/triagens", (req, res) => {

  try {

    const db = readDB();

    res.json(db.triagens);

  } catch (erro) {

    console.error(erro);

    res.status(500).json({
      erro: "Erro ao buscar triagens."
    });

  }

});


/* ==========================================
   CONSULTA MÉDICA
========================================== */

app.post("/consulta", (req, res) => {

  try {

    const db = readDB();


    const consulta = {

      id: Date.now(),

      paciente:
        req.body.paciente || "",

      diagnostico:
        req.body.diagnostico || "",

      medicacao:
        req.body.medicacao || "",

      obs:
        req.body.obs || "",

      createdAt:
        new Date().toISOString()

    };


    if (!consulta.paciente) {

      return res.status(400).json({
        sucesso: false,
        erro: "Informe o paciente."
      });

    }


    db.consultas.push(consulta);


    // Atualiza paciente
    const paciente =
      db.pacientes.find(
        p => p.nome === consulta.paciente
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

    console.error("Erro na consulta:", erro);

    return res.status(500).json({
      sucesso: false,
      erro: "Erro ao registrar consulta."
    });

  }

});


/* ==========================================
   LISTAR CONSULTAS
========================================== */

app.get("/consultas", (req, res) => {

  try {

    const db = readDB();

    res.json(db.consultas);

  } catch (erro) {

    console.error(erro);

    res.status(500).json({
      erro: "Erro ao buscar consultas."
    });

  }

});


/* ==========================================
   MEDICAÇÕES
========================================== */

app.get("/medicacoes", (req, res) => {

  try {

    const db = readDB();

    res.json(db.consultas);

  } catch (erro) {

    console.error(erro);

    res.status(500).json({
      erro: "Erro ao buscar medicações."
    });

  }

});


/* ==========================================
   LISTA DE MEDICAMENTOS
========================================== */

app.get("/lista-medicacoes", (req, res) => {

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

});


/* ==========================================
   ALTA HOSPITALAR
========================================== */

app.post("/alta", (req, res) => {

  try {

    const db = readDB();


    const alta = {

      id: Date.now(),

      paciente:
        req.body.paciente || "",

      nascimento:
        req.body.nascimento || "",

      cpf:
        req.body.cpf || "",

      telefone:
        req.body.telefone || "",

      dataEntrada:
        req.body.dataEntrada || "",

      dataAlta:
        req.body.dataAlta || "",

      setor:
        req.body.setor || "",

      leito:
        req.body.leito || "",

      diagnosticoEntrada:
        req.body.diagnosticoEntrada || "",

      diagnosticoFinal:
        req.body.diagnosticoFinal || "",

      tratamento:
        req.body.tratamento || "",

      estado:
        req.body.estado || "",

      tipoAlta:
        req.body.tipoAlta || "",

      semFebre:
        req.body.semFebre || false,

      alimentacao:
        req.body.alimentacao || false,

      clinicamenteEstavel:
        req.body.clinicamenteEstavel || false,

      medicamentos:
        req.body.medicamentos || "",

      cuidadosMedicamentos:
        req.body.cuidadosMedicamentos || "",

      orientacoes:
        req.body.orientacoes || "",

      retorno:
        req.body.retorno || "",

      especialidade:
        req.body.especialidade || "",

      sinaisAlerta:
        req.body.sinaisAlerta || "",

      medico:
        req.body.medico || "",

      crm:
        req.body.crm || "",

      observacoes:
        req.body.observacoes || "",

      createdAt:
        new Date().toISOString()

    };


    if (!alta.paciente) {

      return res.status(400).json({
        sucesso: false,
        erro: "Informe o paciente."
      });

    }


    db.altas.push(alta);


    // Atualiza paciente
    const paciente =
      db.pacientes.find(
        p => p.nome === alta.paciente
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

    console.error("Erro na alta:", erro);

    return res.status(500).json({
      sucesso: false,
      erro: "Erro ao registrar alta."
    });

  }

});


/* ==========================================
   LISTAR ALTAS
========================================== */

app.get("/altas", (req, res) => {

  try {

    const db = readDB();

    res.json(db.altas);

  } catch (erro) {

    console.error(erro);

    res.status(500).json({
      erro: "Erro ao buscar altas."
    });

  }

});


/* ==========================================
   ROTA PRINCIPAL
========================================== */

app.get("/", (req, res) => {

  res.sendFile(
    path.join(__dirname, "../frontend/index.html")
  );

});


/* ==========================================
   INICIAR SERVIDOR
========================================== */

app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `🏥 Hospital Bom Cuidado funcionando na porta ${PORT}`
  );

});
