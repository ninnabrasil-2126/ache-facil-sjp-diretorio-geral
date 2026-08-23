/* ==========================================================================
   Guia Ache Fácil — FONTE ÚNICA DE DADOS
   --------------------------------------------------------------------------
   Este arquivo é a única origem de regiões, bairros, categorias e negócios.
   Nenhum número deve ser digitado à mão no HTML: tudo é calculado daqui.

   IMPORTANTE — este mesmo arquivo vive em DOIS repositórios:
     1. ache-facil-sjp-diretorio-geral          (achefacilsjp.agapeempresarial.com.br)
     2. ache-facil-afonso-pena-aviacao-vila-ina (achefacilsjp-afonsopena.agapeempresarial.com.br)
   Ao editar, publique nos dois. O original fica em Claude/dados-guia.js.

   VOCABULÁRIO (não misturar):
     Cidade        São José dos Pinhais
     Região        Afonso Pena
     Bairro        Aviação, Vila Iná
     Micro-região  Conjunto Apollo, Conjunto Habitat  (campo "sublocal")
   ========================================================================== */

(function (global) {
  "use strict";

  var CATEGORIAS = [
    { id: "alimentacao", label: "Alimentação" },
    { id: "aviamentos",  label: "Aviamentos" },
    { id: "beleza",      label: "Beleza" },
    { id: "casa",        label: "Casa e serviços" },
    { id: "educacao",    label: "Educação" },
    { id: "mercado",     label: "Mercado e limpeza" },
    { id: "moda",        label: "Moda" },
    { id: "naturais",    label: "Produtos naturais" },
    { id: "pet",         label: "Pet" },
    { id: "presentes",   label: "Presentes" }
  ];

  var NEGOCIOS_AVIACAO = [
    { nome: "Esfiharia São Jorge", tag: "Esfihas", cat: "alimentacao", wa: "41996015486", sublocal: "Conjunto Apollo" },
    { nome: "Mini Mercado Era do Gelo", tag: "Mercado", cat: "mercado", wa: "41996740510", sublocal: "Conjunto Apollo" },
    { nome: "Sorvete Americano", tag: "Sorveteria", cat: "alimentacao", wa: "41997136961", sublocal: "Conjunto Habitat" },
    { nome: "Armarinho", tag: "Aviamentos", cat: "aviamentos", wa: "41997136961", sublocal: "Conjunto Habitat" },
    { nome: "Consultora Natura Mariana Reges", tag: "Produtos de beleza", cat: "beleza", wa: "41991546563" },
    { nome: "Empório Santa Clara", tag: "Produtos de limpeza", cat: "mercado", wa: "41984636240", sublocal: "Conjunto Apollo" },
    { nome: "Velas Veleiro", tag: "Artigos religiosos", cat: "presentes", wa: "41991877727" },
    { nome: "DS Wash", tag: "Higienização de estofados", cat: "casa", wa: "41996418474" },
    { nome: "KL88 Barbearia", tag: "Barbearia", cat: "beleza", wa: "41999774671", sublocal: "Conjunto Apollo" },
    { nome: "Dika Cabeleireira", tag: "Cabeleireira", cat: "beleza", wa: "41999774671", sublocal: "Conjunto Apollo" },
    { nome: "Kadosh Ateliê de Bolos", tag: "Bolos e kit festas", cat: "alimentacao", wa: "92991476619" },
    { nome: "Thalyta Marques Brigaderia", tag: "Brigadeiros artesanais", cat: "alimentacao", wa: "41995998961", ig: "thalitamarquesdoces" },
    { nome: "Lídia Massoterapeuta", tag: "Massagem", cat: "beleza", wa: "41997734862", sublocal: "Conjunto Habitat" },
    { nome: "Assados de Domingo", tag: "Assados", cat: "alimentacao", wa: "41996358178", sublocal: "Conjunto Apollo" },
    { nome: "Marmitas Fit Ana Paula Moraes", tag: "Marmitas fit", cat: "alimentacao", wa: "41999490270" },
    { nome: "Neuseli Modas", tag: "Roupas", cat: "moda", wa: "41987641855", sublocal: "Conjunto Apollo" },
    { nome: "Doçuras em Forma de Bolo", tag: "Bolos, doces e outros · Luciana Monteiro", cat: "alimentacao", wa: "65993074922", ig: "docuras_em_forma_de_bolo", sublocal: "Conjunto Habitat" },
    { nome: "Bem-me-quer Produtos Naturais", tag: "Produtos naturais", cat: "naturais", wa: "41991017601", sublocal: "Conjunto Apollo" },
    { nome: "Pet Shop Bom Trato", tag: "Banho e tosa · Veterinário", cat: "pet", wa: "41988921840", tel: "4133841212", ig: "petshopbomtrato", sublocal: "Conjunto Apollo" }
  ];

  var NEGOCIOS_VILA_INA = [
    { nome: "Pet Aviário Próspera", tag: "Ração e outros", cat: "pet", wa: "41988359229", ig: "petaviarioprospera" }
  ];

  var GUIA = {
    cidade: "São José dos Pinhais",
    uf: "PR",

    /* quantos negócios um bairro precisa reunir para entrar no ar */
    minimoParaAbrir: 10,

    urls: {
      geral:     "https://achefacilsjp.agapeempresarial.com.br/",
      cadastro:  "https://cadastroachefacil.agapeempresarial.com.br/",
      whatsapp:  "https://wa.me/5541988250998",
      whatsTexto:"(41) 98825-0998",
      email:     "guiaachefacil-sjp@agapeempresarial.com.br",
      agape:     "https://negocioslocais.agapeempresarial.com.br/",
      agendaAgape:"https://calendly.com/diagnostico_sabrina/30min",
      ello:      "https://ellosistemassobmedida.vercel.app/"
    },

    categorias: CATEGORIAS,

    regioes: [
      {
        id: "afonso-pena",
        nome: "Afonso Pena",
        url: "https://achefacilsjp-afonsopena.agapeempresarial.com.br/",
        instagram: "achefacilsjp.afonsopena",
        status: "ativo",
        bairros: [
          { id: "aviacao", nome: "Aviação",  negocios: NEGOCIOS_AVIACAO },
          { id: "ina",     nome: "Vila Iná", negocios: NEGOCIOS_VILA_INA }
        ]
      }
      /* Novas regiões entram aqui quando reunirem negócios suficientes. */
    ]
  };

  /* ---------- funções de contagem: nada é digitado à mão ---------- */

  GUIA.negociosDaRegiao = function (regiao) {
    return regiao.bairros.reduce(function (acc, b) { return acc.concat(b.negocios); }, []);
  };

  /* categoria só conta como ATIVA se tiver pelo menos um negócio */
  GUIA.categoriasAtivas = function (negocios) {
    var vistos = {};
    negocios.forEach(function (n) { vistos[n.cat] = true; });
    return CATEGORIAS.filter(function (c) { return vistos[c.id]; });
  };

  GUIA.microRegioes = function (negocios) {
    var vistos = {}, lista = [];
    negocios.forEach(function (n) {
      if (n.sublocal && !vistos[n.sublocal]) { vistos[n.sublocal] = true; lista.push(n.sublocal); }
    });
    return lista.sort();
  };

  GUIA.regioesAtivas = function () {
    return GUIA.regioes.filter(function (r) { return r.status === "ativo"; });
  };

  GUIA.resumoRegiao = function (regiao) {
    var negocios = GUIA.negociosDaRegiao(regiao);
    return {
      regiao: regiao,
      negocios: negocios.length,
      bairros: regiao.bairros.length,
      nomesBairros: regiao.bairros.map(function (b) { return b.nome; }),
      categorias: GUIA.categoriasAtivas(negocios).length,
      microRegioes: GUIA.microRegioes(negocios)
    };
  };

  GUIA.totais = function () {
    var ativas = GUIA.regioesAtivas();
    var negocios = 0, micro = {}, cats = {};
    ativas.forEach(function (r) {
      var ns = GUIA.negociosDaRegiao(r);
      negocios += ns.length;
      GUIA.categoriasAtivas(ns).forEach(function (c) { cats[c.id] = true; });
      GUIA.microRegioes(ns).forEach(function (m) { micro[m] = true; });
    });
    return {
      regioes: ativas.length,
      bairros: ativas.reduce(function (a, r) { return a + r.bairros.length; }, 0),
      negocios: negocios,
      categorias: Object.keys(cats).length,
      microRegioes: Object.keys(micro).length
    };
  };

  /* busca sem acento e sem diferenciar maiúsculas */
  GUIA.normalizar = function (txt) {
    return String(txt || "")
      .normalize("NFD").replace(new RegExp("[\u0300-\u036f]", "g"), "")
      .toLowerCase().trim();
  };

  /* procura por região, bairro ou micro-região */
  GUIA.buscar = function (termo) {
    var t = GUIA.normalizar(termo);
    if (!t) { return GUIA.regioesAtivas(); }
    return GUIA.regioesAtivas().filter(function (r) {
      if (GUIA.normalizar(r.nome).indexOf(t) >= 0) { return true; }
      var achouBairro = r.bairros.some(function (b) { return GUIA.normalizar(b.nome).indexOf(t) >= 0; });
      if (achouBairro) { return true; }
      return GUIA.microRegioes(GUIA.negociosDaRegiao(r)).some(function (m) {
        return GUIA.normalizar(m).indexOf(t) >= 0;
      });
    });
  };

  GUIA.formatarTelefone = function (numero) {
    var ddd = numero.slice(0, 2), resto = numero.slice(2);
    return resto.length === 9
      ? "(" + ddd + ") " + resto.slice(0, 5) + "-" + resto.slice(5)
      : "(" + ddd + ") " + resto.slice(0, 4) + "-" + resto.slice(4);
  };

  global.GUIA = GUIA;
})(window);
