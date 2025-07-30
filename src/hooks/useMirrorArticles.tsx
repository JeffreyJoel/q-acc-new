import { MirrorArticle } from '@/services/mirror.service';
import { useState, useEffect } from 'react';

export const useMirrorArticles = () => {
  const [articles, setArticles] = useState<MirrorArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const loadArticles = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/mirror`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }

        const data = await response.json();
        setArticles(data);
      } catch (err) {
        setError('Failed to load articles');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  return { articles, loading, error };
};