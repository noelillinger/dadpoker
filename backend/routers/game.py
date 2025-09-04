import json
from typing import Optional, Dict, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from jose import jwt, JWTError
import asyncio

from config import SECRET_KEY, JWT_ALG
from poker.table import Table
from poker.bots import get_bot_decider
from database import AsyncSessionLocal
from sqlalchemy import select
from models import User, Hand


router = APIRouter()

tables: Dict[str, Table] = {}
rooms: Dict[str, List[WebSocket]] = {}


async def _extract_token(websocket: WebSocket) -> Optional[str]:
    cookie = websocket.cookies.get("access_token")
    if cookie:
        return cookie
    token = websocket.query_params.get("token")
    return token


async def broadcast(table_id: str, message: dict):
    data = json.dumps(message)
    for ws in list(rooms.get(table_id, [])):
        try:
            await ws.send_text(data)
        except Exception:
            pass


@router.websocket("/ws/table/{table_id}")
async def table_ws(websocket: WebSocket, table_id: str):
    token = await _extract_token(websocket)
    if not token:
        await websocket.close(code=4401)
        return
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALG])
        username = payload.get("sub")
        role = payload.get("role")
        if not username or role != 'admin':
            await websocket.close(code=4403)
            return
    except JWTError:
        await websocket.close(code=4401)
        return

    await websocket.accept()
    rooms.setdefault(table_id, []).append(websocket)
    table = tables.get(table_id)
    if not table:
        # default table, will be configured by CREATE_TABLE (amounts in cents)
        table = Table(id=table_id, small_blind=50, big_blind=100, difficulty='easy', max_players=6)
        tables[table_id] = table

    you_id = f"user:{username}"
    # sync stack with DB balance
    async with AsyncSessionLocal() as session:
        res = await session.execute(select(User).where(User.username == username))
        db_user = res.scalar_one_or_none()
        balance = db_user.balance if db_user else 100000
    if not table.find_player(you_id):
        table.add_user(you_id, username, stack=balance)
    else:
        table.find_player(you_id).stack = balance

    await websocket.send_text(json.dumps({"type": "TABLE_STATE", **table.snapshot(you_id)}))

    async def handle_bot_turn():
        if table.players and table.players[table.to_act_index].is_bot:
            bot = table.players[table.to_act_index]
            decider = get_bot_decider(table.difficulty)
            action = await decider(table.snapshot(bot.id), bot)
            await apply_action(table, bot.id, action)

    async def apply_action(t: Table, pid: str, action: dict):
        p = t.find_player(pid)
        if not p or p.folded:
            return
        a = action.get("action")
        amount = int(action.get("amount", 0))
        if a == "fold":
            p.folded = True
        elif a in ("check", "call"):
            pass
        elif a in ("bet", "raise") and amount > 0:
            bet = min(amount, p.stack)
            p.stack -= bet
            p.bet += bet
            t.pot += bet
        t.advance_action()
        await broadcast(table_id, {"type": "TABLE_STATE", **t.snapshot(you_id)})
        if t.all_but_one_folded():
            winners, board, hands = t.settle_showdown()
            await broadcast(table_id, {"type": "HAND_RESULT", "winners": winners, "board": board, "showdownHands": hands})
            # persist delta for the human user
            start = t.pre_hand_stacks.get(you_id, None)
            end = t.find_player(you_id).stack if t.find_player(you_id) else None
            if start is not None and end is not None:
                delta = end - start
                async with AsyncSessionLocal() as session:
                    res = await session.execute(select(User).where(User.username == username))
                    db_user = res.scalar_one_or_none()
                    if db_user:
                        db_user.balance = db_user.balance + delta
                        session.add(Hand(delta=delta, difficulty=t.difficulty, players=len(t.players), user_id=db_user.id))
                        await session.commit()

    try:
        while True:
            msg = await websocket.receive_text()
            try:
                data = json.loads(msg)
            except Exception:
                await websocket.send_text(json.dumps({"type": "ERROR", "message": "Invalid message"}))
                continue
            typ = data.get("type")
            if typ == "CREATE_TABLE":
                difficulty = data.get("difficulty", "easy")
                players = int(data.get("players", 4))
                sb = int(data.get("small_blind", 5))
                bb = int(data.get("big_blind", 10))
                table.small_blind = sb
                table.big_blind = bb
                table.difficulty = difficulty
                table.max_players = max(2, min(6, players))
                # fill bots
                while len([p for p in table.players if p.is_bot]) < (table.max_players - 1):
                    table.add_bot(name=f"Bot {len(table.players)+1}", stack=1000)
                await broadcast(table_id, {"type": "TABLE_STATE", **table.snapshot(you_id)})
            elif typ == "JOIN_AS_USER":
                name = data.get("name", username)
                if not table.find_player(you_id):
                    table.add_user(you_id, name, stack=1000)
                await broadcast(table_id, {"type": "TABLE_STATE", **table.snapshot(you_id)})
            elif typ == "START_HAND":
                table.start_hand()
                await broadcast(table_id, {"type": "TABLE_STATE", **table.snapshot(you_id)})
                await handle_bot_turn()
            elif typ == "USER_ACTION":
                await apply_action(table, you_id, data)
                await handle_bot_turn()
            else:
                await websocket.send_text(json.dumps({"type": "ERROR", "message": "Unknown message"}))
    except WebSocketDisconnect:
        pass
    finally:
        try:
            rooms.get(table_id, []).remove(websocket)
        except Exception:
            pass


