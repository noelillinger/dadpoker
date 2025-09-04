from collections import Counter

RANKS = '23456789TJQKA'


def hand_rank_5(cards):
    ranks = sorted([RANKS.index(c[0]) for c in cards], reverse=True)
    suits = [c[1] for c in cards]
    counts = Counter(ranks)
    ordered = sorted(counts.items(), key=lambda x: (x[1], x[0]), reverse=True)
    is_flush = len(set(suits)) == 1
    unique = sorted(set(ranks), reverse=True)
    # Handle wheel straight A-2-3-4-5
    if set([12, 0, 1, 2, 3]).issubset(set(ranks)):
        straight_high = 3
    else:
        straight_high = None
        for i in range(len(unique) - 4 + 1):
            window = unique[i:i+5]
            if window[0] - window[-1] == 4:
                straight_high = window[0]
                break
    is_straight = straight_high is not None

    if is_straight and is_flush:
        return (8, straight_high)
    if ordered[0][1] == 4:
        # four kind
        quad = ordered[0][0]
        kicker = max([r for r in ranks if r != quad])
        return (7, quad, kicker)
    if ordered[0][1] == 3 and ordered[1][1] == 2:
        # full house
        return (6, ordered[0][0], ordered[1][0])
    if is_flush:
        return (5, *ranks)
    if is_straight:
        return (4, straight_high)
    if ordered[0][1] == 3:
        trips = ordered[0][0]
        kickers = [r for r in ranks if r != trips][:2]
        return (3, trips, *kickers)
    if ordered[0][1] == 2 and ordered[1][1] == 2:
        high_pair, low_pair = sorted([ordered[0][0], ordered[1][0]], reverse=True)
        kicker = max([r for r in ranks if r != high_pair and r != low_pair])
        return (2, high_pair, low_pair, kicker)
    if ordered[0][1] == 2:
        pair = ordered[0][0]
        kickers = [r for r in ranks if r != pair][:3]
        return (1, pair, *kickers)
    return (0, *ranks)


def best_5_of_7(cards7):
    # brute force combinations of 7 choose 5 = 21
    from itertools import combinations
    best = None
    best5 = None
    for combo in combinations(cards7, 5):
        rank = hand_rank_5(list(combo))
        if best is None or rank > best:
            best = rank
            best5 = list(combo)
    return best, best5


