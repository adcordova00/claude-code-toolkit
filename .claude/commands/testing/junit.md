---
description: Generate JUnit 5 + Mockito unit tests for a Spring Boot service or repository.
---

# Generate JUnit 5 + Mockito Tests

## When to use

Use when writing unit tests for a Spring Boot service, component, or utility class. Pass the
class code or file path in `$ARGUMENTS`. Generates tests that are fast, isolated, and focused
on business logic — no Spring context loaded.

## Instructions

Generate JUnit 5 tests with Mockito following these conventions:

**Test class structure**
- `@ExtendWith(MockitoExtension.class)` — not `@SpringBootTest` (keeps tests fast)
- `@InjectMocks` for the class under test
- `@Mock` for all dependencies
- `@Captor` for argument captors when verifying what was passed to mocks

**Naming and organization**
- Class name: `UserServiceTest` (not `UserServiceTests`)
- Test method names: `shouldReturnUserWhenFoundById()` or nested `@Nested` classes:
  ```java
  @Nested
  class FindById {
    @Test void shouldReturnUser_whenFound() {}
    @Test void shouldThrow_whenNotFound() {}
  }
  ```

**Mocking patterns**
- `when(mock.method(any())).thenReturn(value)` for happy path
- `when(mock.method(any())).thenThrow(new ...)` for error paths
- `doNothing().when(mock).voidMethod()` for void methods
- `verify(mock, times(1)).method(captor.capture())` to verify interactions
- `verifyNoInteractions(mock)` when a dependency should not be called at all

**What to test for services**
- Happy path: correct result returned for valid input
- Not found: throws `ResourceNotFoundException` when entity doesn't exist
- Business rules: throws `BusinessRuleException` when rules are violated
- Delegation: correct dependencies called with correct args (`ArgumentCaptor`)
- Transaction behavior: `@Transactional` side effects (verify save was called)
- Edge cases: null inputs, empty collections, boundary values

**Repository tests (if requested)**
- Use `@DataJpaTest` + `TestEntityManager` for repository layer
- Use H2 in-memory or Testcontainers (prefer Testcontainers for accuracy)
- Test custom queries: sorting, filtering, pagination

**Assertion style**
- Use AssertJ: `assertThat(result).isNotNull().isEqualTo(expected)`
- `assertThatThrownBy(() -> service.method()).isInstanceOf(NotFoundException.class).hasMessage("...")`
- Avoid `assertEquals(expected, actual)` — poor error messages

## Steps

1. Read the class under test to identify: dependencies, public methods, business rules, exceptions
2. Write one `@Test` per behavior (not per method)
3. Cover: happy path, exception cases, verification of collaborator interactions

## Output format

```java
// === UserServiceTest.java ===
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
  ...
}
```
