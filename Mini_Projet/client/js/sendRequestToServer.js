const chatEndpointURL = 'http://localhost:3001/chat';
const imageEndpointURL = 'http://localhost:3001/image';

let outputElement, submitButton, inputElement, conversationsElement, newChatButton;

let currentConversation = null;
let conversations = {};

window.onload = init;

function init() {
    outputElement = document.querySelector('#output');
    submitButton = document.querySelector('#submit');
    submitButton.onclick = getMessage;

    inputElement = document.querySelector('input');
    conversationsElement = document.querySelector('.conversations');
    newChatButton = document.querySelector('#new-chat');
    newChatButton.onclick = startNewConversation;

    loadConversations();
}

async function getMessage() {
    let prompt = inputElement.value.trim();
    if (!prompt) return;

    if (!currentConversation) {
        startNewConversation();
    }

    if (prompt.toLowerCase().startsWith('/image')) {
        prompt = prompt.slice(6).trim();
        const images = await getImageFromDallE(prompt);
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
                appendToConversation(prompt, '[Image]', imgElement.outerHTML);
            });
        } else {
            console.error('No image returned by Dall-E');
        }
    } else if (prompt.toLowerCase().startsWith('/speech')) {
        prompt = prompt.slice(7).trim();
        const responseText = await getResponseFromServer(prompt);
        generateSpeech(responseText);
        appendToConversation(prompt, responseText);
    } else {
        const responseText = await getResponseFromServer(prompt);
        appendToConversation(prompt, responseText);
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
        const chatGptResponseText = data.choices[0].message.content;

        return chatGptResponseText;
    } catch (error) {
        console.log(error);
        return 'Error: Unable to get response from server.';
    }
}

async function getImageFromDallE(prompt) {
    try {
        const promptData = new FormData();
        promptData.append('prompt', prompt);

        const response = await fetch(imageEndpointURL, {
            method: 'POST',
            body: promptData
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
        return null;
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

function appendToConversation(prompt, response, responseHTML = null) {
    if (!currentConversation) return;

    const message = { prompt, response, responseHTML };
    conversations[currentConversation].messages.push(message);
    
    appendMessageToOutput('user', prompt);
    if (responseHTML) {
        appendMessageToOutput('ai', '', responseHTML);
    } else {
        appendMessageToOutput('ai', response);
    }

    saveConversations();
}

function appendMessageToOutput(sender, text, html = null) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message', sender.toLowerCase());

    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.textContent = text;

    if (html) {
        const media = document.createElement('div');
        media.classList.add('media');
        media.innerHTML = html;
        messageContainer.appendChild(media);
    } else {
        messageContainer.appendChild(bubble);
    }

    outputElement.append(messageContainer);
}

function startNewConversation() {
    const conversationId = `conv_${Date.now()}`;
    conversations[conversationId] = { messages: [] };
    currentConversation = conversationId;
    updateConversationList();
    clearOutput();
}

function switchConversation(conversationId) {
    currentConversation = conversationId;
    clearOutput();

    const messages = conversations[currentConversation].messages;
    messages.forEach(message => {
        const { prompt, response, responseHTML } = message;
        appendMessageToOutput('You', prompt);
        appendMessageToOutput('AI', response, responseHTML);
    });
}

function updateConversationList() {
    conversationsElement.innerHTML = '';
    for (const conversationId in conversations) {
        const pElement = document.createElement('p');
        pElement.textContent = conversationId;
        pElement.onclick = () => switchConversation(conversationId);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.onclick = (event) => {
            event.stopPropagation();
            delete conversations[conversationId];
            if (currentConversation === conversationId) {
                currentConversation = null;
                clearOutput();
            }
            updateConversationList();
            saveConversations();
        };

        pElement.appendChild(deleteButton);
        conversationsElement.append(pElement);
    }
}

function clearOutput() {
    outputElement.innerHTML = '';
}

function saveConversations() {
    localStorage.setItem('conversations', JSON.stringify(conversations));
}

function loadConversations() {
    const storedConversations = localStorage.getItem('conversations');
    if (storedConversations) {
        conversations = JSON.parse(storedConversations);
        updateConversationList();
    }
}
