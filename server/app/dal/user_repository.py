from aiomysql import DictCursor

from app.models.users.user import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse


class UserRepository:
    def __init__(self, db: DictCursor) -> None:
        self.cursor = db
        self.table_name = "registered_users"

    async def get_user_for_auth(self, login: LoginRequest) -> LoginResponse | None:
        """Fetches a user's credentials and role for authentication.

        Args:
            login: The login request containing email and role.

        Returns:
            A LoginResponse with the user's credentials, or None if not found.
        """
        await self.cursor.execute(
            query=f"""
                    SELECT email,
                           password_hash AS password,
                           user_role AS role,
                           first_name
                    FROM {self.table_name}
                    WHERE email = %s AND
                          user_role = %s
                    """,
            args=(login.email, login.role.value)
        )
        row = await self.cursor.fetchone()
        return LoginResponse.model_validate(row) if row else None

    async def create_user(self, register: RegisterRequest) -> RegisterResponse:
        """Creates a new user in the database.

        Args:
            register: The registration request containing user details.

        Returns:
            A RegisterResponse with the created user's details.
        """
        await self.cursor.execute(
            f"INSERT INTO {self.table_name} (name, email, password, role) VALUES (%s, %s, %s, %s)",
            (register.name, register.email, register.password, register.role.value)
        )
        return RegisterResponse(name=register.name, email=register.email, role=register.role)
