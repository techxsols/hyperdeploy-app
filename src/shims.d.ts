declare module '*.vue' {
  import { ComponentOptions } from 'vue';

  const component: ComponentOptions;
  export default component;
}

interface ImportMeta {
  env: {
    VITE_PIMLICO_API_KEY?: string;
    VITE_PK?: string;
  };
}
