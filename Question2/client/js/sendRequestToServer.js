const endpointURL = 'http://localhost:3001/chat';

let outputElement, submitButton, inputElement, historyElement, buttonElement;

window.onload = init;

function init() {
    outputElement = document.querySelector('#output');
    submitButton = document.querySelector('#submit');
    submitButton.onclick = getMessage;

    inputElement = document.querySelector('#promptInput');
    historyElement = document.querySelector('.history');
    buttonElement = document.querySelector('button');
    buttonElement.onclick = clearInput;

    // Ajoutez un écouteur pour la touche "Entrée"
    inputElement.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            getMessage();
        }
    });
}

function clearInput() {
    inputElement.value = '';
}

async function getMessage() {
    let prompt = inputElement.value;
    // Mettez le prompt en minuscules
    prompt = prompt.toLowerCase();

    // Si le champ est vide, quittez la fonction
    if (prompt === '') return;

    // Gérez les commandes spéciales
    if (prompt.startsWith('/image')) {
        console.log("Je génère une image Dall-E avec comme demande: ", prompt.substring(7));
        // Arrêtez ici et n'envoyez pas la requête à l'API OpenAI
        //return;
    }

    if (prompt.startsWith('/song')) {
        console.log("Je demande une chanson avec comme sujet '", prompt.substring(6), "'");
        // Arrêtez ici et n'envoyez pas la requête à l'API OpenAI
        //return;
    }

    // Sinon, envoyez le prompt à l'API OpenAI
    await getResponseFromServer(prompt);

    // Videz l'input
    inputElement.value = '';
}


async function getResponseFromServer(prompt) {
    try {
        // Envoyez le contenu du prompt dans un FormData
        const promptData = new FormData();
        promptData.append('prompt', prompt);

        // Envoi de la requête POST par fetch
        const response = await fetch(endpointURL, {
            method: 'POST',
            body: promptData
        });

        const data = await response.json();

        console.log(data);
        const chatGptReponseTxt = data.choices[0].message.content;
        // Créez un élément <p> pour la réponse
        const pElementChat = document.createElement('p');
        pElementChat.textContent = chatGptReponseTxt;
        // Ajoutez la réponse dans le div output
        outputElement.append(pElementChat);

        // Ajout dans l'historique sur la gauche
        if (data.choices[0].message.content) {
            const pElement = document.createElement('p');
            pElement.textContent = inputElement.value;
            pElement.onclick = () => {
                inputElement.value = pElement.textContent;
            };
            historyElement.append(pElement);
        }
    } catch (error) {
        console.log(error);
    }
}
