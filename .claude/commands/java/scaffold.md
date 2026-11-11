---
description: Scaffold a complete Spring Boot REST endpoint with Controller, Service, Repository, DTO, and Mapper.
---

# Scaffold Spring Boot REST Endpoint

## When to use

Use when adding a new resource to a Spring Boot API. Pass the resource name and key operations
in `$ARGUMENTS` (e.g., "Product entity with CRUD + search by category"). Generates production-ready
boilerplate following Spring Boot best practices.

## Instructions

Generate a complete, layered implementation for the described resource. Follow these conventions:

**Controller**
- Annotate with `@RestController`, `@RequestMapping("/api/v1/<resources>")`, `@RequiredArgsConstructor`
- Use `@Tag` (SpringDoc) for OpenAPI grouping
- Map each operation to the correct HTTP verb and status code:
  - `GET /resources` → 200, `GET /resources/{id}` → 200
  - `POST /resources` → 201 with `Location` header
  - `PUT /resources/{id}` → 200, `PATCH /resources/{id}` → 200
  - `DELETE /resources/{id}` → 204
- Validate request bodies with `@Valid`
- Return `ResponseEntity<T>` for all endpoints

**Service**
- Annotate with `@Service`, `@RequiredArgsConstructor`, `@Transactional`
- Use `@Transactional(readOnly = true)` on read methods
- Throw domain exceptions (e.g., `ResourceNotFoundException`) — never HTTP exceptions
- Accept and return DTOs, not entities — entities never leave the service layer

**Repository**
- Extend `JpaRepository<Entity, Long>`
- Add custom queries as Spring Data method names or `@Query` with JPQL
- Use `Pageable` for list endpoints

**Entity**
- Annotate with `@Entity`, `@Table(name = "...")`, `@Data` (Lombok)
- Use `@Id`, `@GeneratedValue(strategy = GenerationType.IDENTITY)`
- Add `@CreatedDate`, `@LastModifiedDate` with `@EnableJpaAuditing`
- Use `@Column(nullable = false, length = ...)` with appropriate constraints

**DTO (Request / Response)**
- Separate `XxxRequest` and `XxxResponse` records (Java 17+ records preferred)
- Add Bean Validation annotations on Request: `@NotBlank`, `@Size`, `@NotNull`
- Response includes `id`, timestamps, and all relevant fields

**Mapper**
- Use MapStruct: `@Mapper(componentModel = "spring")`
- Map entity ↔ DTO without manual mapping logic

**Exception**
- `ResourceNotFoundException extends RuntimeException` with `@ResponseStatus(HttpStatus.NOT_FOUND)`

## Steps

1. Parse `$ARGUMENTS` to identify: entity name, fields, operations (CRUD / search / etc.)
2. Generate all files with their full package declarations
3. Follow the project's existing naming conventions if visible in context

## Output format

Generate each file as a labeled code block:

```java
// === ProductController.java ===
package com.example.api.product;
...

// === ProductService.java ===
...
```

After the code, list any additional setup required (e.g., migration, `@EnableJpaAuditing`).
