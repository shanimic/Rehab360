# Code Style Guidelines

## Import Rules

- **Always use top-level imports** - never import inside functions
- Group imports: stdlib, third-party, local (separated by blank lines)
- Use absolute imports, not relative imports

## Type Hints

- Use **type hints** in all function signatures
- Use `T | None` for parameters that can be `None` (not `Optional[T]`)
- Always type return values (use `-> None` if no return)
- Use lowercase builtins: `dict`, `list`, `set` (Python 3.9+ syntax, not `Dict`, `List`, `Set` from `typing`)

## Docstrings

Always use **Google Style docstrings** with `Args:`, `Returns:`, and `Raises:` sections:

## Function Calls

- Always prefer **keyword arguments** over positional arguments when calling functions:

```python
# Preferred
await self.cursor.execute(query=sql, args=params)
User(name="Alice", role=Role.PATIENT)

# Avoid
await self.cursor.execute(sql, params)
User("Alice", Role.PATIENT)
```

## SQL Formatting (DAL layer)

**SELECT queries** — multi-line with `query=` and `args=` keyword arguments:

```python
await self.cursor.execute(
    query=f"""
            SELECT email,
                   password,
                   role
            FROM {self.table_name}
            WHERE email = %s AND
                  role = %s
            """,
    args=(login.email, login.role.value)
)
```

**INSERT statements** — single-line with positional arguments:

```python
await self.cursor.execute(
    f"INSERT INTO {self.table_name} (name, email, password, role) VALUES (%s, %s, %s, %s)",
    (register.name, register.email, register.password, register.role.value)
)
```
