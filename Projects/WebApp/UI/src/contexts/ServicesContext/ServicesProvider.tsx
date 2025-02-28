// ServicesContainer.tsx
import React, { useState, useEffect, ReactNode } from "react";
import { AsymmetricEncryption } from "../../services/AsymmetricEncryption";
import { IServices, ServicesContext } from "./ServicesContext";

interface ServicesProviderProps {
  children: ReactNode;
}

export const ServicesProvider: React.FC<ServicesProviderProps> = ({ children }) => {
  const [services, setServices] = useState<IServices | null>(null);

  useEffect(() => {
    (async () => {
      const encryptionService = await AsymmetricEncryption.New();
      // Initialize other services here if needed.

      // Since these services are created once and never change, they remain static.
      setServices({ encryptionService });
    })();
  }, []);

  if (!services) {
    return <div>Loading services...</div>;
  }

  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
};
