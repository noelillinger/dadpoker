import random
import asyncio


async def decide_easy(state, player):
    await asyncio.sleep(random.uniform(0.3, 0.8))
    # fold often to raises, random small bets
    if random.random() < 0.3:
        return {"action": "fold"}
    if random.random() < 0.5:
        return {"action": "check"}
    amount = min(10, player.stack)
    return {"action": "bet", "amount": amount}


async def decide_medium(state, player):
    await asyncio.sleep(random.uniform(0.3, 0.8))
    # rule-based stub
    return {"action": "call"}


async def decide_hard(state, player):
    await asyncio.sleep(random.uniform(0.3, 0.8))
    # lightweight Monte Carlo placeholder
    if random.random() < 0.6:
        return {"action": "call"}
    return {"action": "raise", "amount": min(20, player.stack)}


def get_bot_decider(difficulty: str):
    if difficulty == 'easy':
        return decide_easy
    if difficulty == 'medium':
        return decide_medium
    return decide_hard


