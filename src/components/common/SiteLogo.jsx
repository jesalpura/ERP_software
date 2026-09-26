import React from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';

export default function SiteLogo({ 
  className = "h-9 w-9", 
  imageClassName = "h-9 w-9 object-cover rounded-xl shadow-md border border-slate-200/50", 
  fallbackBg = "bg-blue-600", 
  fallbackTextColor = "text-white text-lg",
  altText = "Academy Logo"
}) {
  const { websiteConfig } = useSiteConfig();
  const logoUrl = websiteConfig?.logo?.imageUrl || '/logo.png';
  const logoLetter = websiteConfig?.logo?.letter || (websiteConfig?.shortName ? websiteConfig.shortName.charAt(0).toUpperCase() : 'T');

  const [imgError, setImgError] = React.useState(false);

  if (logoUrl && !imgError) {
    return (
      <img 
        src={logoUrl} 
        alt={altText || websiteConfig?.name || 'Academy Logo'} 
        className={imageClassName}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`${className} ${fallbackBg} ${fallbackTextColor} rounded-xl flex items-center justify-center font-bold tracking-tight shadow-md shrink-0 select-none`}>
      {logoLetter}
    </div>
  );
}
