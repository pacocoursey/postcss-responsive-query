const postcss = require("postcss");

const create = (oldRule, selectors, name) => {
  const rule = oldRule.clone();

  if (selectors) {
    for (const selector of selectors) {
      rule.selector = rule.selector.replace(selector, selector + `-${name}`);
    }
    rule.selector = rule.selector;
  } else {
    rule.selector = `${rule.selector}${name ? `-${name}` : ""}`;
  }
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

  return (root, result) => {
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
      const selectors = atRule.params
        ? atRule.params
            .replace("(", "")
            .replace(")", "")
            .split(",")
            .map(s => s.trim())
        : null;

      if (selectors && selectors.some(s => !s.startsWith("."))) {
        throw atRule.error(
          `Non-class rule specified in @responsive rule parameters: "${atRule.params}"`,
          {
            plugin: "postcss-responsive-query"
          }
        );
      }

      atRule.walkRules(rule => {
        if (!rule.selector.startsWith(".")) {
          throw atRule.error(
            `Non-class rule detected inside @responsive rule: "${rule.selector}"`,
            {
              plugin: "postcss-responsive-query"
            }
          );
        }

        if (selectors) {
          const hasMatch = selectors.some(s => rule.selector.includes(s));

          // No matching rules in this @responsive rule, move on
          if (!hasMatch) {
            rule.warn(
              result,
              `Rule with selector "${rule.selectors}" is invalid under responsive query "${atRule.params}"`
            );
            return;
          }
        }

        Object.keys(breakpoints).forEach((bpName, i) => {
          rules[i].append(create(rule, selectors, bpName));
        });
      });

      // Remove the @responsive rule (invalid CSS)
      atRule.remove();
    });

    // Append all mediaQueries to the stylesheet
    root.append(...rules);
  };
});
