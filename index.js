const postcss = require("postcss");

const create = (oldRule, name) => {
  const rule = oldRule.clone();
  rule.selector = `${oldRule.selector}${name ? `-${name}` : ""}`;
  return rule;
};

const createMediaQuery = params => {
  const rule = postcss.atRule();
  rule.name = "media";
  rule.params = params;
  return rule;
};

module.exports = postcss.plugin("postcss-responsive-query", (opts = {}) => {
  const { breakpoints } = opts;

  if (!breakpoints) {
    throw new Error("Breakpoints must be specified in the plugin options");
  }

  return root => {
    const hasResponsiveAtRule = root.some(
      rule => rule.type === "atrule" && rule.name === "responsive"
    );

    // No responsive rules, no point continuing
    if (!hasResponsiveAtRule) {
      return;
    }

    const rules = Object.values(breakpoints).map(breakpoint => {
      return createMediaQuery(breakpoint);
    });

    // Look for existing media queries that we could reuse
    root.walkAtRules("media", mediaQuery => {
      const allBpParams = Object.values(breakpoints);
      let i = 0;

      for (const bpParams of allBpParams) {
        if (mediaQuery.params === bpParams) {
          rules[i] = mediaQuery;
          break;
        }

        i++;
      }
    });

    root.walkAtRules("responsive", atRule => {
      atRule.walkRules(rule => {
        if (!rule.selector.startsWith(".")) {
          throw atRule.error(
            `Non-class rule detected inside @responsive rule: "${rule.selector}"`,
            {
              plugin: "postcss-responsive-query"
            }
          );
        }

        Object.keys(breakpoints).forEach((bpName, i) => {
          rules[i].append(create(rule, bpName));
        });
      });

      // Remove the @responsive rule (invalid CSS)
      atRule.remove();
    });

    // Append all mediaQueries to the stylesheet
    root.append(...rules);
  };
});
