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

it("does nothing when no @responsive queries exist", async () => {
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

it("transforms selectors specified in responsive query params", async () => {
  const input = `@responsive (.test) { .foo.test + .bar { color: blue; } }`;
  const output = `@media (max-width: 600px) { .foo.test-m + .bar { color: blue; } } @media (max-width: 960px) and (min-width: 600px) { .foo.test-t + .bar { color: blue; } } @media (min-width: 961px) { .foo.test-d + .bar { color: blue; } }`;
  await run(input, output);
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

it("errors on non-class rules inside @responsive query", async () => {
  const input = "@responsive { div { color: blue; } }";
  const result = postcss([plugin(defaultOptions)]).process(input, {
    from: undefined
  });
  expect(() => result.warnings()).toThrow();
});

it("errors with non-class parameters of @responsive query", async () => {
  const input = "@responsive (div) { .test { color: blue; } }";
  expect(() => {
    const result = postcss([plugin(defaultOptions)]).process(input, {
      from: undefined
    });
    console.log(result.css)
  }).toThrow();
});

// Expected warnings

it("warns on unmatch responsive query params", async () => {
  const input = "@responsive (.test) { .nope { color: blue; } }";
  const result = postcss([plugin(defaultOptions)]).process(input, {
    from: undefined
  });
  expect(result.warnings()).toHaveLength(1);
});
