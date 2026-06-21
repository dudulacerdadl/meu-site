// poema.js
// Lê os parâmetros "pasta" e "arquivo" da URL, busca o .md correspondente,
// separa o front matter do conteúdo e renderiza o texto em poema.html.

async function carregarTexto() {
  const params = new URLSearchParams(window.location.search);
  const pasta = params.get('pasta');
  const arquivo = params.get('arquivo');

  const elSelo = document.getElementById('selo-texto');
  const elTitulo = document.getElementById('titulo-texto');
  const elCorpo = document.getElementById('corpo-texto');

  if (!pasta || !arquivo) {
    elTitulo.textContent = 'Texto não especificado';
    elCorpo.innerHTML = '<p class="estado-vazio">O link está incompleto. Volte à listagem e tente novamente.</p>';
    return;
  }

  try {
    const resposta = await fetch(`${pasta}/${arquivo}.md`);
    if (!resposta.ok) {
      throw new Error(`Arquivo não encontrado: ${pasta}/${arquivo}.md`);
    }

    const textoBruto = await resposta.text();
    const { meta, conteudo } = parseFrontmatter(textoBruto);

    const rotulo = FOLDER_LABELS[pasta] || pasta;
    const dataFormatada = meta.data ? formatarData(meta.data) : '';

    document.title = meta.titulo ? `${meta.titulo} — Poesias & Versos` : 'Texto — Poesias & Versos';
    elSelo.textContent = dataFormatada ? `${rotulo} · ${dataFormatada}` : rotulo;
    elTitulo.textContent = meta.titulo || arquivo;

    // breaks: true preserva quebras de linha simples como <br>,
    // essencial para que os versos não colapsem em um único parágrafo.
    marked.setOptions({ breaks: true });
    elCorpo.innerHTML = marked.parse(conteudo);
  } catch (erro) {
    console.error(erro);
    elTitulo.textContent = 'Não foi possível carregar este texto';
    elCorpo.innerHTML = '<p class="estado-vazio">Verifique se o arquivo ainda existe na pasta correspondente.</p>';
  }
}

document.addEventListener('DOMContentLoaded', carregarTexto);
