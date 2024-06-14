import { getImageFromDallE } from './dallE.js';

const chatEndpointURL = 'http://localhost:3001/chat';
const imageEndpointURL = 'http://localhost:3001/image';

let outputElement, submitButton, inputElement, historyElement, butonElement;

window.onload = init;

function init() {
    outputElement = document.querySelector('#output');
    submitButton = document.querySelector('#submit');
    submitButton.onclick = getMessage;

    inputElement = document.querySelector('input');
    historyElement = document.querySelector('.history');
    butonElement = document.querySelector('button');
    butonElement.onclick = clearInput;
}

function clearInput() {
    inputElement.value = '';
}

async function getMessage() {
    let prompt = inputElement.value;
    prompt = prompt.toLowerCase();

    if (prompt.startsWith('/image')) {
        prompt = prompt.slice(6).trim();

        // Directly use the prompt for DALL-E
        console.log("Prompt envoyé à Dall-E :", prompt);

        let images = await getImageFromDallE(prompt);
        console.log(images);

        if (images && images.data) {
            images.data.forEach(imageObj => {
                const imageContainer = document.createElement('div');
                imageContainer.classList.add('image-container');

                const imgElement = document.createElement('img');
                imgElement.src = imageObj.url;
                imgElement.width = 256;
                imgElement.height = 256;

                imageContainer.append(imgElement);

                outputElement.append(imageContainer);
            });
        } else {
            console.error('Aucune image retournée par Dall-E');
        }
    } else if (prompt.startsWith('/speech')) {
        prompt = prompt.slice(7).trim();
        const responseText = await getResponseFromServer(prompt);
        generateSpeech(responseText);
    } else {
        await getResponseFromServer(prompt);
    }

    inputElement.value = '';
}

async function getResponseFromServer(prompt) {
    try {
        const promptData = new FormData();
        promptData.append('prompt', prompt);

        const response = await fetch(chatEndpointURL, {
            method: 'POST',
            body: promptData
        });

        const data = await response.json();

        console.log(data);
        const chatGptReponseTxt = data.choices[0].message.content;
        const pElementChat = document.createElement('p');
        pElementChat.textContent = chatGptReponseTxt;
        outputElement.append(pElementChat);

        if (data.choices[0].message.content) {
            const pElement = document.createElement('p');
            pElement.textContent = inputElement.value;
            pElement.onclick = () => {
                inputElement.value = pElement.textContent;
            };
            historyElement.append(pElement);
        }

        return chatGptReponseTxt;
    } catch (error) {
        console.log(error);
        return '';
    }
}

function generateSpeech(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        speechSynthesis.speak(utterance);
    } else {
        console.error('Speech synthesis not supported in this browser.');
    }
}
