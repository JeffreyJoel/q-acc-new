"use client";

import React, { useState, useEffect } from 'react';
import { IProject } from '@/types/project.type';
import { fetchAllProjectsData, EnrichedProjectData } from '@/services/projectData.service';
import ProjectsDataTable from './ProjectsDataTable';

interface ProjectsPageClientProps {
  initialProjects: IProject[];
}

const ProjectsPageClient: React.FC<ProjectsPageClientProps> = ({ initialProjects }) => {
  const [enrichedProjects, setEnrichedProjects] = useState<EnrichedProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEnrichedData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Create placeholder data with basic info while loading
        const placeholderData: EnrichedProjectData[] = initialProjects.map(project => ({
          id: project.id!,
          title: project.title || '',
          slug: project.slug || '',
          image: project.image,
          icon: project.icon,
          seasonNumber: project.seasonNumber || 1,
          descriptionSummary: project.descriptionSummary,
          categories: project.categories,
          totalDonatedPOL: 0,
          totalDonatedUSD: 0,
          supporterCount: 0,
          marketCapUSD: 0,
          priceUSD: 0,
          pricePOL: 0,
          isTokenListed: false,
          tokenTicker: project.abc?.tokenTicker,
          tokenAddress: project.abc?.issuanceTokenAddress,
          priceChange24h: 0,
          priceChange7d: 0,
        }));

        // Set placeholder data immediately
        setEnrichedProjects(placeholderData);
        
        // Fetch real data
        const enrichedData = await fetchAllProjectsData(initialProjects);
        setEnrichedProjects(enrichedData);
      } catch (err) {
        console.error('Error loading enriched project data:', err);
        setError('Failed to load project data. Please try again.');
        
        // Keep placeholder data on error
        const fallbackData: EnrichedProjectData[] = initialProjects.map(project => ({
          id: project.id!,
          title: project.title || '',
          slug: project.slug || '',
          image: project.image,
          icon: project.icon,
          seasonNumber: project.seasonNumber || 1,
          descriptionSummary: project.descriptionSummary,
          categories: project.categories,
          totalDonatedPOL: 0,
          totalDonatedUSD: 0,
          supporterCount: 0,
          marketCapUSD: 0,
          priceUSD: 0,
          pricePOL: 0,
          isTokenListed: false,
          tokenTicker: project.abc?.tokenTicker,
          tokenAddress: project.abc?.issuanceTokenAddress,
          priceChange24h: 0,
          priceChange7d: 0,
        }));
        setEnrichedProjects(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    loadEnrichedData();
  }, [initialProjects]);

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2 bg-peach-400 text-black rounded-lg hover:bg-peach-500 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="mb-4 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-neutral-800 rounded-lg border border-neutral-700">
            <div className="w-4 h-4 border-2 border-peach-400 border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-white text-sm">Loading comprehensive project data...</span>
          </div>
        </div>
      )}
      
      <ProjectsDataTable 
        projects={enrichedProjects} 
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProjectsPageClient; 