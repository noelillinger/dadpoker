import random

RANKS = '23456789TJQKA'
SUITS = 'cdhs'  # clubs, diamonds, hearts, spades


def make_deck():
    return [r + s for r in RANKS for s in SUITS]


def shuffle(deck):
    random.shuffle(deck)


def draw(deck, n):
    out = deck[:n]
    del deck[:n]
    return out


def card_value(card):
    return RANKS.index(card[0])


