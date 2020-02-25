# PostCSS Responsive Query

[PostCSS](https://postcss.org/) plugin that automatically expands rules into media queries.


## Install

```bash
$ yarn add postcss-responsive-query -D
# or
$ npm install post-css-responsive-query --save-dev
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

These keys are used as suffixes for the generated classnames, as shown in the example below.

## Usage

Rules inside of a responsive query will be duplicated into the media queries you specify with a suffix you specify appended to the classname:

```css
/* Input */
@responsive {
  .foo {
    color: red;
  }
}
```

```css
/* Output */
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

**Only class selectors are allowed inside responsive queries.** The following will throw an error:

```css
@responsive {
  /* ERROR, not a class selector */
  div {
    color: red;
  }
}
```

### Responsive Query Parameters

You can pass parameters to the responsive query to indicate what classnames to transform:

```css
/* Input */
@responsive (.bar) {
  .foo.bar + .biz {
    color: red;
  }
}
```

```css
/* Output */
@media (max-width: 600px) {
  .foo.bar-mobile + .biz { /* .foo and .biz classnames are untouched */
    color: red;
  }
}

/* ... */
```

Just like above, you should only use **class selectors inside responsive query parameters**:

```css
/* ERROR, not a class selector */
@responsive (div) {
  /* ... */
}
```

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
