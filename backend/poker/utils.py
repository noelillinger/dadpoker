def calculate_min_raise(current_bet: int, last_raise: int, big_blind: int) -> int:
    base = max(last_raise, big_blind)
    return current_bet + base


def distribute_side_pots(contributions: dict[str, int], winners: list[str]) -> dict[str, int]:
    # Very simple side-pot distribution that handles all-in ordering and split between winners.
    # contributions: player_id -> total chips put in this hand
    # returns: player_id -> amount won (net from pots, not net profit)
    if not contributions:
        return {}
    # sort players by contribution asc (all-in order)
    layers = sorted(set(contributions.values()))
    payouts = {pid: 0 for pid in contributions.keys()}
    prev = 0
    for layer in layers:
        layer_amount = layer - prev
        # players eligible in this layer are those who contributed >= layer
        eligible = [pid for pid, c in contributions.items() if c >= layer]
        pot_size = layer_amount * len(eligible)
        if not eligible:
            continue
        share = pot_size // max(1, len(winners))
        for w in winners:
            if w in eligible:
                payouts[w] += share
        prev = layer
    return payouts


