import Phaser from 'phaser';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * ChatScene - Voice-to-voice chatbot interaction using Gemini Live API
 */
export default class ChatScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ChatScene' });
    this.returnScene = null;
    this.villageConfig = null;
    
    // Chat state
    this.chatHistory = [];
    this.inputText = '';
    
    // UI elements
    this.chatDisplay = null;
    this.inputBox = null;
    this.sendButton = null;
    this.backButton = null;
  }

  init(data) {
    this.returnScene = data.returnScene || 'WorldScene';
    this.villageConfig = data.villageConfig;
  }

  preload() {
    if (!this.textures.exists('ai_bg')) {
      this.load.image('ai_bg', 'Gemini_Generated_Image_ur5pgiur5pgiur5p.png');
    }
  }

  create() {
    // Background image
    const bg = this.add.image(0, 0, 'ai_bg').setOrigin(0, 0);
    bg.setDisplaySize(this.scale.width, this.scale.height);
    bg.setScrollFactor(0);

    // Layout padding
    const pad = 20;
    const px = pad;
    const py = pad + 20;
    const pw = this.scale.width - pad * 2;
    const ph = this.scale.height - pad * 2 - 40;

    // Chat bubbles container
    this.chatArea = { x: px + 24, y: py + 24, w: pw - 48, h: ph - 170 };
    this.messageContainers = [];
    this.chatDisplay = null;

    // Input placeholder (DOM input will be better but using Phaser text for simplicity)
    const inputLabel = this.add.text(
      px + 60,
      py + ph - 180,
      'Type your message:',
      {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#aaaaaa'
      }
    );

    // Send button
    this.sendButton = this.createButton(
      px + pw - 150,
      py + ph - 60,
      'Send',
      0x3aaea4,
      () => this.sendMessage()
    );

    // Back button
    this.backButton = this.createButton(
      px + 160,
      py + ph - 60,
      'Back to Village',
      0xcc5b5b,
      () => this.endChat()
    );

    // Create DOM input for typing
    this.createDOMInput({ x: px + 60, y: py + ph - 150, width: pw - 320 });

    // Temporarily disable Phaser keyboard so DOM input gets all keys
    if (this.input && this.input.keyboard) {
      this._prevKeyboardEnabled = this.input.keyboard.enabled;
      this.input.keyboard.enabled = false;
    }

    this.chatHistory.push({ role: 'assistant', text: 'Hi! I\'m here to help you learn about money! Ask me anything!' });
  }

  createDOMInput(opts = {}) {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type your message here...';
    input.style.position = 'absolute';
    const place = () => {
      const rect = this.game.canvas.getBoundingClientRect();
      const left = rect.left + (opts.x || 40);
      const top = rect.top + (opts.y || (this.scale.height - 100));
      input.style.left = left + 'px';
      input.style.top = top + 'px';
      input.style.width = (opts.width || (this.scale.width - 320)) + 'px';
    };
    place();
    input.style.padding = '10px';
    input.style.fontSize = '16px';
    input.style.border = '2px solid #ffd700';
    input.style.borderRadius = '5px';
    input.style.backgroundColor = '#1a1a2e';
    input.style.color = '#ffffff';
    input.style.fontFamily = 'Arial';
    input.style.zIndex = '1000';
    input.style.pointerEvents = 'auto';
    
    input.addEventListener('keydown', (e) => {
      // Keep events in the input; do not bubble to Phaser
      e.stopPropagation();
      if (e.key === 'Enter') {
        e.preventDefault();
        this.sendMessage();
      }
    });

    input.addEventListener('keyup', (e) => {
      e.stopPropagation();
    });
    
    input.addEventListener('input', (e) => {
      this.inputText = e.target.value;
    });
    
    document.body.appendChild(input);
    this.inputBox = input;
    setTimeout(() => input.focus(), 0);

    // Reposition on resize
    this._resizeHandler = () => place();
    window.addEventListener('resize', this._resizeHandler);
  }

  createButton(x, y, text, color, onDown, onUp) {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 200, 60, color, 0.9);
    bg.setStrokeStyle(3, 0xffffff);

    const label = this.add.text(0, 0, text, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    label.setOrigin(0.5);

    container.add([bg, label]);
    container.setSize(200, 60);
    // Make the container interactive with an explicit hit-area
    const hit = new Phaser.Geom.Rectangle(-100, -30, 200, 60);
    container.setInteractive(hit, Phaser.Geom.Rectangle.Contains);
    container.input && (container.input.cursor = 'pointer');

    if (onDown) {
      container.on('pointerdown', onDown, this);
    }
    if (onUp) {
      container.on('pointerup', onUp, this);
      container.on('pointerout', onUp, this); // release if pointer leaves
    }

    return container;
  }

  async sendMessage() {
    if (!this.inputText || !this.inputText.trim()) {
      console.log('Empty message, ignoring');
      return;
    }

    const userMessage = this.inputText.trim();
    this.inputText = '';
    if (this.inputBox) {
      this.inputBox.value = '';
    }

    // Add user message to history and display
    this.chatHistory.push({ role: 'user', text: userMessage });
    this.updateChatDisplay();

    // Show loading
    this.chatHistory.push({ role: 'assistant', text: 'Typing...' });
    this.updateChatDisplay();

    try {
      const functions = getFunctions();
      const chatFn = httpsCallable(functions, 'chat_with_assistant');
      
      const villageName = (this.villageConfig && this.villageConfig.name) || 'the village';
      
      const result = await chatFn({
        message: userMessage,
        village: villageName
      });

      // Remove "Typing..." and add real response
      this.chatHistory.pop();
      this.chatHistory.push({ role: 'assistant', text: result.data.response });
      this.updateChatDisplay();

    } catch (err) {
      console.error('Chat error:', err);
      this.chatHistory.pop();
      this.chatHistory.push({ role: 'assistant', text: 'Oops! Something went wrong. Try again!' });
      this.updateChatDisplay();
    }
  }

  updateChatDisplay() {
    // Clear previous message containers
    if (this.messageContainers) {
      this.messageContainers.forEach(c => c.destroy());
      this.messageContainers = [];
    }

    const area = this.chatArea;
    const recent = this.chatHistory.slice(-10);
    let y = area.y;
    const maxBubbleW = area.w * 0.9;

    recent.forEach(msg => {
      const isUser = msg.role === 'user';
      const textObj = this.add.text(0, 0, msg.text, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#ffffff',
        wordWrap: { width: maxBubbleW - 24 },
        lineSpacing: 6
      });
      const tw = Math.min(textObj.width + 24, maxBubbleW);
      const th = Math.max(28, textObj.height + 16);

      const g = this.add.graphics();
      const bgColor = isUser ? 0x2b5050 : 0x20212b;
      const borderColor = isUser ? 0x3aaea4 : 0xffd700;
      g.fillStyle(bgColor, 1);
      g.fillRoundedRect(0, 0, tw, th, 6);
      g.lineStyle(2, borderColor, 1);
      g.strokeRoundedRect(0, 0, tw, th, 6);

      const container = this.add.container(0, 0, [g, textObj]);
      textObj.setPosition(12, 8);

      // Position left or right
      const x = isUser ? (area.x + area.w - tw) : area.x;
      container.setPosition(x, y);
      this.messageContainers.push(container);

      y += th + 12;
    });
  }

  endChat() {
    // Cleanup DOM input & listeners
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
      this._resizeHandler = null;
    }
    if (this.inputBox && this.inputBox.parentNode) {
      this.inputBox.parentNode.removeChild(this.inputBox);
      this.inputBox = null;
    }

    // Restore keyboard handling
    if (this.input && this.input.keyboard && typeof this._prevKeyboardEnabled !== 'undefined') {
      this.input.keyboard.enabled = this._prevKeyboardEnabled;
    }

    // Return to previous scene
    this.scene.start(this.returnScene, { villageConfig: this.villageConfig });
  }

  shutdown() {
    // Ensure cleanup on scene shutdown
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
      this._resizeHandler = null;
    }
    if (this.inputBox && this.inputBox.parentNode) {
      this.inputBox.parentNode.removeChild(this.inputBox);
      this.inputBox = null;
    }
    if (this.input && this.input.keyboard && typeof this._prevKeyboardEnabled !== 'undefined') {
      this.input.keyboard.enabled = this._prevKeyboardEnabled;
    }
  }
}
