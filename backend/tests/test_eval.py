from backend.poker.eval7 import hand_rank_5, best_5_of_7


def test_pair_vs_two_pair():
    r1 = hand_rank_5(["Ah","Ad","2c","3d","4s"])  # pair of Aces
    r2 = hand_rank_5(["Kh","Kd","Qs","Qd","2h"])  # two pair
    assert r2 > r1


def test_best_5_of_7():
    rank, best5 = best_5_of_7(["Ah","Kh","Qh","Jh","Th","2c","3d"])  # royal flush
    assert rank[0] == 8
    assert len(best5) == 5


