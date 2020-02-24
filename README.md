# PostCSS Responsive Query

[PostCSS](https://postcss.org/) plugin that automatically expands rules into media queries.

Input:

```css
@responsive {
  .foo {
    color: red;
  }
}
```

Output:

```css
@media (max-width: 600px) {
  .foo-mobile {
    color: red;
  }
}

@media (max-width: 960px) and (min-width: 600px) {
  .foo-tablet {
    color: red;
  }
}

@media (min-width: 961px) {
  .foo-desktop {
    color: red;
  }
}
```

## Configuration

This plugin requires a `breakpoints` object in options:

```js
breakpoints: {
  mobile: '(max-width: 600px)',
  tablet: '(max-width: 960px) and (min-width: 600px)',
  desktop: '(min-width: 961px)'
}
```

These keys are used as suffixes for the generated classnames, as shown in the example above.

## Usage with Next.js

Read the [Next.js docs about customizing the PostCSS config](https://nextjs.org/docs/advanced-features/customizing-postcss-config#default-behavior) and add `postcss-responsive-query` to your list of plugins.

For example:


```js
// postcss.config.js

module.exports = {
  plugins: [
    'postcss-flexbugs-fixes',
    ['postcss-responsive-query', {
      breakpoints: {
        mobile: '(max-width: 600px)',
        tablet: '(max-width: 960px) and (min-width: 600px)',
        desktop: '(min-width: 961px)'
      }
    }],
    [
      'postcss-preset-env',
      {
        autoprefixer: {
          flexbox: 'no-2009'
        },
        stage: 3,
        features: {
          'custom-properties': false
        }
      }
    ]
  ]
}
```
