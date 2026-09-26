import React, { createContext, useContext, useState } from 'react';
import { siteConfig as defaultSiteConfig } from '../config/siteConfig';

const SiteConfigContext = createContext(null);

const STORAGE_KEY = 'erp_dynamic_site_config';

export function SiteConfigProvider({ children }) {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults in case of missing keys
        return {
          website: { ...defaultSiteConfig.website, ...(parsed.website || {}) },
          certificate: { ...defaultSiteConfig.certificate, ...(parsed.certificate || {}) },
          pdf: { ...defaultSiteConfig.pdf, ...(parsed.pdf || {}) }
        };
      }
    } catch (e) {
      console.error('Failed to load site config from localStorage:', e);
    }
    return defaultSiteConfig;
  });

  const updateWebsiteConfig = (newWebsiteValues) => {
    setConfig((prev) => {
      const updatedWebsite = {
        ...prev.website,
        ...newWebsiteValues,
        logo: {
          ...prev.website.logo,
          ...(newWebsiteValues.logo || {}),
          letter: newWebsiteValues.logoLetter 
            ? newWebsiteValues.logoLetter 
            : newWebsiteValues.shortName 
              ? newWebsiteValues.shortName.charAt(0).toUpperCase() 
              : prev.website.logo?.letter || 'T'
        }
      };

      const updatedCert = {
        ...prev.certificate,
        institutionName: updatedWebsite.name ? updatedWebsite.name.toUpperCase() : prev.certificate.institutionName,
        serialPrefix: updatedWebsite.shortName ? `${updatedWebsite.shortName.toUpperCase()}-CERT-` : prev.certificate.serialPrefix,
        ...(newWebsiteValues.certificate || {})
      };

      const updatedPdf = {
        ...prev.pdf,
        headerTitle: updatedWebsite.shortName ? `${updatedWebsite.shortName.toUpperCase()} ACADEMY` : prev.pdf.headerTitle,
        tagline: `${updatedWebsite.name} • Campus`,
        financeDesk: `${updatedWebsite.shortName} Finance & Accounts Department`,
        academicDesk: `${updatedWebsite.shortName} Academic Cell`,
        auditDesk: `${updatedWebsite.shortName} Operations Audit Cell`,
        verificationDisclaimer: `This is a computer-generated official document. Verified by ${updatedWebsite.shortName} Administration. No physical signature required.`,
        footerNotice: `Official Institutional Document • Generated via ${updatedWebsite.name} ERP Portal`,
        ...(newWebsiteValues.pdf || {})
      };

      const nextState = {
        website: updatedWebsite,
        certificate: updatedCert,
        pdf: updatedPdf
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      } catch (e) {
        console.error('Failed to save site config:', e);
      }

      return nextState;
    });
  };

  const resetSiteConfig = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    setConfig(defaultSiteConfig);
  };

  return (
    <SiteConfigContext.Provider value={{ 
      siteConfig: config, 
      websiteConfig: config.website, 
      certificateConfig: config.certificate, 
      pdfConfig: config.pdf, 
      updateWebsiteConfig, 
      resetSiteConfig 
    }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  if (!context) {
    return {
      siteConfig: defaultSiteConfig,
      websiteConfig: defaultSiteConfig.website,
      certificateConfig: defaultSiteConfig.certificate,
      pdfConfig: defaultSiteConfig.pdf,
      updateWebsiteConfig: () => {},
      resetSiteConfig: () => {}
    };
  }
  return context;
}
