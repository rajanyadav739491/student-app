/**
 * FlashcardService - Real CRUD Deck Engine & Active Recall
 */

import { storageService } from './storageService.js';
import { eventBus } from './eventBus.js';
import { DEFAULT_STATE } from '../data/defaultState.js';

class FlashcardService {
  constructor() {
    this.storageKey = 'flashcards_data';
  }

  getCards() {
    return storageService.get(this.storageKey, DEFAULT_STATE.flashcards);
  }

  saveCards(cards) {
    storageService.set(this.storageKey, cards);
    eventBus.emit('flashcards:updated', this.getStats());
  }

  addCard({ question, answer, subject = 'Physics', chapter = 'General', difficulty = 'Medium' }) {
    if (!question || !question.trim()) return null;
    const cards = this.getCards();
    const newCard = {
      id: `fc-${Date.now()}`,
      question: question.trim(),
      answer: (answer || '').trim(),
      subject,
      chapter,
      difficulty,
      learned: false
    };

    cards.push(newCard);
    this.saveCards(cards);
    return newCard;
  }

  updateCard(id, updatedFields) {
    const cards = this.getCards();
    const card = cards.find(c => c.id === id);
    if (!card) return;

    Object.assign(card, updatedFields);
    this.saveCards(cards);
  }

  deleteCard(id) {
    let cards = this.getCards();
    cards = cards.filter(c => c.id !== id);
    this.saveCards(cards);
  }

  markLearned(id, isLearned = true) {
    const cards = this.getCards();
    const card = cards.find(c => c.id === id);
    if (!card) return;

    card.learned = isLearned;
    this.saveCards(cards);
  }

  getStats() {
    const cards = this.getCards();
    const learned = cards.filter(c => c.learned).length;
    const difficult = cards.filter(c => c.difficulty === 'Hard').length;
    return {
      total: cards.length,
      learned,
      difficult,
      remaining: cards.length - learned
    };
  }
}

export const flashcardService = new FlashcardService();
