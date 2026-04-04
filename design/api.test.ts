import { expect } from "expect";
import { createMemory, listMemories } from "./api";

async function testCreateMemory() {
  const before = await listMemories();
  const created = await createMemory({
    name: "Test User",
    message: "This is a test memory for Oscar.",
  });

  expect(created).toHaveProperty("id");
  expect(created.name).toBe("Test User");
  expect(created.message).toBe(
    "This is a test memory for Oscar.",
  );

  const after = await listMemories();
  const found = after.find((m) => m.id === created.id);
  expect(found).toBeTruthy();
}

type TestResult = {
  passedTests: string[];
  failedTests: { name: string; error: string }[];
};

export async function _runApiTests() {
  const result: TestResult = {
    passedTests: [],
    failedTests: [],
  };

  const tests = [testCreateMemory];

  const finalResult = await tests.reduce(
    async (accPromise, testFn) => {
      const acc = await accPromise;
      try {
        await testFn();
        acc.passedTests.push(testFn.name);
      } catch (error) {
        acc.failedTests.push({
          name: testFn.name,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error",
        });
      }
      return acc;
    },
    Promise.resolve(result),
  );

  return finalResult;
}