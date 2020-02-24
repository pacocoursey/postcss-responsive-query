const postcss = require("postcss");
const plugin = require("./");

const defaultOptions = {
  breakpoints: {
    m: "(max-width: 600px)",
    t: "(max-width: 960px) and (min-width: 600px)",
    d: "(min-width: 961px)"
  }
};

async function run(input, output) {
  const result = await postcss([plugin(defaultOptions)]).process(input, {
    from: undefined
  });
  expect(result.css).toEqual(output);
  expect(result.warnings()).toHaveLength(0);
}

it("does nothing when no @responsive rules exist", async () => {
  await run("a {}", "a {}");
});

it("expands rule into 3 media queries", async () => {
  const output = `@media (max-width: 600px) { .a-m { color: red; } } @media (max-width: 960px) and (min-width: 600px) { .a-t { color: red; } } @media (min-width: 961px) { .a-d { color: red; } }`;

  await run("@responsive { .a { color: red; } }", output);
});

it("reuses existing media queries that match queries from options", async () => {
  const output = `@media (max-width: 600px) { .test { color: blue; } .a-m { color: red; } } @media (max-width: 960px) and (min-width: 600px) { .a-t { color: red; } } @media (min-width: 961px) { .a-d { color: red; } }`;
  await run(
    "@responsive { .a { color: red; } } @media (max-width: 600px) { .test { color: blue; } }",
    output
  );
});

// Expected errors

it("errors with no options", async () => {
  expect(() =>
    postcss([plugin()]).process("", {
      from: undefined
    })
  ).toThrow();
});

it("errors with invalid options", async () => {
  expect(() =>
    postcss([plugin({ invalid: true })]).process("", {
      from: undefined
    })
  ).toThrow();
});

it("errors on non-class rules inside @responsive rule", async () => {
  const input = "@responsive { div { color: blue; } }";
  const result = postcss([plugin(defaultOptions)]).process(input, {
    from: undefined
  });
  expect(() => result.warnings()).toThrow()
});
