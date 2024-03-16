interface EnvironmentVariables {
  alchemyApiKey: string;
  privateKey: string;
}

function useEnv(): EnvironmentVariables {
  const env = (import.meta as ImportMeta).env;
  return {
    alchemyApiKey: env.VITE_ALCHEMY_API_KEY ?? '',
    privateKey: env.VITE_PK ?? '',
  };
}

export default useEnv;
