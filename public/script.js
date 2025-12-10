const chatArea = document.getElementById('chat-area');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let messageHistory = [];

// Auto-resize textarea
userInput.addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
  if (this.value === '') this.style.height = 'auto'; // Reset if empty
});

// Handle send
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  // Add user message to UI
  appendMessage(text, 'user');
  userInput.value = '';
  userInput.style.height = 'auto';
  userInput.focus();

  // Show typing
  const typingId = showTyping();

  try {
    // Prepare history for API (limit last 10 messages for context window efficiency if needed, but array is small now)
    // Adjust role mapping if needed. The prompts use 'user' and 'assistant' usually.
    // But our `messageHistory` is just local state. We send `history` to backend.

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: text,
        history: messageHistory,
      }),
    });

    const data = await response.json();
    removeTyping(typingId);

    if (data.reply) {
      appendMessage(data.reply, 'bot');

      // Update history
      messageHistory.push({ role: 'user', content: text });
      messageHistory.push({ role: 'assistant', content: data.reply });
    } else {
      appendMessage('Maaf, saya sedang mengalami gangguan koneksi. Bisakah Anda mengulanginya?', 'bot');
    }
  } catch (error) {
    removeTyping(typingId);
    console.error('Error:', error);
    appendMessage('Maaf, terjadi kesalahan teknis. Mohon coba lagi nanti.', 'bot');
  }
}

function appendMessage(text, sender) {
  const div = document.createElement('div');
  div.classList.add('message', `message-${sender}`);

  if (sender === 'bot') {
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('markdown-content');
    contentDiv.innerHTML = marked.parse(text); // Use marked to render markdown
    div.appendChild(contentDiv);
  } else {
    div.textContent = text;
  }

  chatArea.appendChild(div);
  scrollToBottom();
}

function showTyping() {
  const div = document.createElement('div');
  div.classList.add('typing-indicator');
  div.id = 'typing-indicator';
  div.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
  div.style.display = 'flex'; // override display:none locally
  chatArea.appendChild(div);
  scrollToBottom();
  return div;
}

function removeTyping(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

function scrollToBottom() {
  chatArea.scrollTop = chatArea.scrollHeight;
}

sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
