/**
 * GoViral AI - Chat Module (AI Strategy Coach Interface)
 */

class CreatorCoach {
  constructor(messagesContainerId, inputId, sendButtonId) {
    this.messagesContainer = document.getElementById(messagesContainerId);
    this.input = document.getElementById(inputId);
    this.sendBtn = document.getElementById(sendButtonId);
    
    // Preset coach queries and automated answers
    this.presets = {
      pacing: "To patch the mid-video retention valley, you must eliminate visual downtime. Trim the 3-second silences around 0:12 where you transition between slides. Keeping transitions under 0.4 seconds ensures viewers do not scroll away.",
      rewrite: "Here are three custom hooks tailored to maximize curiosity:\n\n1. 'This one setting is costing you millions of views, and you don't even know it...'\n2. 'If you are still editing your videos like this, stop immediately.'\n3. 'The secret to hit the FYP in 2026 isn't the hashtag. It's this exact trick...'",
      tiktok: "TikTok algorithms favor continuous retention loops. To optimize, ensure your hook is spoken in the first 0.5s with text overlay. Then, use pattern interrupts every 2.5s (zoom-ins, sound effects, B-roll). Finally, formulate a loop ending where the last sentence links seamlessly back into the hook sentence."
    };
  }

  init() {
    if (!this.sendBtn || !this.input) return;
    
    // Bind send action
    this.sendBtn.addEventListener('click', () => this.handleSend());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSend();
    });

    // Bind suggestion chips
    document.getElementById('sugg-pacing')?.addEventListener('click', () => {
      this.sendMessage(document.getElementById('sugg-pacing').textContent, 'user');
      this.coachReply(this.presets.pacing);
    });

    document.getElementById('sugg-rewrite')?.addEventListener('click', () => {
      this.sendMessage(document.getElementById('sugg-rewrite').textContent, 'user');
      this.coachReply(this.presets.rewrite);
    });

    document.getElementById('sugg-tiktok')?.addEventListener('click', () => {
      this.sendMessage(document.getElementById('sugg-tiktok').textContent, 'user');
      this.coachReply(this.presets.tiktok);
    });
  }

  handleSend() {
    const text = this.input.value.trim();
    if (!text) return;
    
    this.sendMessage(text, 'user');
    this.input.value = '';
    
    // Analyze user request and respond
    setTimeout(() => {
      const response = this.generateResponse(text);
      this.coachReply(response);
    }, 600);
  }

  sendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}`;
    msgDiv.textContent = text;
    this.messagesContainer.appendChild(msgDiv);
    this.scrollChat();
  }

  coachReply(fullText) {
    // Generate empty coach bubble for typewriter printing
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message coach';
    this.messagesContainer.appendChild(msgDiv);
    
    let currentIdx = 0;
    const speed = 15; // Typist milliseconds per character
    
    const typeWriter = () => {
      if (currentIdx < fullText.length) {
        // Handle linebreaks elegantly
        const char = fullText.charAt(currentIdx);
        if (char === '\n') {
          msgDiv.appendChild(document.createElement('br'));
        } else {
          msgDiv.appendChild(document.createTextNode(char));
        }
        currentIdx++;
        this.scrollChat();
        setTimeout(typeWriter, speed);
      }
    };
    
    typeWriter();
  }

  generateResponse(inputText) {
    const query = inputText.toLowerCase();
    
    if (query.includes('hook') || query.includes('intro') || query.includes('start')) {
      return "An effective hook requires visual movement AND verbal clarity. Try starting with a contrasting statement: 'Everything you know about [niche] is wrong...' or a warning 'Avoid doing this...' while zooming in slightly.";
    }
    
    if (query.includes('pacing') || query.includes('slow') || query.includes('boring') || query.includes('drop')) {
      return "Viewer drop-off happens when visual framing remains identical for more than 3 seconds. Inject 'pattern interrupts' like overlays, graphic popups, sound effects, or slight scaling jumps every 2.5 seconds to refresh viewer focus.";
    }
    
    if (query.includes('caption') || query.includes('hashtag') || query.includes('title')) {
      return "Captions should be clean. Keep titles under 45 characters. Place your primary hook keywords in the first sentence. Use 3-5 tags containing a mix of broad niche hashtags and extremely targeted keywords.";
    }

    return "I've reviewed your request. To boost your virality potential, I recommend checking the high priority fixes on your Actionable Checklist. Do you want me to suggest specific visual cuts or draft a script variation?";
  }

  scrollChat() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
}

// Global hook
window.CreatorCoach = CreatorCoach;
