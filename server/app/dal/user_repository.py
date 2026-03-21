from aiomysql import DictCursor

from app.models.users.user import LoginRequest, LoginResponse


class UserRepository:
    def __init__(self, db: DictCursor):
        self.cursor = db
        self.table_name = "users"

    async def get_user_for_auth(self, login: LoginRequest):
        await self.cursor.execute(
            f"SELECT email, password, role FROM {self.table_name} WHERE email = %s AND role = %s",
            (login.email, login.role.value)
        )
        row = await self.cursor.fetchone()
        return LoginResponse.model_validate(row) if row else None
    