// common.js
// Funções compartilhadas entre a página de listagem (index.html)
// e a página de texto individual (poema.html).

// Rótulo (singular) usado no "selo" de cada texto, conforme a pasta de origem.
// Adicione aqui se criar novas pastas/categorias.
const FOLDER_LABELS = {
  poesias: 'Poesia',
  versos: 'Verso',
};

const MESES_ABREV = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

/**
 * Extrai o front matter (metadados) do início de um arquivo .md.
 * Formato esperado:
 *
 * ---
 * titulo: Nome do Texto
 * data: 2024-05-10
 * ---
 *
 * Conteúdo em markdown a partir daqui...
 *
 * Retorna { meta: {...}, conteudo: '...' }.
 * Se não houver front matter, meta fica vazio e conteudo é o texto inteiro.
 */
function parseFrontmatter(textoBruto) {
  const regex = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;
  const resultado = textoBruto.match(regex);

  if (!resultado) {
    return { meta: {}, conteudo: textoBruto };
  }

  const blocoMeta = resultado[1];
  const conteudo = resultado[2];
  const meta = {};

  blocoMeta.split('\n').forEach((linha) => {
    const posicaoDoisPontos = linha.indexOf(':');
    if (posicaoDoisPontos > -1) {
      const chave = linha.slice(0, posicaoDoisPontos).trim();
      const valor = linha.slice(posicaoDoisPontos + 1).trim();
      meta[chave] = valor;
    }
  });

  return { meta, conteudo };
}

/**
 * Converte uma data no formato YYYY-MM-DD para "10 mai 2024".
 * Se a data vier em outro formato, devolve o valor original sem quebrar a página.
 */
function formatarData(dataISO) {
  if (!dataISO) return '';
  const partes = dataISO.split('-');
  if (partes.length !== 3) return dataISO;

  const [ano, mes, dia] = partes;
  const indiceMes = parseInt(mes, 10) - 1;
  const mesAbreviado = MESES_ABREV[indiceMes] || mes;
  const diaSemZero = parseInt(dia, 10);

  if (Number.isNaN(diaSemZero)) return dataISO;
  return `${diaSemZero} ${mesAbreviado} ${ano}`;
}

/**
 * Monta o link para a página de um texto individual,
 * a partir da pasta (categoria) e do nome do arquivo .md.
 * Resultado: poema.html?pasta=poesias&arquivo=o-vento-na-noite
 */
function montarLinkTexto(pasta, nomeArquivo) {
  const slug = nomeArquivo.replace(/\.md$/i, '');
  return `poema.html?pasta=${encodeURIComponent(pasta)}&arquivo=${encodeURIComponent(slug)}`;
}

/**
 * Converte a string de tags do front matter (separadas por vírgula) em uma
 * lista de tags limpas, sem espaços extras e sem itens vazios.
 * Ex.: "noite, melancolia,  natureza" -> ["noite", "melancolia", "natureza"]
 */
function parseTags(tagsBruto) {
  if (!tagsBruto) return [];
  return tagsBruto
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

/**
 * Cores personalizadas por tag (opcional). A chave deve ser exatamente igual
 * ao texto da tag (incluindo acentos, mas sem o #), e o valor pode ser
 * qualquer cor CSS válida: #hexadecimal, rgb(...), hsl(...) etc.
 *
 * Tags que não aparecerem aqui usam a cor padrão do site automaticamente —
 * não é preciso listar todas, só as que você quiser destacar com uma cor
 * própria.
 *
 * Dica: como o fundo do site é escuro, prefira cores de média/alta
 * luminosidade (não muito escuras) para manter o texto legível.
 */
const CORES_DAS_TAGS = {
  'let': '#4FA8B5',
  'gabs': '#5FA776',
  'amor de ônibus': '#df9423',
};

/**
 * Gera o atributo de estilo inline que aplica a cor personalizada de uma
 * tag (via a custom property --cor-tag, usada em style.css). Se a tag não
 * tiver cor definida em CORES_DAS_TAGS, retorna uma string vazia e ela usa
 * a cor padrão definida no CSS.
 */
function estiloDaTag(tag) {
  const cor = CORES_DAS_TAGS[tag];
  return cor ? ` style="--cor-tag: ${cor}"` : '';
}
