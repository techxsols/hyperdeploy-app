interface EnvironmentVariables {
  pimlicoApiKey: string;
  privateKey: string;
}

function useEnv(): EnvironmentVariables {
  const env = (import.meta as ImportMeta).env;
  return {
    pimlicoApiKey: env.VITE_PIMLICO_API_KEY ?? '',
    privateKey: env.VITE_PK ?? '',
  };
}

export default useEnv;
