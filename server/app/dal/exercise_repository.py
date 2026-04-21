from aiomysql import DictCursor


class ExerciseRepository:
    def __init__(self, db: DictCursor) -> None:
        self.cursor = db