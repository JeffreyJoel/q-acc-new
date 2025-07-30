'use client';
import { useMirrorArticles } from '@/hooks/useMirrorArticles';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ExternalLink } from 'lucide-react';

export const Blog = () => {
  const { articles, loading, error } = useMirrorArticles();

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-red-500">
        Error loading blog posts: {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-bold text-white">BLOG</h1>
        <Button 
          variant="outline" 
          className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors"
        >
          ALL REPORTS ON MIRROR.XYZ
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </div>


      {/* Mirror Articles (if any) */}
      {articles.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.slice(0, 2).map((article) => (
              <Card key={article.id} className="bg-gray-900 border-gray-800 hover:border-orange-500 transition-colors">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2 overflow-hidden text-ellipsis whitespace-nowrap">
                    {article.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                    {article.body.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {article.timestamp ? new Date(article.timestamp * 1000).toLocaleDateString() : 'Unknown date'}
                    </span>
                    <Button variant="ghost" size="sm" className="text-orange-500 hover:text-orange-400">
                      Read More
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
