const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

const PORT = 3000;


/* ==========================================
   CONFIGURAÇÕES
========================================== */

app.use(cors());

app.use(express.json());

app.use(express.static(
  path.join(__dirname, "../frontend")
));


/* ==========================================
   BANCO DE DADOS
========================================== */

const DB_FILE = path.join(__dirname, "db.json");


function readDB() {

  if (!fs.existsSync(DB_FILE)) {

    const bancoInicial = {
      usuarios: [],
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


  return JSON.parse(
    fs.readFileSync(DB_FILE, "utf8")
  );

}


function writeDB(data) {

  fs.writeFileSync(
    DB_FILE,
    JSON.stringify(data, null, 2)
  );

}


/* ==========================================
   LOGIN
========================================== */

app.post("/login", (req, res) => {

  const db = readDB();

  const usuario = req.body.usuario;
  const senha = req.body.senha;


  const user = db.usuarios.find(u =>
    u.usuario === usuario &&
    u.senha === senha
  );


  if (!user) {

    return res.status(401).json({
      erro: "Usuário ou senha inválidos."
    });

  }


  res.json({
    usuario: user.usuario,
    tipo: user.tipo
  });

});


/* ==========================================
   ATENDIMENTO
========================================== */

app.post("/atendimento", (req, res) => {

  const db = readDB();


  const paciente = {

    id: Date.now(),

    nome: req.body.nome,

    documento:
      req.body.documento || "",

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

    status: "aguardando_triagem",

    createdAt:
      new Date().toISOString()

  };


  db.pacientes.push(paciente);

  writeDB(db);


  res.status(201).json({

    sucesso: true,

    mensagem:
      "Paciente cadastrado com sucesso.",

    paciente

  });

});


/* ==========================================
   LISTAR PACIENTES
========================================== */

app.get("/pacientes", (req, res) => {

  const db = readDB();

  res.json(db.pacientes);

});


/* ==========================================
   TRIAGEM
========================================== */

app.post("/triagem", (req, res) => {

  const db = readDB();


  let risco = req.body.risco;


  const temperatura =
    Number(req.body.temperatura);


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
      req.body.nome,

    sintoma:
      req.body.sintoma,

    temperatura,

    alergia:
      req.body.alergia,

    observacao:
      req.body.observacao,

    risco,

    status:
      "aguardando_medico",

    createdAt:
      new Date().toISOString()

  };


  db.triagens.push(triagem);


  /* Atualiza o paciente */

  const paciente =
    db.pacientes.find(
      p => p.nome === triagem.nome
    );


  if (paciente) {

    paciente.status =
      "aguardando_medico";

  }


  writeDB(db);


  res.status(201).json({

    sucesso: true,

    triagem

  });

});


/* ==========================================
   LISTAR TRIAGENS
========================================== */

app.get("/triagens", (req, res) => {

  const db = readDB();

  res.json(db.triagens);

});


/* ==========================================
   CONSULTA MÉDICA
========================================== */

app.post("/consulta", (req, res) => {

  const db = readDB();


  const consulta = {

    id: Date.now(),

    paciente:
      req.body.paciente,

    diagnostico:
      req.body.diagnostico,

    medicacao:
      req.body.medicacao,

    obs:
      req.body.obs || "",

    createdAt:
      new Date().toISOString()

  };


  db.consultas.push(consulta);


  /* Atualiza paciente */

  const paciente =
    db.pacientes.find(
      p => p.nome === consulta.paciente
    );


  if (paciente) {

    paciente.status =
      "em_acompanhamento";

  }


  writeDB(db);


  res.status(201).json({

    sucesso: true,

    consulta

  });

});


/* ==========================================
   LISTAR CONSULTAS
========================================== */

app.get("/consultas", (req, res) => {

  const db = readDB();

  res.json(db.consultas);

});


/* ==========================================
   MEDICAÇÕES
========================================== */

app.get("/medicacoes", (req, res) => {

  const db = readDB();

  res.json(db.consultas);

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

  const db = readDB();


  const alta = {

    id: Date.now(),

    paciente:
      req.body.paciente,

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


  db.altas.push(alta);


  /* Atualiza paciente */

  const paciente =
    db.pacientes.find(
      p => p.nome === alta.paciente
    );


  if (paciente) {

    paciente.status =
      "alta";

  }


  writeDB(db);


  res.status(201).json({

    sucesso: true,

    mensagem:
      "Alta hospitalar registrada.",

    alta

  });

});


/* ==========================================
   LISTAR ALTAS
========================================== */

app.get("/altas", (req, res) => {

  const db = readDB();

  res.json(db.altas);

});


/* ==========================================
   INICIAR SERVIDOR
========================================== */

app.listen(PORT, () => {

  console.log(
    `🏥 Hospital Bom Cuidado rodando em http://localhost:${PORT}`
  );

});
