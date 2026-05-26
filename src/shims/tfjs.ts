export interface LayersModel {
  compile: (_config: any) => void;
}

export const layers = {
  dense: (config: any) => ({ type: 'dense', config })
};

export const sequential = (config: any): LayersModel => ({
  compile: (_compileConfig: any) => undefined,
  ...config
});
