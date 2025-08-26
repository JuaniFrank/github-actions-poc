function sum(a: number, b: number): number {
  return a + b
}

test('suma 1 + 2 debería ser 3', () => {
  expect(sum(1, 2)).toBe(3)
})
