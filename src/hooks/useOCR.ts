
import { useState, useCallback } from 'react';
import { createWorker } from 'tesseract.js';
import { localAI } from '../lib/localAI';

export const useOCR = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanImage = useCallback(async (file: File, category: 'math' | 'education' | 'business' | 'general' = 'math') => {
    setLoading(true);
    setError(null);
    
    try {
      const reader = new FileReader();
      const textPromise = new Promise<string>((resolve, reject) => {
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          try {
            const worker = await createWorker();
            await worker.loadLanguage('eng+ben');
            await worker.initialize('eng+ben');
            const { data: { text } } = await worker.recognize(base64);
            await worker.terminate();
            resolve(text);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const extractedText = await textPromise;
      const aiResponse = await localAI.process(extractedText, category);
      setLoading(false);
      return aiResponse;
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Scan failed');
      return null;
    }
  }, []);

  return { scanImage, loading, error };
};
