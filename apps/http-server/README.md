# HTTP Server Testing Guide

## White-Box Testing Theory

White-box testing is a technique where test cases are designed using internal code knowledge.
Instead of testing only input and output, we intentionally verify internal branches, logic paths,
error handling blocks, and dependency calls.

In this project, the file apps/http-server/test/auth.whitebox.test.ts is a white-box test file.
It targets internal decision points inside apps/http-server/src/auth/auth.ts.

## Why This Test File Is White-Box

The test cases are mapped to exact internal branches in the route handlers:

1. GET /auth/me missing token path
2. GET /auth/me invalid JWT catch path
3. GET /auth/me user-not-found path
4. GET /auth/me success path
5. POST /auth/sign-up existing-user conflict path
6. POST /auth/sign-up create-new-user success path

This is white-box because we know and intentionally cover each if/catch branch from source code,
not just random API behavior.

## Architecture Of The Test Setup

1. Test runner: Vitest
2. HTTP assertions: Supertest
3. Test app: Express app with only auth router mounted
4. Database behavior: mocked by aliasing @repo/db to test/mocks/repo-db.ts

The alias is configured in apps/http-server/vitest.config.ts.
This lets tests force specific internal flows by controlling prisma.user.findUnique and prisma.user.create responses.

## How The Test Works Internally

1. Build a local Express app in test file and mount /auth router.
2. Send HTTP requests with Supertest.
3. Mock database return values before each request.
4. Assert response status and payload.
5. Assert internal dependency calls with expected arguments.

Example: for the user-not-found branch, we provide a valid JWT, mock prisma.user.findUnique to return null,
then verify the route returns 404. This directly proves that branch executes as expected.

## How To Run

From repository root:

1. npm install --workspace apps/http-server
2. npm run test --workspace apps/http-server

From apps/http-server folder:

1. npm run test

## Current White-Box Test File

apps/http-server/test/auth.whitebox.test.ts

## Benefits Of This White-Box Approach

1. Confirms branch-level correctness, not only endpoint-level behavior.
2. Catches logic regressions early when auth flow changes.
3. Gives deterministic coverage by mocking DB outcomes.
4. Makes debugging easier because each test maps to a known source branch.
