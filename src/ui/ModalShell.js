/**
 * Mülk-i Osmanî - Erişilebilir Ortak Modal Kabuğu (ModalShell)
 * 
 * V2 Erişilebilirlik Standartları (G0-10 / Bölüm 13):
 * - role="dialog", aria-modal="true", aria-labelledby
 * - Klavye gezinimi (Tab ile focus trap, Escape ile güvenli kapanış)
 * - Kapanışta önceki odaklanılan öğeye geri dönme (Focus restoration)
 * - prefers-reduced-motion desteği
 */

export class ModalShell {
  constructor() {
    this.activeModal = null;
    this.previouslyFocusedElement = null;
    this._handleKeyDown = this._handleKeyDown.bind(this);
  }

  open(modalElement, options = {}) {
    if (!modalElement) return;

    this.previouslyFocusedElement = document.activeElement;
    this.activeModal = modalElement;

    // ARIA özellikleri
    modalElement.setAttribute('role', 'dialog');
    modalElement.setAttribute('aria-modal', 'true');
    if (options.titleId) {
      modalElement.setAttribute('aria-labelledby', options.titleId);
    }

    modalElement.classList.remove('hidden');
    modalElement.style.display = options.display || 'flex';

    // Klavye dinleyicisini bağla
    document.addEventListener('keydown', this._handleKeyDown);

    // İlk odaklanabilir öğeye odaklan
    setTimeout(() => {
      const focusable = this._getFocusableElements(modalElement);
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }, 50);

    if (options.onOpen) options.onOpen();
  }

  close(modalElement = this.activeModal, options = {}) {
    if (!modalElement) return;

    modalElement.classList.add('hidden');
    modalElement.style.display = 'none';

    document.removeEventListener('keydown', this._handleKeyDown);

    // Focus restoration
    if (this.previouslyFocusedElement && typeof this.previouslyFocusedElement.focus === 'function') {
      try {
        this.previouslyFocusedElement.focus();
      } catch (e) {}
    }

    this.activeModal = null;
    if (options.onClose) options.onClose();
  }

  _getFocusableElements(container) {
    if (!container) return [];
    return Array.from(container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(el => el.offsetWidth > 0 || el.offsetHeight > 0);
  }

  _handleKeyDown(event) {
    if (!this.activeModal) return;

    // Escape ile kapat
    if (event.key === 'Escape' || event.key === 'Esc') {
      event.preventDefault();
      this.close(this.activeModal);
      return;
    }

    // Tab Focus Trap
    if (event.key === 'Tab') {
      const focusable = this._getFocusableElements(this.activeModal);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          event.preventDefault();
        }
      }
    }
  }
}

export const modalShell = new ModalShell();
