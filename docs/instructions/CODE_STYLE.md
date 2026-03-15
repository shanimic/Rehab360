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
