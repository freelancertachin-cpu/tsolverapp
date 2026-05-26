const readFileName = (input: any) => {
  if (input && typeof input === 'object' && 'name' in input) return input.name;
  return 'uploaded image';
};

export const recognize = async (input: any, _languages = 'eng') => ({
  data: {
    text: `OCR placeholder for ${readFileName(input)}. Connect Firebase Functions / OCR API for production-grade extraction.`
  }
});

export const createWorker = async (_options?: any) => ({
  loadLanguage: async (_languages: string) => undefined,
  initialize: async (_languages: string) => undefined,
  recognize,
  terminate: async () => undefined
});

export default { recognize, createWorker };
