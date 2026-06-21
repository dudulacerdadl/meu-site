// listagem.js
// Monta dinamicamente a listagem de textos na página principal (index.html),
// lendo o arquivo index.json de cada pasta e o front matter de cada .md.

// Pastas/categorias exibidas na página principal.
// Para adicionar uma nova categoria (ex.: "cronicas"), crie a pasta com seu
// próprio index.json e adicione uma entrada aqui.
const PASTAS = [
  { id: 'poesias', titulo: 'Poesias' },
  { id: 'versos', titulo: 'Versos' },
];

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

function renderizarLista(containerId, itens) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  if (itens.length === 0) {
    container.innerHTML = '<p class="estado-vazio">Nenhum texto encontrado nesta categoria.</p>';
    return;
  }

  const lista = document.createElement('ul');
  lista.className = 'catalogo';

  itens.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'catalogo-item';
    li.innerHTML = `
      <a class="catalogo-link" href="${item.link}">
        <span class="catalogo-titulo">${item.titulo}</span>
        ${item.data ? `<span class="catalogo-data">${formatarData(item.data)}</span>` : ''}
      </a>
    `;
    lista.appendChild(li);
  });

  container.appendChild(lista);
}

async function iniciarListagem() {
  await Promise.all(
    PASTAS.map(async (pasta) => {
      try {
        const itens = await carregarPasta(pasta.id);
        renderizarLista(`lista-${pasta.id}`, itens);
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
