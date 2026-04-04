"""Helpers for stubbing async methods in unit tests."""


def async_return(result=None):
    """Build an awaitable that resolves to ``result`` (for mockito stubs on async I/O)."""

    async def _coroutine():
        return result

    return _coroutine()
