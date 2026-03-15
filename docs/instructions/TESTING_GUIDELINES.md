# Testing Guidelines

This document covers testing conventions, patterns, and best practices for the srs-cpm2srs-migration project.

## Test Framework

- **Inherit from `unittest.TestCase`** for all test classes
- **Use `pytest` as the test runner** (not `python -m unittest`)
- Use pytest fixtures for common setup (see `tests/conftest.py`)

#### Run Specific Tests
```bash
pytest tests/unit/prepare_migration/test_file.py    # Run specific test file
pytest tests/unit/prepare_migration/                # Run all tests in directory
pytest -k test_function_name                        # Run tests matching pattern
pytest -v                                           # Verbose output
```

## Test Naming Conventions

- Test files: `test_*.py`
- Test classes: `*Test` (e.g., `ReadLinesTest`)
- Test methods: `test_*` (e.g., `test_reads_lines`)

## Test Structure (CRITICAL - NON-NEGOTIABLE)

**Every test MUST follow this exact structure:**

1. **At the beginning (in docstring)**: Use **Given/When/Then** to describe the test scenario
2. **In the test body**: Use **# PREPARE / # MOCK / # ACT / # ASSERT** comments to structure the code

```python
def test_creates_job_successfully(self) -> None:
    """
    Test that job creation works with valid inputs.

    Given: A valid account schedule
    When: Creating a new job with CHANGE_SECRET type and MANUAL trigger
    Then: Job is created with the correct attributes
    """
    # PREPARE
    account_schedule = build_account_schedule()

    # MOCK
    expect(repository, times=1).save_job(...).thenReturn(None)

    # ACT
    job = create_active_job(
        account_schedule=account_schedule,
        job_type=JobType.CHANGE_SECRET,
        trigger=TriggerType.MANUAL,
        username="user"
    )

    # ASSERT
    assert job.job_type == JobType.CHANGE_SECRET
    assert job.trigger == TriggerType.MANUAL
```

**Section Guidelines:**
- **# PREPARE**: Set up test data, build objects, create test fixtures
- **# MOCK**: Define all mock expectations using `expect()` (omit this section if no mocks needed)
- **# ACT**: Execute the code under test (usually one function call)
- **# ASSERT**: Verify the results and side effects

## Assertions

- Use `assert expected == actual` instead of `self.assertEqual(expected, actual)`
- Use `assert condition` instead of `self.assertTrue(condition)`

## Mocking with Mockito

Always use `mockito` for mocking with explicit `times` parameter and specific parameters:

```python
from mockito import expect

# CORRECT - Always use expect with explicit times parameter
expect(repo, times=1).read_account_data("tenant-123", "account-456").thenReturn(account_data)

# WRONG - Never use these
# when(repo).read_account_data(...).thenReturn(...)  # ❌ NEVER
# verify(repo).read_account_data(...)                # ❌ NEVER
```

**Rules (NON-NEGOTIABLE):**
1. Always use `expect(..., times=N)` - never `when()` or `verify()`
2. Always include explicit `times` parameter in every expectation
3. NEVER import `patch`, `Mock`, or `MagicMock` from `unittest.mock`
4. NEVER mix `unittest.mock` with `mockito` - use pure mockito only
5. For instance methods: create instance first, then mock it:
   ```python
   logic = MyLogic(event)
   expect(logic, times=1)._internal_method(...).thenReturn(result)
   ```
6. **Match parameter passing style** - Mock calls must use the same parameter style (named/positional) as the actual code:
   ```python
   # If the actual code calls:
   repo.read_account_data(tenant_id, account_id)
   # Then mock with positional:
   expect(repo, times=1).read_account_data(tenant_id, account_id).thenReturn(data)

   # If the actual code calls:
   repo.create_account(
       tenant_id=tenant_id,
       account_id=account_id,
       metadata=metadata
   )
   # Then mock with named:
   expect(repo, times=1).create_account(
       tenant_id=tenant_id,
       account_id=account_id,
       metadata=metadata
   ).thenReturn(data)
   ```

**Mockito Cleanup (IMPORTANT):**
- **DO NOT use `mockito.unstub()`** in tearDown methods
- Mockito automatically handles mock cleanup between tests when using pytest
- Manual `unstub()` calls are unnecessary and should be avoided
- The pytest-mockito integration ensures clean test isolation automatically

## Common Mocking Patterns

**Mock instance methods or repositories:**
```python
# Return value
expect(logic, times=1)._build_account_data(...).thenReturn(account_data)

# Raise exception
expect(logic, times=1)._build_account_data(...).thenRaise(ResourceNotFoundError('Not found'))

# Chain multiple expectations for complex flows
expect(repo, times=1).create(...).thenRaise(RecordAlreadyExistError('Exists'))
expect(repo, times=1).read(...).thenReturn(existing_data)
expect(repo, times=1).update(...).thenReturn(updated_data)
```

**Testing expected exceptions:**
```python
def test_trigger_action_when_task_type_is_unknown_raises_exception(self) -> None:
    """
    Given: An unknown task action request
    When: trigger_action is called
    Then: the function should raise a ValueError
    """
    # PREPARE
    account_data = build_account_data(account_id=self._account_id, tenant_id=self._tenant_id)

    # ACT / ASSERT
    try:
        account_subtasks_helper.trigger_action(
            task_type=TaskType('UNKNOWN'),
            bulk_id=self._bulk_id,
            account_data=account_data,
            platform_data=self._platform_data,
            bulk_task_params=self.bulk_task_params
        )
        assert False, "Expected ValueError was not raised"
    except ValueError as e:
        assert str(e) == "Unsupported task type: UNKNOWN"
```

**Note:** Use try/except pattern when you need to verify both the exception type and message. The `assert False` ensures test failure if the expected exception is not raised.

**Pattern 5: Verify no unwanted mock interactions**
```python
def test_trigger_action_when_task_type_is_resume(self) -> None:
    """
    Given: A resume task action request
    When: trigger_action is called
    Then: the function should:
      1. call secrets_action_helper.resume_disabled_account_record
      2. return a SubTaskRunResult with status SUCCEEDED
    """
    # PREPARE
    account_data = build_account_data(account_id=self._account_id, tenant_id=self._tenant_id)

    # MOCK
    expect(resume_secrets_management_logic, times=1).resume_disabled_account_record(
        account_data.schedule,
        self._platform_data.rotation_policy_record
    )

    # ACT
    sub_task_run_result = account_subtasks_helper.trigger_action(
        task_type=TaskType.RESUME,
        bulk_id=self._bulk_id,
        account_data=account_data,
        platform_data=self._platform_data,
        bulk_task_params=self.bulk_task_params
    )

    # ASSERT
    assert sub_task_run_result.status == TaskStatus.SUCCEEDED
    mockito.verifyNoUnwantedInteractions()  # Ensures no unexpected mock calls
```

Use `mockito.verifyNoUnwantedInteractions()` to ensure no unexpected mock calls occurred.

**Mockito resources:** [GitHub](https://github.com/kaste/mockito-python) | [Docs](https://mockito-python.readthedocs.io/en/latest/walk-through.html)

## Test Data Patterns

- Use **builder patterns** for test data

## What to Test

- **Tenant isolation** in all repository tests
- **Optimistic locking** scenarios (concurrent updates)
- **Idempotency** for SQS handlers
- **Edge cases** and error conditions

## Test File Organization

Test structure mirrors the service structure:

```
tests/
├── unit/                           # Unit tests (fast, isolated, mocked)
│   ├── prepare_migration/          # Tests for prepare_migration service
│   ├── migration/                  # Tests for migration service
│   ├── shared/                     # Tests for shared utilities
│   ├── conftest.py                 # Unit test fixtures and configuration
│   └── mock_utils.py               # Shared mocking utilities
│
└── integration/                    # Integration tests (slower, may use real AWS)
    ├── prepare_migration/
    ├── migration/
    ├── shared/
    ├── dal/                        # Database access layer tests
    ├── rest_clients/               # External API client tests
    ├── conftest.py                 # Integration test fixtures
    └── test_environment.py         # Environment validation tests
```

**Guidelines:**
- Use `conftest.py` for shared fixtures across test modules
- Use utilities from `mock_utils.py` for consistent mocking patterns
- Unit test directory structure mirrors `cpm2srs_services/` structure
- Integration tests can use `USE_REMOTE_API=true` to test against live APIs
- Keep test files close to the code they test (same relative path)