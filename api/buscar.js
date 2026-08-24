/*
 * GET /api/buscar — busca de negócios do Guia Ache Fácil.
 *
 * Serve a Intenção "buscar_negocio" do agente Bina (morador) no GPT Maker.
 *
 * A fonte é o próprio dados-guia.js publicado neste site: o endpoint baixa o
 * arquivo e o executa com um `window` falso. Assim nunca existe uma segunda
 * cópia dos dados para sair de sincronia — o que o site mostra é o que a busca
 * encontra, no mesmo instante em que o deploy termina.
 *
 * Parâmetros:
 *   busca   (obrigatório) o que o morador quer, em texto livre
 *   bairro  (opcional)    restringe a um bairro
 *
 * Os dados são públicos (já estão no dados-guia.js), então não há segredo aqui.
 */

const FONTE = "https://achefacilsjp.agapeempresarial.com.br/dados-guia.js";
const CACHE_MS = 5 * 60 * 1000;

let cache = { guia: null, quando: 0 };

async function carregarGuia() {
  if (cache.guia && Date.now() - cache.quando < CACHE_MS) return cache.guia;

  const resp = await fetch(FONTE, { headers: { "Cache-Control": "no-cache" } });
  if (!resp.ok) throw new Error("Falha ao ler dados-guia.js: HTTP " + resp.status);
  // Decodificar explicitamente como UTF-8: o runtime da Vercel leu como Latin-1
  // mesmo com charset=utf-8 no cabeçalho, e os acentos vinham corrompidos.
  const bytes = await resp.arrayBuffer();
  const codigo = new TextDecoder("utf-8").decode(bytes);

  // O arquivo é uma IIFE que faz `global.GUIA = GUIA` recebendo `window`.
  const janelaFalsa = {};
  new Function("window", codigo)(janelaFalsa);
  if (!janelaFalsa.GUIA) throw new Error("dados-guia.js não expôs GUIA");

  cache = { guia: janelaFalsa.GUIA, quando: Date.now() };
  return cache.guia;
}

/** tira acento, caixa e pontuação para comparar como gente compara */
function normalizar(txt) {
  return String(txt || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* Como o morador fala -> categoria do Guia. O agente manda texto livre;
   sem isso, "quero comer alguma coisa" não acha "alimentacao". */
const SINONIMOS = {
  alimentacao: "comida comer lanche lanchonete restaurante marmita marmitex almoco janta bolo doce salgado esfiha pizza sorvete acai brigadeiro assado padaria confeitaria festa kitfesta",
  aviamentos: "armarinho linha agulha botao tecido costura zíper retros",
  beleza: "cabelo cabeleireiro salao barbeiro barbearia unha manicure pedicure maquiagem estetica massagem massoterapia sobrancelha depilacao perfume cosmetico natura avon",
  casa: "limpeza faxina sofa estofado higienizacao reforma pintura eletricista encanador montador chaveiro dedetizacao jardim",
  educacao: "aula curso professor reforco escola ingles matematica musica",
  mercado: "mercado mercearia supermercado empório emporio compras limpeza produto detergente feira",
  moda: "roupa vestido calca camiseta moda loja brecho sapato calcado bolsa",
  naturais: "natural suplemento vitamina integral saudavel granola erva cha",
  pet: "cachorro cao gato pet racao banho tosa veterinario aviario passaro animal",
  presentes: "presente lembranca vela artigo religioso decoracao artesanato",
};

function pontuar(negocio, termos, categorias) {
  const nome = normalizar(negocio.nome);
  const tag = normalizar(negocio.tag);
  const rotuloCat = normalizar((categorias.find((c) => c.id === negocio.cat) || {}).label);
  const sinonimos = normalizar(SINONIMOS[negocio.cat] || "");
  const sublocal = normalizar(negocio.sublocal);

  let pontos = 0;
  for (const t of termos) {
    if (!t || t.length < 3) continue;
    if (nome.includes(t)) pontos += 10;
    if (tag.includes(t)) pontos += 8;
    if (rotuloCat.includes(t)) pontos += 6;
    if (negocio.cat === t) pontos += 6;
    if (sublocal.includes(t)) pontos += 2;
    // sinônimo vale por palavra inteira, para "cao" não casar com "caonualquer"
    if (sinonimos.split(" ").some((s) => s === t || (t.length > 4 && s.startsWith(t)))) pontos += 5;
  }
  return pontos;
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(204).end();

  const busca = (req.query.busca || "").toString().slice(0, 200);
  const filtroBairro = normalizar((req.query.bairro || "").toString().slice(0, 80));

  let GUIA;
  try {
    GUIA = await carregarGuia();
  } catch (erro) {
    return res.status(502).json({
      ok: false,
      mensagem: "Não consegui consultar o Guia agora. Peça para a pessoa usar a busca por bairro na própria página.",
    });
  }

  // achata todos os negócios das regiões ativas, guardando de onde vieram
  const ativos = GUIA.regioesAtivas();
  const todos = [];
  for (const regiao of ativos) {
    for (const bairro of regiao.bairros) {
      for (const n of bairro.negocios) {
        todos.push({ ...n, _bairro: bairro.nome, _regiao: regiao.nome, _url: regiao.url });
      }
    }
  }

  const bairrosDisponiveis = [...new Set(todos.map((n) => n._bairro))];
  const categoriasDisponiveis = GUIA.categoriasAtivas(todos).map((c) => c.label);

  if (!normalizar(busca)) {
    return res.status(400).json({
      ok: false,
      mensagem: "Faltou dizer o que a pessoa procura.",
      bairrosDisponiveis,
      categoriasDisponiveis,
    });
  }

  const termos = normalizar(busca).split(" ");
  let candidatos = todos;
  if (filtroBairro) {
    const doBairro = candidatos.filter((n) => normalizar(n._bairro).includes(filtroBairro));
    // bairro que não existe não deve zerar a busca inteira sem aviso
    if (doBairro.length) candidatos = doBairro;
  }

  const achados = candidatos
    .map((n) => ({ n, pontos: pontuar(n, termos, GUIA.categorias) }))
    .filter((x) => x.pontos > 0)
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, 8)
    .map(({ n }) => {
      const cat = GUIA.categorias.find((c) => c.id === n.cat);
      const item = {
        nome: n.nome,
        oQueFaz: n.tag || "",
        categoria: cat ? cat.label : n.cat,
        bairro: n._bairro,
        whatsapp: n.wa ? GUIA.formatarTelefone(n.wa) : null,
        linkWhatsapp: n.wa ? "https://wa.me/55" + n.wa : null,
      };
      if (n.sublocal) item.microRegiao = n.sublocal;
      if (n.tel) item.telefone = GUIA.formatarTelefone(n.tel);
      if (n.ig) item.instagram = "@" + n.ig;
      return item;
    });

  return res.status(200).json({
    ok: true,
    encontrados: achados.length,
    negocios: achados,
    bairrosDisponiveis,
    categoriasDisponiveis,
    totalNoGuia: todos.length,
    instrucao:
      achados.length > 0
        ? "Cite APENAS os negócios desta lista, com o WhatsApp exatamente como veio. Não acrescente nenhum negócio que não esteja aqui."
        : "Nenhum negócio encontrado. Diga que ainda não tem esse serviço no Guia, ofereça as categorias disponíveis e convide a pessoa a avisar quando quiser. NUNCA invente um negócio.",
  });
};
