// listagem.js
// Monta dinamicamente a listagem de textos na página principal (index.html),
// lendo o arquivo index.json de cada pasta e o front matter de cada .md.
// Também controla, por categoria: o limite inicial de itens exibidos (com
// botão "Ver todas") e a busca pelo título.

// Pastas/categorias exibidas na página principal.
// Para adicionar uma nova categoria (ex.: "cronicas"), crie a pasta com seu
// próprio index.json e adicione uma entrada aqui.
const PASTAS = [
  { id: 'poesias', titulo: 'Poesias' },
  { id: 'versos', titulo: 'Versos' },
];

// Quantos itens aparecem antes do botão "Ver todas".
const LIMITE_INICIAL = 5;

// Estado de cada categoria: os itens carregados, se está expandida (mostrando
// todos os itens) e o texto atual digitado na busca.
const estado = {};
PASTAS.forEach((pasta) => {
  estado[pasta.id] = { itens: [], expandido: false, busca: '' };
});

/**
 * Lê o manifesto (index.json) de uma pasta e, para cada arquivo .md listado,
 * busca o título e a data no front matter.
 */
async function carregarPasta(pastaId) {
  const respostaIndice = await fetch(`${pastaId}/index.json`);
  if (!respostaIndice.ok) {
    throw new Error(`Não foi possível carregar ${pastaId}/index.json`);
  }
  const nomesDosArquivos = await respostaIndice.json();

  const itens = await Promise.all(
    nomesDosArquivos.map(async (nomeArquivo) => {
      const resposta = await fetch(`${pastaId}/${nomeArquivo}`);
      if (!resposta.ok) {
        console.warn(`Arquivo não encontrado: ${pastaId}/${nomeArquivo}`);
        return null;
      }
      const textoBruto = await resposta.text();
      const { meta } = parseFrontmatter(textoBruto);

      return {
        titulo: meta.titulo || nomeArquivo.replace(/\.md$/i, ''),
        data: meta.data || '',
        tags: parseTags(meta.tags),
        link: montarLinkTexto(pastaId, nomeArquivo),
      };
    })
  );

  // Remove eventuais arquivos que falharam ao carregar, e ordena do mais
  // recente para o mais antigo (itens sem data ficam por último).
  return itens
    .filter(Boolean)
    .sort((a, b) => (b.data || '').localeCompare(a.data || ''));
}

function renderizarCatalogo(itens) {
  if (itens.length === 0) {
    return '<p class="estado-vazio">Nenhum texto encontrado.</p>';
  }

  const linhas = itens
    .map((item) => {
      const tagsHtml = item.tags.length
        ? `<div class="lista-tags catalogo-tags">${item.tags
            .map((tag) => `<button type="button" class="tag" data-tag="${tag}"${estiloDaTag(tag)}>${tag}</button>`)
            .join('')}</div>`
        : '';

      return `
    <li class="catalogo-item">
      <a class="catalogo-link" href="${item.link}">
        <span class="catalogo-titulo">${item.titulo}</span>
        ${item.data ? `<span class="catalogo-data">${formatarData(item.data)}</span>` : ''}
      </a>
      ${tagsHtml}
    </li>`;
    })
    .join('');

  return `<ul class="catalogo">${linhas}</ul>`;
}

/**
 * Filtra os itens de acordo com o termo digitado.
 * Texto comum busca apenas pelo título.
 * Prefixado com "#" (ex.: "#noite") busca apenas pelas tags — assim os
 * dois tipos de busca nunca se misturam, mesmo que uma tag tenha o mesmo
 * nome de algum título.
 */
function filtrarItens(itens, termoBruto) {
  if (termoBruto.startsWith('#')) {
    const termoTag = termoBruto.slice(1).trim().toLowerCase();
    if (!termoTag) return itens;
    return itens.filter((item) => item.tags.some((tag) => tag.toLowerCase().includes(termoTag)));
  }

  const termo = termoBruto.toLowerCase();
  return itens.filter((item) => item.titulo.toLowerCase().includes(termo));
}

/**
 * Recalcula e redesenha a listagem de uma categoria, levando em conta o
 * texto buscado e se a categoria está expandida ou não.
 */
function renderizarPasta(pastaId) {
  const dados = estado[pastaId];
  const container = document.getElementById(`lista-${pastaId}`);
  const botao = document.getElementById(`botao-${pastaId}`);
  if (!container) return;

  const termoBruto = dados.busca.trim();
  const emBusca = termoBruto.length > 0;

  const filtrados = emBusca ? filtrarItens(dados.itens, termoBruto) : dados.itens;

  const excedeLimite = filtrados.length > LIMITE_INICIAL;

  // Durante uma busca, mostra todos os resultados encontrados (sem o corte
  // de 5). Fora da busca, respeita o estado expandido/recolhido.
  const itensVisiveis = !emBusca && !dados.expandido
    ? filtrados.slice(0, LIMITE_INICIAL)
    : filtrados;

  container.innerHTML = renderizarCatalogo(itensVisiveis);

  if (!botao) return;

  if (emBusca || !excedeLimite) {
    botao.hidden = true;
    return;
  }

  botao.hidden = false;
  botao.textContent = dados.expandido ? 'Ver menos' : `Ver todas (${filtrados.length})`;
}

function configurarBuscaEBotao(pastaId) {
  const campoBusca = document.getElementById(`busca-${pastaId}`);
  const botao = document.getElementById(`botao-${pastaId}`);

  if (campoBusca) {
    campoBusca.addEventListener('input', (evento) => {
      estado[pastaId].busca = evento.target.value;
      renderizarPasta(pastaId);
    });
  }

  if (botao) {
    botao.addEventListener('click', () => {
      estado[pastaId].expandido = !estado[pastaId].expandido;
      renderizarPasta(pastaId);
    });
  }
}

/**
 * Clicar em uma tag filtra a listagem daquela categoria por ela,
 * reaproveitando o mesmo campo de busca (preenchido automaticamente).
 */
function configurarCliqueEmTags(pastaId) {
  const container = document.getElementById(`lista-${pastaId}`);
  if (!container) return;

  container.addEventListener('click', (evento) => {
    const botaoTag = evento.target.closest('button.tag');
    if (!botaoTag) return;

    const tag = botaoTag.dataset.tag;
    const valorBusca = `#${tag}`;
    estado[pastaId].busca = valorBusca;

    const campoBusca = document.getElementById(`busca-${pastaId}`);
    if (campoBusca) campoBusca.value = valorBusca;

    renderizarPasta(pastaId);
  });
}

async function iniciarListagem() {
  await Promise.all(
    PASTAS.map(async (pasta) => {
      configurarBuscaEBotao(pasta.id);
      configurarCliqueEmTags(pasta.id);
      try {
        estado[pasta.id].itens = await carregarPasta(pasta.id);
        renderizarPasta(pasta.id);
      } catch (erro) {
        console.error(erro);
        const container = document.getElementById(`lista-${pasta.id}`);
        if (container) {
          container.innerHTML = `<p class="estado-vazio">Não foi possível carregar "${pasta.titulo}". Verifique se ${pasta.id}/index.json existe.</p>`;
        }
      }
    })
  );
}

document.addEventListener('DOMContentLoaded', iniciarListagem);
