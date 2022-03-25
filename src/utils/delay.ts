export async function delay() {
  return new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));
}
