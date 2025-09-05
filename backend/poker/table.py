import asyncio
import random
from dataclasses import dataclass, field
from typing import List, Dict, Optional

from .cards import make_deck, shuffle, draw
from .eval7 import best_5_of_7


@dataclass
class Player:
    id: str
    name: str
    is_bot: bool
    stack: int
    bet: int = 0
    folded: bool = False
    hole: List[str] = field(default_factory=list)


@dataclass
class Table:
    id: str
    small_blind: int
    big_blind: int
    difficulty: str
    max_players: int
    deck: List[str] = field(default_factory=list)
    board: List[str] = field(default_factory=list)
    players: List[Player] = field(default_factory=list)
    dealer_index: int = 0
    pot: int = 0
    street: str = "idle"  # idle, preflop, flop, turn, river, showdown
    to_act_index: int = 0
    pre_hand_stacks: Dict[str, int] = field(default_factory=dict)
    current_bet: int = 0  # highest bet for the current street

    def find_player(self, pid: str) -> Optional[Player]:
        for p in self.players:
            if p.id == pid:
                return p
        return None

    def seats_open(self) -> int:
        return self.max_players - len(self.players)

    def add_user(self, pid: str, name: str, stack: int) -> bool:
        if len(self.players) >= self.max_players:
            return False
        self.players.append(Player(id=pid, name=name, is_bot=False, stack=stack))
        return True

    def add_bot(self, name: str, stack: int) -> None:
        self.players.append(Player(id=f"bot-{len(self.players)}", name=name, is_bot=True, stack=stack))

    def post_blinds(self):
        if len(self.players) < 2:
            return
        sb_i = (self.dealer_index + 1) % len(self.players)
        bb_i = (self.dealer_index + 2) % len(self.players)
        sb = self.players[sb_i]
        bb = self.players[bb_i]
        sb_amount = min(self.small_blind, sb.stack)
        bb_amount = min(self.big_blind, bb.stack)
        sb.stack -= sb_amount
        bb.stack -= bb_amount
        sb.bet += sb_amount
        bb.bet += bb_amount
        self.pot += sb_amount + bb_amount
        self.current_bet = max(sb.bet, bb.bet)

    def deal(self):
        self.deck = make_deck()
        shuffle(self.deck)
        self.board = []
        for p in self.players:
            p.bet = 0
            p.folded = False
            p.hole = draw(self.deck, 2)

    def next_street(self):
        if self.street == "preflop":
            self.board.extend(draw(self.deck, 3))
            self.street = "flop"
        elif self.street == "flop":
            self.board.extend(draw(self.deck, 1))
            self.street = "turn"
        elif self.street == "turn":
            self.board.extend(draw(self.deck, 1))
            self.street = "river"
        elif self.street == "river":
            self.street = "showdown"

    def start_hand(self):
        self.street = "preflop"
        self.deal()
        self.post_blinds()
        self.to_act_index = (self.dealer_index + 3) % len(self.players) if len(self.players) >= 3 else 0
        # snapshot stacks for delta calculation
        self.pre_hand_stacks = {p.id: p.stack for p in self.players}

    def legal_actions(self, pid: str) -> Dict:
        # Simplified for v1 stub: allow fold/check/call/bet/raise unrestricted within stack
        # Proper min-raise and side pots handled in later iteration
        p = self.find_player(pid)
        if not p or p.folded:
            return {"canAct": False}
        return {
            "canAct": True,
            "canFold": True,
            "canCheck": True,
            "canCall": True,
            "minBet": 0,
            "maxBet": p.stack,
        }

    def all_but_one_folded(self) -> bool:
        active = [p for p in self.players if not p.folded]
        return len(active) <= 1

    def advance_action(self):
        n = len(self.players)
        for _ in range(n):
            self.to_act_index = (self.to_act_index + 1) % n
            if not self.players[self.to_act_index].folded:
                break

    def everyone_matched(self) -> bool:
        # all non-folded players have matched the current bet
        active = [p for p in self.players if not p.folded]
        if not active:
            return True
        target = max((p.bet for p in active), default=0)
        self.current_bet = target
        return all(p.bet == target for p in active)

    def set_first_to_act_for_new_street(self):
        # On postflop and later, first to act is left of dealer
        n = len(self.players)
        idx = (self.dealer_index + 1) % n
        # find first non-folded
        for _ in range(n):
            if not self.players[idx].folded:
                self.to_act_index = idx
                break
            idx = (idx + 1) % n

    def reset_bets_for_new_street(self):
        for p in self.players:
            p.bet = 0
        self.current_bet = 0

    def settle_showdown(self):
        active = [p for p in self.players if not p.folded]
        if len(active) == 1:
            winner = active[0]
            winner.stack += self.pot
            won = self.pot
            self.pot = 0
            return [{"playerId": winner.id, "amountWon": won, "handRank": None}], [], {}

        results = []
        for p in active:
            rank, best5 = best_5_of_7(p.hole + self.board)
            results.append((p, rank, best5))
        results.sort(key=lambda x: x[1], reverse=True)
        best_rank = results[0][1]
        winners = [p for (p, r, _) in results if r == best_rank]
        split = self.pot // len(winners)
        for w in winners:
            w.stack += split
        winners_out = [{"playerId": w.id, "handRank": str(best_rank), "amountWon": split} for w in winners]
        showdown_hands = {r[0].id: r[2] for r in results}
        self.pot = 0
        return winners_out, list(self.board), showdown_hands

    def snapshot(self, you_id: str) -> Dict:
        return {
            "tableId": self.id,
            "street": self.street,
            "board": list(self.board),
            "pot": self.pot,
            "players": [
                {"id": p.id, "name": p.name, "stack": p.stack, "bet": p.bet, "folded": p.folded}
                for p in self.players
            ],
            "you": {"id": you_id, "hole": self.find_player(you_id).hole if self.find_player(you_id) else []},
            "toAct": self.players[self.to_act_index].id if self.players else None,
        }


