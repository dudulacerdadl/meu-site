window.onload = function () {
    verificarResposta();
};

function verificarResposta() {
    var resposta = prompt(
        "A resposta é formada por 6 caracteres na seguinte sequencia:" +
        "\n\n- O número do mês do meu aniversário;" +
        "\n- A última letra do nome da minha filha mais nova;" +
        "\n- O segundo dígito do meu CPF;" +
        "\n- E a primeira letra do nome e sobrenomes da pessoa que eu gosto, minha pessoa favorita:"
    );

    
    if (resposta && resposta.toLowerCase() === "4a0gps") {
        window.location.href = "/gabs/eu-te-amo.html";
    } else if (resposta == null) {
        alert("Aqui não é permitido desistências, desculpe. Por favor, tente novamente.");
        verificarResposta();
    } else {
        alert("Resposta incorreta. Por favor, tente novamente.");
        verificarResposta();
    }
}