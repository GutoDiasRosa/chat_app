// Elementos do DOM
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');

// URL do webhook (substitua pelo seu webhook real)
const WEBHOOK_URL = "https://n8n.sisloc.com/webhook-test/53812e1a-a352-4d00-957d-7b4a94c6edc7";

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Foca no campo de entrada ao carregar a página
    userInput.focus();
});

// Função para enviar mensagem quando o botão for clicado
sendButton.addEventListener('click', sendMessage);

// Função para enviar mensagem quando Enter for pressionado
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

/**
 * Função principal para enviar mensagem do usuário e obter resposta
 */
function sendMessage() {
    const userMessage = userInput.value.trim();
    
    // Verifica se a mensagem não está vazia
    if (userMessage === '') return;
    
    // Adiciona a mensagem do usuário ao chat
    addMessageToChat(userMessage, 'user');
    
    // Limpa o campo de entrada e mantém o foco
    userInput.value = '';
    userInput.focus();
    
    // Mostra indicador de digitação
    showTypingIndicator();
    
    // Envia a mensagem para o webhook
    sendToWebhook(userMessage);
}

/**
 * Adiciona uma mensagem ao chat
 * @param {string} text - Texto da mensagem
 * @param {string} sender - 'user' ou 'bot'
 */
function addMessageToChat(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
    messageDiv.textContent = text;
    
    chatMessages.appendChild(messageDiv);
    
    // Rola para a mensagem mais recente
    scrollToBottom();
}

/**
 * Envia a mensagem para o webhook e processa a resposta
 * @param {string} userMessage - Mensagem do usuário
 */
function sendToWebhook(userMessage) {
    fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Esconde o indicador de digitação
        hideTypingIndicator();
        
        // Adiciona a resposta do bot ao chat
        if (data && data.reply) {
            addMessageToChat(data.reply, 'bot');
        } else {
            addMessageToChat("Desculpe, ocorreu um erro ao processar sua mensagem.", 'bot');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        hideTypingIndicator();
        addMessageToChat("Erro de conexão. Verifique se o webhook está configurado corretamente.", 'bot');
    });
}

/**
 * Mostra o indicador de digitação
 */
function showTypingIndicator() {
    typingIndicator.style.display = 'block';
    scrollToBottom();
}

/**
 * Esconde o indicador de digitação
 */
function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
}

/**
 * Rola o chat para a mensagem mais recente
 */
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
