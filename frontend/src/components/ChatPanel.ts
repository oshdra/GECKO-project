import { ChatMessage, fetchSimulatorChat, iterateSimulatorSse, GenerateEvent } from '../api/client';
import { createProgressStepper } from './ProgressStepper';
import { t } from '../i18n';

export class ChatPanel {
  private container: HTMLElement;
  private simulatorId: string;
  private chatMessages: ChatMessage[];
  private onIterationComplete: (newVersion: number) => void;

  private messagesListEl!: HTMLElement;
  private stepperContainerEl!: HTMLElement;
  private inputEl!: HTMLInputElement;
  private sendBtnEl!: HTMLButtonElement;
  private isStreaming: boolean = false;

  private activeStep: number = 1;
  private stepStatuses: Record<number, 'pending' | 'running' | 'done' | 'error'> = {
    1: 'pending',
    2: 'pending',
    3: 'pending',
    4: 'pending',
  };

  constructor(
    simulatorId: string,
    initialChat: ChatMessage[] = [],
    onIterationComplete: (newVersion: number) => void
  ) {
    this.container = document.createElement('div');
    this.container.className = 'chat-panel';
    this.simulatorId = simulatorId;
    this.chatMessages = initialChat;
    this.onIterationComplete = onIterationComplete;
  }

  public render(): HTMLElement {
    this.container.innerHTML = `
      <div class="chat-panel-header">
        <div class="chat-title-group">
          <svg class="chat-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <h3>${t('detail.chatTitle')}</h3>
        </div>
      </div>
      <div class="chat-messages-container"></div>
      <div class="chat-stepper-container" style="display: none;"></div>
      <form class="chat-input-form">
        <input type="text" class="chat-input" placeholder="${t('detail.chatPlaceholder')}" />
        <button type="submit" class="btn btn-primary chat-send-btn">${t('detail.sendBtn')}</button>
      </form>
    `;

    this.messagesListEl = this.container.querySelector('.chat-messages-container') as HTMLElement;
    this.stepperContainerEl = this.container.querySelector('.chat-stepper-container') as HTMLElement;
    this.inputEl = this.container.querySelector('.chat-input') as HTMLInputElement;
    this.sendBtnEl = this.container.querySelector('.chat-send-btn') as HTMLButtonElement;

    this.renderMessages();

    const form = this.container.querySelector('.chat-input-form') as HTMLFormElement;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    return this.container;
  }

  public updateMessages(messages: ChatMessage[]) {
    this.chatMessages = messages;
    this.renderMessages();
  }

  private renderMessages() {
    this.messagesListEl.innerHTML = '';

    if (!this.chatMessages || this.chatMessages.length === 0) {
      this.messagesListEl.innerHTML = `<div class="chat-empty">${t('detail.noMessages')}</div>`;
      return;
    }

    this.chatMessages.forEach((msg) => {
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble chat-bubble-${msg.role}`;

      const roleBadge = msg.role === 'user' ? 'You' : 'GECKO AI';
      const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

      bubble.innerHTML = `
        <div class="chat-bubble-header">
          <span class="chat-author">${roleBadge}</span>
          ${timeStr ? `<span class="chat-time">${timeStr}</span>` : ''}
        </div>
        <div class="chat-bubble-content">${escapeHtml(msg.content)}</div>
      `;

      this.messagesListEl.appendChild(bubble);
    });

    this.scrollToBottom();
  }

  private scrollToBottom() {
    this.messagesListEl.scrollTop = this.messagesListEl.scrollHeight;
  }

  private resetStepper() {
    this.activeStep = 1;
    this.stepStatuses = { 1: 'pending', 2: 'pending', 3: 'pending', 4: 'pending' };
    this.renderStepper();
  }

  private renderStepper() {
    this.stepperContainerEl.innerHTML = '';
    this.stepperContainerEl.appendChild(createProgressStepper(this.activeStep, this.stepStatuses));
  }

  private async handleSubmit() {
    const text = this.inputEl.value.trim();
    if (!text || this.isStreaming) return;

    this.isStreaming = true;
    this.inputEl.value = '';
    this.inputEl.disabled = true;
    this.sendBtnEl.disabled = true;

    // Append user message locally
    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    this.chatMessages.push(userMsg);
    this.renderMessages();

    // Show stepper
    this.stepperContainerEl.style.display = 'block';
    this.resetStepper();

    try {
      await iterateSimulatorSse(this.simulatorId, text, (event: GenerateEvent) => {
        this.handleSseEvent(event);
      });
    } catch (err) {
      console.error('Iteration error:', err);
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `Error updating simulator: ${err instanceof Error ? err.message : String(err)}`,
        timestamp: new Date().toISOString(),
      };
      this.chatMessages.push(errorMsg);
      this.renderMessages();
    } finally {
      this.isStreaming = false;
      this.inputEl.disabled = false;
      this.sendBtnEl.disabled = false;
      this.stepperContainerEl.style.display = 'none';
      this.inputEl.focus();

      // Refresh chat list from backend
      try {
        const updatedChat = await fetchSimulatorChat(this.simulatorId);
        this.updateMessages(updatedChat);
      } catch (e) {
        console.warn('Failed to refresh chat after iteration:', e);
      }
    }
  }

  private handleSseEvent(event: GenerateEvent) {
    if (event.step) {
      this.activeStep = event.step;
      this.stepStatuses[event.step] = event.status;
      this.renderStepper();
    }

    if (event.step === 4 && event.status === 'done' && event.version) {
      this.onIterationComplete(event.version);
    }
  }
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
