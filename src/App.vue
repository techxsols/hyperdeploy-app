<template>
  <div id="app">
    <header>
      <AccountButton />
    </header>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import AccountButton from '@/components/AccountButton.vue';
</script>

<style>
:root {
  --font-sans: -apple-system, 'BlinkMacSystemFont', avenir next, avenir,
    segoe ui, helvetica neue, helvetica, 'Ubuntu', roboto, noto, arial,
    sans-serif;
  --font-serif: 'Iowan Old Style', 'Apple Garamond', 'Baskerville',
    'Times New Roman', 'Droid Serif', 'Times', 'Source Serif Pro', serif,
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  --font-mono: 'Menlo', 'Consolas', 'Monaco', 'Liberation Mono',
    'Lucida Console', monospace;
  --color-text-primary: #f0f0f0;
  --color-border: #1c1c1c;
  --color-border-light: #2c2c2c;
  --color-background: #060606;
  --color-background-secondary: #14161b;
}

body {
  background: var(--color-background);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}

header {
  display: flex;
  justify-content: end;
}

/* Reset */

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
}

img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}

input,
button,
textarea,
select {
  font: inherit;
}

p,
h1,
h2,
h3,
h4,
h5,
h6 {
  overflow-wrap: break-word;
}

#app {
  isolation: isolate;
}
</style>
