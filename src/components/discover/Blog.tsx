"use client";
import { useMirrorArticles } from "@/hooks/useMirrorArticles";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { formatDateWithOrdinal } from "@/helpers/date";
import { handleImageUrl } from "@/helpers/image";
import Link from "next/link";

export const Blog = () => {
  const { articles, loading, error } = useMirrorArticles();

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-peach-400"></div>
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
    <div className="w-full bg-gradient-to-b from-[#000] to-qacc-gray-dark">
      <div className="w-full max-w-7xl mx-auto px-8 md:px-4 py-12 md:py-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-[42px] md:text-[64px] tracking-wide text-white font-anton uppercase">
            BLOG
          </h1>
          <Link href={`https://mirror.xyz/qacc.eth`} target="_blank">
            <Button
              variant="outline"
              className="px-3 py-2 border-peach-400 text-peach-400 hover:bg-peach-400 hover:text-qacc-black transition-colors text-xs font-medium rounded-lg"
            >
              ALL REPORTS ON MIRROR.XYZ
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {articles.length > 0 && (
          <div className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-14 ">
              {articles.slice(0, 2).map((article) => (
                <Link
                  href={`https://mirror.xyz/qacc.eth/${article.id}`}
                  target="_blank"
                  className="w-full cursor-pointer "
                >
                  <div className="w-full h-[300px] relative overflow-hidden rounded-3xl">
                    <Image
                      src={
                        handleImageUrl(article.imageURI) ||
                        "/images/banners/banner-lg.jpg"
                      }
                      alt={article.title}
                      width={530}
                      height={200}
                      className="w-full rounded-3xl"
                    />
                  </div>
                  <div className="w-full mt-6">
                    <span className="h-[18px] w-fit px-2 py-1 rounded-md bg-[#202020] flex items-center text-white/30 text-[8px] font-bold uppercase mb-2">
                      {article.timestamp
                        ? formatDateWithOrdinal(
                            new Date(article.timestamp * 1000)
                          )
                        : "Unknown date"}
                    </span>

                    <h3 className="text-white text-2xl font-anton uppercase">
                      {article.title}
                    </h3>
                    <p className="text-white text-sm leading-5 mt-2">
                      {article.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
